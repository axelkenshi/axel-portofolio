/* global CMS */
CMS.registerPreviewStyle('/styles/callouts.css');

// ===== Adapter fromBlock =====
// Sveltia memanggil fromBlock dengan hasil pattern.exec (RegExpMatchArray).
// Named group ada di match.groups. Adapter ini meneruskan groups ke fromBlock,
// sehingga semua fromBlock di file ini cukup menerima objek groups biasa.
// Jika Sveltia suatu saat langsung mengirim groups, adapter tetap berfungsi.
const _register = CMS.registerEditorComponent.bind(CMS);
const _shapeLogged = new Set();

CMS.registerEditorComponent = (def) => {
  if (def.fromBlock) {
    const original = def.fromBlock;
    def.fromBlock = (match) => {
      const groups = (match && match.groups) || match || {};

      // Diagnosa: sekali per komponen, hanya di browser. Boleh dihapus setelah masalah selesai.
      if (typeof window !== 'undefined' && !_shapeLogged.has(def.id)) {
        _shapeLogged.add(def.id);
        console.info(
          `[${def.id}] fromBlock menerima:`,
          match && match.groups ? 'RegExpMatchArray' : 'objek groups',
          groups,
        );
      }

      try {
        return original(groups);
      } catch (err) {
        console.error(`[${def.id}] fromBlock gagal:`, err, match);
        return {};
      }
    };
  }
  _register(def);
};

// ===== Helper bersama =====
// Newline ditulis sebagai &#10; agar nilai multi-baris (rumus, diagram) tidak
// memutus blok HTML di markdown dengan baris kosong.
const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '&#10;');

const unesc = (s = '') =>
  String(s)
    .replace(/&#10;/g, '\n')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');

// Blok HTML diberi baris kosong di sekelilingnya agar tidak menempel ke paragraf
const asBlock = (render) => (fields) => {
  const html = render(fields);
  return html ? `\n\n${html}\n\n` : '';
};

// Penanda blok memakai class CSS. Class tetap ada walaupun HTML dinormalisasi.
const markerPattern = (className) =>
  new RegExp(
    `(?<html><(?<tag>[a-z]+)\\b[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\k<tag>>)`,
  );

// Nilai atribut dengan nama tertentu. Tidak bergantung pada urutan atribut.
const attrOf = (html = '', name) => {
  const match = html.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? unesc(match[1]) : '';
};

// Teks di dalam elemen yang memiliki class tertentu
const textOf = (html = '', className) => {
  const match = html.match(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"[^>]*>([^<]*)<`));
  return match ? unesc(match[1]) : '';
};

// Sumber rumus dan diagram disimpan dalam base64. Base64 hanya berisi A-Z a-z 0-9 + / =,
// sehingga tidak terpengaruh escape backslash dan newline yang dilakukan editor saat menyimpan.
const b64encode = (s = '') => {
  const bytes = new TextEncoder().encode(String(s));
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
};

const b64decode = (s = '') => {
  if (!s) return '';
  const bin = atob(s);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

// Validasi URL untuk field wajib. Format: [regex, pesan]
const URL_PATTERN = [/^https?:\/\/\S+$/, 'URL harus diawali https://'];
const YT_PATTERN = [
  /^(https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/\S+|[\w-]{11})$/,
  'Isi link YouTube atau ID video 11 karakter',
];

// Satu pintu registrasi: toBlock memakai render (HTML yang disimpan).
// toPreview memakai preview jika ada, supaya editor bisa menampilkan sumber mentah.
const defineBlock = ({ id, label, icon, fields, marker, pattern, render, preview, fromBlock }) =>
  CMS.registerEditorComponent({
    id,
    label,
    icon,
    trigger: 'button',
    fields,
    pattern: pattern ?? markerPattern(marker),
    fromBlock,
    toBlock: asBlock(render),
    toPreview: preview ?? render,
  });

// ===== 1. Callout ala github (pola acuan, tidak diubah) =====
CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout',
  icon: 'info',
  trigger: 'button',
  fields: [
    { name: 'type', label: 'Tipe', widget: 'select',
      options: ['tip', 'note', 'alert', 'important', 'dangerous'], default: 'tip' },
    { name: 'body', label: 'Isi', widget: 'text' },
  ],
  pattern: /<div class="callout" data-type="(?<type>tip|note|alert|important|dangerous)">\s*(?<body>[\s\S]*?)\s*<\/div>/,
  toBlock: ({ type = 'tip', body = '' }) =>
    `<div class="callout" data-type="${type}">\n\n${body}\n\n</div>`,
});

// ===== 2. YouTube =====
// Ambil ID 11 karakter dari berbagai format link YouTube, atau dari ID saja
const YT_ID = (input = '') => {
  const raw = String(input).trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const match = raw.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return match ? match[1] : '';
};

defineBlock({
  id: 'youtube',
  label: 'YouTube',
  icon: 'smart_display',
  marker: 'embed-youtube',
  fields: [{ name: 'url', label: 'Link YouTube (share)', widget: 'string', type: 'url', pattern: YT_PATTERN }],
  render: ({ url = '' } = {}) => {
    const id = YT_ID(url);
    return id
      ? `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${id}" loading="lazy" allowfullscreen></iframe></div>`
      : '';
  },
  fromBlock: ({ html = '' } = {}) => {
    const match = attrOf(html, 'src').match(/\/embed\/([\w-]{11})/);
    return { url: match ? `https://youtu.be/${match[1]}` : '' };
  },
});

// ===== 3. Gambar CDN (caption dan kredit opsional) =====
const renderImage = ({ src = '', alt = '', caption = '', credit = '', creditUrl = '' } = {}) => {
  if (!src) return '';

  const creditHtml = creditUrl
    ? `<a href="${esc(creditUrl)}" target="_blank" rel="noopener noreferrer">${esc(credit)}</a>`
    : esc(credit);

  const figcaption =
    caption || credit
      ? `<figcaption><span class="caption-text">${esc(caption)}</span><span class="credit">${creditHtml}</span></figcaption>`
      : '';

  return `<figure class="embed-image"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">${figcaption}</figure>`;
};

defineBlock({
  id: 'cdn-image',
  label: 'Gambar CDN',
  icon: 'image',
  marker: 'embed-image',
  fields: [
    { name: 'src', label: 'URL gambar (CDN)', widget: 'string', type: 'url', pattern: URL_PATTERN },
    { name: 'alt', label: 'Teks alternatif', widget: 'string', required: false },
    { name: 'caption', label: 'Caption (opsional)', widget: 'string', required: false },
    { name: 'credit', label: 'Kredit / nama sumber (opsional)', widget: 'string', required: false },
    { name: 'creditUrl', label: 'URL kredit (opsional)', widget: 'string', type: 'url', required: false },
  ],
  render: renderImage,
  fromBlock: ({ html = '' } = {}) => {
    const credit = html.match(/\bcredit\b[^>]*>(?:<a\b[^>]*>)?([^<]*)/);
    return {
      src: attrOf(html, 'src'),
      alt: attrOf(html, 'alt'),
      caption: textOf(html, 'caption-text'),
      credit: credit ? unesc(credit[1]) : '',
      creditUrl: attrOf(html, 'href'),
    };
  },
});

// ===== 4. Iframe eksternal =====
defineBlock({
  id: 'iframe-embed',
  label: 'Iframe eksternal',
  icon: 'web',
  marker: 'embed-iframe',
  fields: [
    { name: 'src', label: 'URL halaman (iframe)', widget: 'string', type: 'url', pattern: URL_PATTERN },
    { name: 'height', label: 'Tinggi (px)', widget: 'number', value_type: 'int', min: 100, max: 2000, default: 480 },
  ],
  render: ({ src = '', height = 480 } = {}) => {
    if (!src) return '';
    const h = Number(height) || 480;
    return `<div class="embed-iframe"><iframe src="${esc(src)}" height="${h}" loading="lazy" allowfullscreen></iframe></div>`;
  },
  fromBlock: ({ html = '' } = {}) => ({
    src: attrOf(html, 'src'),
    height: Number(attrOf(html, 'height')) || 480,
  }),
});

// ===== 5. Grid gambar CDN (2 sampai 4 gambar) =====
// Jumlah kolom diambil dari jumlah gambar. Tidak ada field cols terpisah,
// sehingga tidak mungkin ada nilai yang tidak cocok dengan jumlah gambar.
const renderGrid = ({ images = [] } = {}) => {
  const items = (images || []).filter((img) => img && img.url).slice(0, 4);
  if (items.length < 2) return '';

  const figures = items
    .map((img) => `<figure><img src="${esc(img.url)}" alt="${esc(img.alt ?? '')}" loading="lazy"></figure>`)
    .join('');

  return `<div class="embed-grid" data-cols="${items.length}">${figures}</div>`;
};

defineBlock({
  id: 'cdn-grid',
  label: 'Grid Gambar CDN',
  icon: 'grid_view',
  marker: 'embed-grid',
  fields: [
    {
      name: 'images',
      label: 'Gambar (2 sampai 4)',
      widget: 'list',
      min: 2,
      max: 4,
      fields: [
        { name: 'url', label: 'URL gambar (CDN)', widget: 'string', type: 'url', pattern: URL_PATTERN },
        { name: 'alt', label: 'Teks alternatif', widget: 'string', required: false },
      ],
    },
  ],
  render: renderGrid,
  fromBlock: ({ html = '' } = {}) => ({
    images: Array.from(html.matchAll(/<img\b[^>]*>/g), (m) => ({
      url: attrOf(m[0], 'src'),
      alt: attrOf(m[0], 'alt'),
    })),
  }),
});

// ===== 6. Kartu tautan =====
const renderLinkCard = ({ title = '', description = '', url = '', image = '' } = {}) => {
  if (!title || !/^https?:\/\//.test(url)) return '';

  const cleanDesc = String(description).replace(/\s*\n\s*/g, ' ').trim();
  const thumb = image ? `<img class="link-thumb" src="${esc(image)}" alt="" loading="lazy">` : '';

  return `<a class="embed-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="link-body"><span class="link-title">${esc(title)}</span><span class="link-desc">${esc(cleanDesc)}</span></span>${thumb}</a>`;
};

defineBlock({
  id: 'link-card',
  label: 'Kartu tautan',
  icon: 'link',
  marker: 'embed-link',
  fields: [
    { name: 'title', label: 'Judul', widget: 'string' },
    { name: 'description', label: 'Deskripsi (opsional)', widget: 'text', required: false },
    { name: 'url', label: 'URL tujuan (https://...)', widget: 'string', type: 'url', pattern: URL_PATTERN },
    { name: 'image', label: 'URL gambar pratinjau (opsional)', widget: 'string', type: 'url', required: false },
  ],
  render: renderLinkCard,
  fromBlock: ({ html = '' } = {}) => ({
    url: attrOf(html, 'href'),
    title: textOf(html, 'link-title'),
    description: textOf(html, 'link-desc'),
    image: attrOf(html, 'src'),
  }),
});

// ===== 7. Terminal =====
const renderTerminal = ({ command = '', output = '' } = {}) => {
  const cmd = String(command).trim();
  if (!cmd) return '';

  const cleanOutput = String(output).trim();
  const outHtml = cleanOutput ? `\n<span class="term-out">${esc(cleanOutput)}</span>` : '';

  return `<pre class="terminal"><span class="term-cmd"><span class="term-prompt">$</span> ${esc(cmd)}</span>${outHtml}</pre>`;
};

defineBlock({
  id: 'terminal',
  label: 'Terminal',
  icon: 'terminal',
  marker: 'terminal',
  fields: [
    { name: 'command', label: 'Perintah (tanpa prompt $)', widget: 'string' },
    { name: 'output', label: 'Output (opsional)', widget: 'text', required: false },
  ],
  render: renderTerminal,
  fromBlock: ({ html = '' } = {}) => {
    const cmd = html.match(/\bterm-cmd\b[^>]*>\s*<span[^>]*>\$<\/span>\s*([^<]*)/);
    return {
      command: cmd ? unesc(cmd[1]).trim() : '',
      output: textOf(html, 'term-out'),
    };
  },
});

// ===== 8. Detail yang bisa dilipat =====
// Pola khusus karena isi (body) adalah markdown dan dibaca apa adanya
const renderDetails = ({ summary = '', body = '', open = false } = {}) => {
  const cleanBody = String(body).trim();
  if (!cleanBody) return '';

  return `<details class="fold"${open ? ' open' : ''}>\n<summary>${esc(summary || 'Selengkapnya')}</summary>\n\n${cleanBody}\n\n</details>`;
};

defineBlock({
  id: 'details',
  label: 'Detail (bisa dilipat)',
  icon: 'unfold_more',
  pattern: /<details\b[^>]*\bclass="[^"]*\bfold\b[^"]*"(?<attrs>[^>]*)>\s*<summary>(?<summary>[^<]*)<\/summary>(?<body>[\s\S]*?)<\/details>/,
  fields: [
    { name: 'summary', label: 'Judul ringkas', widget: 'string' },
    { name: 'body', label: 'Isi (markdown)', widget: 'text' },
    { name: 'open', label: 'Terbuka secara default', widget: 'boolean', default: false, required: false },
  ],
  render: renderDetails,
  fromBlock: ({ attrs = '', summary = '', body = '' } = {}) => ({
    open: /\bopen\b/.test(attrs),
    summary: unesc(summary),
    body: body.trim(),
  }),
});

// ===== 9. Video dari CDN =====
const renderVideo = ({ src = '', poster = '', caption = '' } = {}) => {
  if (!src) return '';

  return `<figure class="embed-video"><video src="${esc(src)}" poster="${esc(poster)}" controls preload="metadata" playsinline></video><figcaption class="caption-text">${esc(caption)}</figcaption></figure>`;
};

defineBlock({
  id: 'cdn-video',
  label: 'Video CDN',
  icon: 'movie',
  marker: 'embed-video',
  fields: [
    { name: 'src', label: 'URL video (CDN, .mp4 atau .webm)', widget: 'string', type: 'url', pattern: URL_PATTERN },
    { name: 'poster', label: 'URL poster / thumbnail (opsional)', widget: 'string', type: 'url', required: false },
    { name: 'caption', label: 'Caption (opsional)', widget: 'string', required: false },
  ],
  render: renderVideo,
  fromBlock: ({ html = '' } = {}) => ({
    src: attrOf(html, 'src'),
    poster: attrOf(html, 'poster'),
    caption: textOf(html, 'caption-text'),
  }),
});

// ===== 10. Kode dengan nama file (fence markdown, diproses Shiki saat build) =====
const FENCE_CHAR = '\x60';

// Panjang pagar minimal 3 dan selalu lebih panjang dari deretan backtick terpanjang di dalam kode
const fenceFor = (code) => {
  const runs = code.match(/\x60+/g) || [];
  const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
  return FENCE_CHAR.repeat(Math.max(3, longest + 1));
};

// Kode tidak di-escape karena markdown menampilkan isi fence apa adanya
const renderCodeFile = ({ filename = '', language = 'text', code = '' } = {}) => {
  if (!code) return '';
  const fence = fenceFor(code);
  const title = filename ? ` title="${filename.replace(/"/g, "'")}"` : '';
  return `${fence}${language}${title}\n${code.replace(/\n$/, '')}\n${fence}`;
};

// Pratinjau di editor memakai HTML agar tampilan konsisten dengan blok lain
const renderCodePreview = ({ filename = '', language = 'text', code = '' } = {}) => {
  if (!code) return '';
  return `<pre class="code-file" data-file="${esc(filename)}"><code class="language-${esc(language)}">${esc(code.replace(/\n$/, ''))}</code></pre>`;
};

CMS.registerEditorComponent({
  id: 'code-file',
  label: 'Kode dengan nama file',
  icon: 'code',
  trigger: 'button',
  fields: [
    { name: 'filename', label: 'Nama file (contoh: astro.config.mjs)', widget: 'string', required: false },
    { name: 'language', label: 'Bahasa (contoh: ts, astro, bash)', widget: 'string', default: 'ts' },
    { name: 'code', label: 'Kode', widget: 'text' },
  ],
  // Pagar pembuka harus didahului baris kosong (atau awal dokumen), seperti yang dihasilkan asBlock.
  // Tanpa ini, pagar penutup blok lain bisa salah dikenali sebagai pembuka.
  pattern: /(?<=^|\n\n)(?<fence>\x60{3,})(?!diff[ \n])(?<language>[\w-]*)(?: title="(?<filename>[^"]*)")?\n(?<code>[\s\S]*?)\n\k<fence>(?!\x60)/,
  fromBlock: ({ filename = '', language = '', code = '' } = {}) => ({
    filename,
    language: language || 'text',
    code,
  }),
  toBlock: asBlock(renderCodeFile),
  toPreview: renderCodePreview,
});

// ===== 11. Sebelum dan sesudah (diff sederhana) =====
// Baris "-" untuk sebelum dan "+" untuk sesudah. Baris konteks tidak dimodelkan.
const toLines = (s = '') =>
  String(s).trim() === '' ? [] : String(s).replace(/\r/g, '').replace(/\n+$/, '').split('\n');

// Output markdown: semua baris sebelum dulu, lalu semua baris sesudah
const renderDiff = ({ filename = '', before = '', after = '' } = {}) => {
  const body = [
    ...toLines(before).map((line) => `- ${line}`),
    ...toLines(after).map((line) => `+ ${line}`),
  ].join('\n');
  if (!body) return '';

  const fence = fenceFor(body);
  const title = filename ? ` title="${filename.replace(/"/g, "'")}"` : '';
  return `${fence}diff${title}\n${body}\n${fence}`;
};

const renderDiffPreview = ({ filename = '', before = '', after = '' } = {}) => {
  const rows = [
    ...toLines(before).map((line) => `<span class="diff-del">- ${esc(line)}</span>`),
    ...toLines(after).map((line) => `<span class="diff-add">+ ${esc(line)}</span>`),
  ];
  if (!rows.length) return '';

  return `<pre class="code-diff" data-file="${esc(filename)}"><code>${rows.join('\n')}</code></pre>`;
};

// Membaca isi fence menjadi dua teks: sebelum (-) dan sesudah (+)
const parseDiffBody = (body = '') => {
  const before = [];
  const after = [];

  body.split('\n').forEach((line) => {
    // "-" dan "+" tanpa spasi muncul jika editor membuang spasi di akhir baris kosong
    if (line === '-' || line.startsWith('- ')) before.push(line.slice(2));
    else if (line === '+' || line.startsWith('+ ')) after.push(line.slice(2));
  });

  return { before: before.join('\n'), after: after.join('\n') };
};

CMS.registerEditorComponent({
  id: 'code-diff',
  label: 'Sebelum dan sesudah (diff)',
  icon: 'difference',
  trigger: 'button',
  fields: [
    { name: 'filename', label: 'Nama file (opsional)', widget: 'string', required: false },
    { name: 'before', label: 'Sebelum', widget: 'text', required: false },
    { name: 'after', label: 'Sesudah', widget: 'text', required: false },
  ],
  pattern: /(?<=^|\n\n)(?<fence>\x60{3,})diff(?: title="(?<filename>[^"]*)")?\n(?<body>[\s\S]*?)\n\k<fence>(?!\x60)/,
  fromBlock: ({ filename = '', body = '' } = {}) => ({
    filename,
    ...parseDiffBody(body),
  }),
  toBlock: asBlock(renderDiff),
  toPreview: renderDiffPreview,
});

// ===== 12. Rumus LaTeX (KaTeX, dirender di browser) =====
// Sumber disimpan base64 di data-tex-b64. Skrip /js/blocks.js merendernya dengan KaTeX dari /vendor/katex/.
const renderMath = ({ tex = '' } = {}) => {
  const src = String(tex).trim();
  if (!src) return '';
  return `<div class="math-block" data-tex-b64="${b64encode(src)}"></div>`;
};

// Pratinjau di editor menampilkan sumber mentah, karena KaTeX tidak berjalan di admin
const previewMath = ({ tex = '' } = {}) => {
  const src = String(tex).trim();
  return src ? `<pre class="math-preview"><code>${esc(src)}</code></pre>` : '';
};

defineBlock({
  id: 'math',
  label: 'Rumus LaTeX',
  icon: 'functions',
  marker: 'math-block',
  fields: [{ name: 'tex', label: 'Rumus LaTeX (tanpa tanda $)', widget: 'text' }],
  render: renderMath,
  preview: previewMath,
  fromBlock: ({ html = '' } = {}) => ({ tex: b64decode(attrOf(html, 'data-tex-b64')) }),
});

// ===== 13. Diagram Mermaid (dirender di browser) =====
// Sumber disimpan base64 di data-src-b64. Skrip /js/blocks.js memanggil mermaid dari /vendor/mermaid/.
const renderMermaid = ({ source = '' } = {}) => {
  const src = String(source).trim();
  if (!src) return '';
  return `<div class="mermaid-block" data-src-b64="${b64encode(src)}"></div>`;
};

const previewMermaid = ({ source = '' } = {}) => {
  const src = String(source).trim();
  return src ? `<pre class="mermaid-preview"><code>${esc(src)}</code></pre>` : '';
};

defineBlock({
  id: 'mermaid',
  label: 'Diagram Mermaid',
  icon: 'account_tree',
  marker: 'mermaid-block',
  fields: [{ name: 'source', label: 'Kode Mermaid', widget: 'text' }],
  render: renderMermaid,
  preview: previewMermaid,
  fromBlock: ({ html = '' } = {}) => ({ source: b64decode(attrOf(html, 'data-src-b64')) }),
});

CMS.init();
