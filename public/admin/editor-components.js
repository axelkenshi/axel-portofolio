/* global CMS */
CMS.registerPreviewStyle('/styles/callouts.css');

// ===== Adapter fromBlock =====
// Sveltia calls fromBlock with the result pattern.exec(RegExpMatchArray).
// Named groups are in match.groups. This adapter passes groups to fromBlock,
// so that all fromBlocks in this file simply accept regular groups objects.
// If Sveltia at any time directly sends groups, the adapter still functions.
const _register = CMS.registerEditorComponent.bind(CMS);
const _shapeLogged = new Set();

CMS.registerEditorComponent = (def) => {
  if (def.fromBlock) {
    const original = def.fromBlock;
    def.fromBlock = (match) => {
      const groups = (match && match.groups) || match || {};

      // Diagnosa: sekali per komponen, hanya di browser. Boleh dihapus setelah masalah selesai.
      // if (typeof window !== 'undefined' && !_shapeLogged.has(def.id)) {
      //   _shapeLogged.add(def.id);
      //   console.info(
      //     `[${def.id}] fromBlock menerima:`,
      //     match && match.groups ? 'RegExpMatchArray' : 'objek groups',
      //     groups,
      //   );
      // }

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
// Newline ditulis sebagai &#10; agar nilai multi-baris (rumus, diagram) tidak memutus blok HTML di markdown dengan baris kosong.
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
  icon: 'code_blocks',
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

// ========== EXPERIMENTAL FEATURE CHART SVG GENERATOR ============

// ===== 14. Grafik koordinat 2D (titik, garis, kurva, sumbu) =====
// SVG statis dibuat saat disimpan. Tidak butuh library dan tidak butuh JS di browser.
const PLOT_W = 420;
const PLOT_H = 420;
const PLOT_PAD = 40;

// Membaca baris "a, b[, label]". cols = jumlah angka wajib di awal baris.
const parseRows = (text = '', cols) =>
  String(text)
    .split('\n')
    .flatMap((line) => {
      const cells = line.split(',').map((v) => v.trim());
      const head = cells.slice(0, cols);
      if (head.length < cols || head.some((v) => v === '' || !Number.isFinite(Number(v)))) return [];
      return [[...head.map(Number), cells.slice(cols).join(', ')]];
    });

// ----- Parser ekspresi aman untuk kurva -----
// Hanya angka, x, operator + - * / ^, tanda kurung, dan fungsi whitelist.
// Tidak memakai eval atau new Function.
const SAFE_FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp,
  log: Math.log, ln: Math.log, pi: Math.PI, e: Math.E,
};

const tokenize = (src) => {
  const tokens = [];
  const re = /\s*(\d+\.?\d*|[a-zA-Z]+|[-+*/^(),])/y;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) {
      if (src.slice(pos).trim() === '') break;
      throw new Error(`karakter tidak dikenal: ${src.slice(pos)}`);
    }
    tokens.push(m[1]);
    pos = re.lastIndex;
  }
  return tokens;
};

const compileExpr = (src) => {
  const tokens = tokenize(src);
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  const parseExpr = () => {
    let node = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const lhs = node;
      const rhs = parseTerm();
      node = op === '+' ? (x) => lhs(x) + rhs(x) : (x) => lhs(x) - rhs(x);
    }
    return node;
  };

  const parseTerm = () => {
    let node = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const lhs = node;
      const rhs = parseUnary();
      node = op === '*' ? (x) => lhs(x) * rhs(x) : (x) => lhs(x) / rhs(x);
    }
    return node;
  };

  const parseUnary = () => {
    if (peek() === '-') {
      next();
      const inner = parseUnary();
      return (x) => -inner(x);
    }
    return parsePower();
  };

  const parsePower = () => {
    const base = parseAtom();
    if (peek() === '^') {
      next();
      const exp = parseUnary();
      return (x) => base(x) ** exp(x);
    }
    return base;
  };

  const parseAtom = () => {
    const t = next();
    if (t === undefined) throw new Error('ekspresi tidak lengkap');
    if (/^\d/.test(t)) {
      const v = Number(t);
      return () => v;
    }
    if (t === '(') {
      const inner = parseExpr();
      if (next() !== ')') throw new Error('tanda kurung tidak seimbang');
      return inner;
    }
    if (t === 'x') return (x) => x;
    if (Object.hasOwn(SAFE_FUNCS, t)) {
      const val = SAFE_FUNCS[t];
      if (typeof val === 'number') return () => val;
      if (next() !== '(') throw new Error(`${t} harus diikuti tanda kurung`);
      const arg = parseExpr();
      if (next() !== ')') throw new Error('tanda kurung tidak seimbang');
      return (x) => val(arg(x));
    }
    throw new Error(`token tidak dikenal: ${t}`);
  };

  const fn = parseExpr();
  if (i !== tokens.length) throw new Error('ada sisa token setelah ekspresi');
  return fn;
};

// Baris "ekspresi" atau "ekspresi, xawal, xakhir". Baris yang salah dilewati.
const parseCurves = (text = '') =>
  String(text).split('\n').flatMap((line) => {
    const raw = line.trim();
    if (!raw) return [];
    const cells = raw.split(',').map((v) => v.trim());
    const hasRange = cells.length >= 3;
    const exprSrc = hasRange ? cells.slice(0, -2).join(',') : cells[0];
    try {
      const fn = compileExpr(exprSrc);
      const a = hasRange ? Number(cells[cells.length - 2]) : NaN;
      const b = hasRange ? Number(cells[cells.length - 1]) : NaN;
      return [{
        src: exprSrc,
        fn,
        a: Number.isFinite(a) ? a : null,
        b: Number.isFinite(b) ? b : null,
      }];
    } catch {
      return [];
    }
  });

// Ubah kurva menjadi daftar segmen polyline. Titik NaN, tak hingga, atau di luar area dipisah.
const sampleCurve = (curve, xmin, xmax, ymin, ymax, n = 120) => {
  const a = curve.a ?? xmin;
  const b = curve.b ?? xmax;
  const margin = ymax - ymin;
  const segments = [];
  let cur = [];

  for (let k = 0; k <= n; k++) {
    const x = a + ((b - a) * k) / n;
    const y = curve.fn(x);
    const ok = Number.isFinite(y) && y >= ymin - margin && y <= ymax + margin;
    if (ok) cur.push([x, y]);
    else if (cur.length) { segments.push(cur); cur = []; }
  }
  if (cur.length) segments.push(cur);
  return segments;
};

// Mengembalikan array elemen SVG untuk semua kurva. Satu kurva gagal tidak menghentikan yang lain.
const curveParts = (s, px, py) => {
  const parts = [];
  parseCurves(s.curves.join('\n')).forEach((c) => {
    try {
      sampleCurve(c, s.xmin, s.xmax, s.ymin, s.ymax).forEach((seg) => {
        const pts = seg.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');
        parts.push(
          `<polyline points="${pts}" fill="none" stroke="${CHART_PALETTE[1]}" stroke-width="2" stroke-linejoin="round"/>`,
        );
      });
    } catch (err) {
      console.warn('[plot-2d] kurva dilewati:', c.src, err);
    }
  });
  return parts;
};

const toSpec = ({ xmin, xmax, ymin, ymax, points, lines, curves } = {}) => {
  const num = (v, fallback) => (Number.isFinite(Number(v)) && v !== '' ? Number(v) : fallback);
  const x0 = num(xmin, -5);
  let x1 = num(xmax, 5);
  const y0 = num(ymin, -5);
  let y1 = num(ymax, 5);
  if (x1 <= x0) x1 = x0 + 1;
  if (y1 <= y0) y1 = y0 + 1;

  return {
    xmin: x0, xmax: x1, ymin: y0, ymax: y1,
    points: parseRows(points, 2).map(([x, y, label]) => ({ x, y, label })),
    lines: parseRows(lines, 4).map(([ax, ay, bx, by]) => ({ x1: ax, y1: ay, x2: bx, y2: by })),
    curves: String(curves ?? '').split('\n').map((l) => l.trim()).filter(Boolean),
  };
};

// Langkah tick yang rapi: sekitar 8 tick per sumbu
const niceStep = (range) => {
  const raw = range / 8;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
};

const ticksOf = (min, max) => {
  const step = niceStep(max - min);
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    out.push(Number(v.toFixed(10)));
  }
  return out;
};

const plotSvg = (s) => {
  const innerW = PLOT_W - PLOT_PAD * 2;
  const innerH = PLOT_H - PLOT_PAD * 2;
  const px = (x) => PLOT_PAD + ((x - s.xmin) / (s.xmax - s.xmin)) * innerW;
  const py = (y) => PLOT_H - PLOT_PAD - ((y - s.ymin) / (s.ymax - s.ymin)) * innerH;

  const xAxisY = s.ymin <= 0 && s.ymax >= 0 ? py(0) : PLOT_H - PLOT_PAD;
  const yAxisX = s.xmin <= 0 && s.xmax >= 0 ? px(0) : PLOT_PAD;

  const parts = [];

  // 1. Grid
  ticksOf(s.xmin, s.xmax).forEach((x) =>
    parts.push(`<line x1="${px(x)}" y1="${PLOT_PAD}" x2="${px(x)}" y2="${PLOT_H - PLOT_PAD}" stroke="currentColor" stroke-opacity="0.12"/>`),
  );
  ticksOf(s.ymin, s.ymax).forEach((y) =>
    parts.push(`<line x1="${PLOT_PAD}" y1="${py(y)}" x2="${PLOT_W - PLOT_PAD}" y2="${py(y)}" stroke="currentColor" stroke-opacity="0.12"/>`),
  );

  // 2. Sumbu
  parts.push(`<line x1="${PLOT_PAD}" y1="${xAxisY}" x2="${PLOT_W - PLOT_PAD}" y2="${xAxisY}" stroke="currentColor" stroke-width="1.5"/>`);
  parts.push(`<line x1="${yAxisX}" y1="${PLOT_PAD}" x2="${yAxisX}" y2="${PLOT_H - PLOT_PAD}" stroke="currentColor" stroke-width="1.5"/>`);

  // 3. Label tick
  ticksOf(s.xmin, s.xmax).forEach((x) =>
    parts.push(`<text x="${px(x)}" y="${xAxisY + 14}" text-anchor="middle" font-size="10" fill="currentColor">${x}</text>`),
  );
  ticksOf(s.ymin, s.ymax).forEach((y) =>
    parts.push(`<text x="${yAxisX - 6}" y="${py(y) + 3}" text-anchor="end" font-size="10" fill="currentColor">${y}</text>`),
  );

  // 4. Garis lurus
  s.lines.forEach((l) =>
    parts.push(`<line x1="${px(l.x1)}" y1="${py(l.y1)}" x2="${px(l.x2)}" y2="${py(l.y2)}" stroke="currentColor" stroke-width="1.5"/>`),
  );

  // 5. Kurva fungsi
  parts.push(...curveParts(s, px, py));

  // 6. Titik dan label (paling atas)
  s.points.forEach((p) => {
    parts.push(`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="4" fill="#f97316"/>`);
    if (p.label) {
      parts.push(`<text x="${px(p.x) + 6}" y="${py(p.y) - 6}" font-size="11" fill="currentColor">${esc(p.label)}</text>`);
    }
  });

  return `<svg viewBox="0 0 ${PLOT_W} ${PLOT_H}" xmlns="http://www.w3.org/2000/svg" role="img" class="plot-svg">${parts.join('')}</svg>`;
};

const renderPlot = (fields = {}) => {
  const spec = toSpec(fields);
  return `<figure class="embed-plot" data-spec-b64="${b64encode(JSON.stringify(spec))}">${plotSvg(spec)}</figure>`;
};

defineBlock({
  id: 'plot-2d',
  label: 'Grafik koordinat 2D',
  icon: 'show_chart',
  marker: 'embed-plot',
  fields: [
    { name: 'xmin', label: 'x minimum', widget: 'number', default: -5 },
    { name: 'xmax', label: 'x maksimum', widget: 'number', default: 5 },
    { name: 'ymin', label: 'y minimum', widget: 'number', default: -5 },
    { name: 'ymax', label: 'y maksimum', widget: 'number', default: 5 },
    { name: 'points', label: 'Titik (satu per baris: x, y, label opsional)', widget: 'text', required: false },
    { name: 'lines', label: 'Garis (satu per baris: x1, y1, x2, y2)', widget: 'text', required: false },
    { name: 'curves', label: 'Kurva fungsi (satu per baris: ekspresi atau ekspresi, xawal, xakhir)', widget: 'text', required: false },
  ],
  render: renderPlot,
  fromBlock: ({ html = '' } = {}) => {
    const spec = JSON.parse(b64decode(attrOf(html, 'data-spec-b64')) || 'null');
    if (!spec) return {};
    return {
      xmin: spec.xmin,
      xmax: spec.xmax,
      ymin: spec.ymin,
      ymax: spec.ymax,
      points: (spec.points ?? [])
        .map((p) => [p.x, p.y, p.label].filter((v) => v !== undefined && v !== '').join(', '))
        .join('\n'),
      lines: (spec.lines ?? []).map((l) => [l.x1, l.y1, l.x2, l.y2].join(', ')).join('\n'),
      curves: (spec.curves ?? []).join('\n'),
    };
  },
});

// ===== 15. Diagram batang, donut, dot-line, dan heatmap (SVG statis) =====
const CHART_PALETTE = ['#f97316', '#0ea5e9', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#14b8a6', '#64748b'];

// ----- Helper bersama -----
const svgWrap = (w, h, parts) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" class="chart-svg">${parts.join('')}</svg>`;

const figureFor = (cls, spec, svg) =>
  svg ? `<figure class="embed-chart ${cls}" data-spec-b64="${b64encode(JSON.stringify(spec))}">${svg}</figure>` : '';

const readSpec = (html = '') => JSON.parse(b64decode(attrOf(html, 'data-spec-b64')) || 'null') ?? {};

const splitLines = (text = '') =>
  String(text).split('\n').map((s) => s.trim()).filter(Boolean);

// Baris "label, nilai". Kolom terakhir selalu nilai, sisanya label (boleh mengandung koma).
// allowNegative: dot-line menerima nilai negatif, batang dan donut tidak.
const parseLabeledRows = (text = '', { allowNegative = false } = {}) =>
  String(text).split('\n').flatMap((line) => {
    const cells = line.split(',').map((v) => v.trim());
    const raw = cells[cells.length - 1];
    const value = Number(raw);
    if (cells.length < 2 || raw === '' || !Number.isFinite(value)) return [];
    if (!allowNegative && value < 0) return [];
    return [{ label: cells.slice(0, -1).join(', '), value }];
  });

// ----- Diagram batang -----
const BAR_W = 420;
const BAR_H = 240;
const BAR_PAD = { l: 36, r: 12, t: 16, b: 40 };

const barSvg = (rows) => {
  if (!rows.length) return '';
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  const innerW = BAR_W - BAR_PAD.l - BAR_PAD.r;
  const innerH = BAR_H - BAR_PAD.t - BAR_PAD.b;
  const base = BAR_PAD.t + innerH;
  const slot = innerW / rows.length;
  const barW = Math.min(slot * 0.6, 48);
  const y = (v) => base - (v / max) * innerH;
  const parts = [];

  ticksOf(0, max).forEach((t) => {
    parts.push(`<line x1="${BAR_PAD.l}" y1="${y(t)}" x2="${BAR_W - BAR_PAD.r}" y2="${y(t)}" stroke="currentColor" stroke-opacity="0.12"/>`);
    parts.push(`<text x="${BAR_PAD.l - 6}" y="${y(t) + 3}" text-anchor="end" font-size="10" fill="currentColor">${t}</text>`);
  });

  rows.forEach((r, i) => {
    const cx = BAR_PAD.l + slot * i + slot / 2;
    const top = y(r.value);
    parts.push(`<rect x="${cx - barW / 2}" y="${top}" width="${barW}" height="${base - top}" fill="${CHART_PALETTE[0]}"/>`);
    parts.push(`<text x="${cx}" y="${top - 4}" text-anchor="middle" font-size="10" fill="currentColor">${r.value}</text>`);
    parts.push(`<text x="${cx}" y="${base + 14}" text-anchor="middle" font-size="10" fill="currentColor">${esc(r.label)}</text>`);
  });

  parts.push(`<line x1="${BAR_PAD.l}" y1="${base}" x2="${BAR_W - BAR_PAD.r}" y2="${base}" stroke="currentColor" stroke-width="1.5"/>`);
  return svgWrap(BAR_W, BAR_H, parts);
};

const renderBar = (fields = {}) => {
  const spec = { data: fields.data ?? '' };
  return figureFor('embed-bar', spec, barSvg(parseLabeledRows(spec.data)));
};

defineBlock({
  id: 'chart-bar',
  label: 'Diagram batang',
  icon: 'bar_chart',
  marker: 'embed-bar',
  fields: [{ name: 'data', label: 'Data (satu per baris: label, nilai)', widget: 'text' }],
  render: renderBar,
  fromBlock: ({ html = '' } = {}) => readSpec(html),
});

// ----- Diagram donut -----
const DONUT_S = 220;
const DONUT_R = 80;
const DONUT_STROKE = 36;

const donutSvg = (rows) => {
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (!total) return '';

  const c = DONUT_S / 2;
  const circ = 2 * Math.PI * DONUT_R;
  let acc = 0;
  const parts = [];

  rows.forEach((r, i) => {
    const len = (r.value / total) * circ;
    parts.push(
      `<circle cx="${c}" cy="${c}" r="${DONUT_R}" fill="none" stroke="${CHART_PALETTE[i % CHART_PALETTE.length]}" ` +
        `stroke-width="${DONUT_STROKE}" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-acc}" ` +
        `transform="rotate(-90 ${c} ${c})"/>`,
    );
    acc += len;
  });

  parts.push(`<text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="currentColor">${total}</text>`);

  rows.forEach((r, i) => {
    const yy = 24 + i * 20;
    const pct = ((r.value / total) * 100).toFixed(1);
    parts.push(`<rect x="${DONUT_S + 20}" y="${yy - 10}" width="12" height="12" fill="${CHART_PALETTE[i % CHART_PALETTE.length]}"/>`);
    parts.push(`<text x="${DONUT_S + 40}" y="${yy}" font-size="12" fill="currentColor">${esc(r.label)} (${pct}%)</text>`);
  });

  const h = Math.max(DONUT_S, 40 + rows.length * 20);
  return svgWrap(420, h, parts);
};

const renderDonut = (fields = {}) => {
  const spec = { data: fields.data ?? '' };
  return figureFor('embed-donut', spec, donutSvg(parseLabeledRows(spec.data)));
};

defineBlock({
  id: 'chart-donut',
  label: 'Diagram donut',
  icon: 'donut_large',
  marker: 'embed-donut',
  fields: [{ name: 'data', label: 'Data (satu per baris: label, nilai)', widget: 'text' }],
  render: renderDonut,
  fromBlock: ({ html = '' } = {}) => readSpec(html),
});

// ----- Diagram dot-line (tren waktu, nilai boleh negatif) -----
const LINE_W = 420;
const LINE_H = 240;
const LINE_PAD = { l: 40, r: 16, t: 16, b: 40 };

const lineSvg = (rows) => {
  if (!rows.length) return '';

  const values = rows.map((r) => r.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  // Semua nilai sama: beri rentang buatan agar garis tidak jatuh di tepi
  if (min === max) {
    min -= 1;
    max += 1;
  }

  const innerW = LINE_W - LINE_PAD.l - LINE_PAD.r;
  const innerH = LINE_H - LINE_PAD.t - LINE_PAD.b;
  const base = LINE_PAD.t + innerH;
  const stepX = rows.length > 1 ? innerW / (rows.length - 1) : 0;
  const x = (i) => LINE_PAD.l + (rows.length > 1 ? stepX * i : innerW / 2);
  const y = (v) => LINE_PAD.t + innerH - ((v - min) / (max - min)) * innerH;
  const parts = [];

  ticksOf(min, max).forEach((t) => {
    parts.push(`<line x1="${LINE_PAD.l}" y1="${y(t)}" x2="${LINE_W - LINE_PAD.r}" y2="${y(t)}" stroke="currentColor" stroke-opacity="0.12"/>`);
    parts.push(`<text x="${LINE_PAD.l - 6}" y="${y(t) + 3}" text-anchor="end" font-size="10" fill="currentColor">${t}</text>`);
  });

  if (rows.length > 1) {
    const pts = rows.map((r, i) => `${x(i)},${y(r.value)}`).join(' ');
    parts.push(`<polyline points="${pts}" fill="none" stroke="${CHART_PALETTE[0]}" stroke-width="2" stroke-linejoin="round"/>`);
  }

  rows.forEach((r, i) => {
    const cx = x(i);
    const cy = y(r.value);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="${CHART_PALETTE[0]}"/>`);
    parts.push(`<text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="10" fill="currentColor">${r.value}</text>`);
    parts.push(`<text x="${cx}" y="${base + 14}" text-anchor="middle" font-size="10" fill="currentColor">${esc(r.label)}</text>`);
  });

  parts.push(`<line x1="${LINE_PAD.l}" y1="${base}" x2="${LINE_W - LINE_PAD.r}" y2="${base}" stroke="currentColor" stroke-width="1.5"/>`);
  return svgWrap(LINE_W, LINE_H, parts);
};

const renderLine = (fields = {}) => {
  const spec = { data: fields.data ?? '' };
  return figureFor('embed-line', spec, lineSvg(parseLabeledRows(spec.data, { allowNegative: true })));
};

defineBlock({
  id: 'chart-line',
  label: 'Diagram dot-line',
  icon: 'timeline',
  marker: 'embed-line',
  fields: [{ name: 'data', label: 'Data (satu per baris: label, nilai)', widget: 'text' }],
  render: renderLine,
  fromBlock: ({ html = '' } = {}) => readSpec(html),
});

// ----- Heatmap -----
const HEAT_W = 420;
const HEAT_CELL_H = 28;
const HEAT_LEFT = 72;
const HEAT_TOP = 28;

// Setiap baris teks adalah satu baris grid. Sel kosong menjadi null.
const parseGrid = (text = '') =>
  String(text)
    .split('\n')
    .map((line) => line.split(',').map((v) => v.trim()))
    .filter((cells) => cells.some((v) => v !== ''))
    .map((cells) => cells.map((v) => (v !== '' && Number.isFinite(Number(v)) ? Number(v) : null)));

const heatSvg = ({ values = '', xlabels = '', ylabels = '' } = {}) => {
  const grid = parseGrid(values);
  const nums = grid.flat().filter((v) => v !== null);
  if (!nums.length) return '';

  const cols = Math.max(...grid.map((r) => r.length));
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const xl = splitLines(xlabels);
  const yl = splitLines(ylabels);
  const cellW = (HEAT_W - HEAT_LEFT - 12) / cols;
  const h = HEAT_TOP + grid.length * HEAT_CELL_H + 8;
  const parts = [];

  xl.slice(0, cols).forEach((t, j) =>
    parts.push(`<text x="${HEAT_LEFT + cellW * (j + 0.5)}" y="${HEAT_TOP - 8}" text-anchor="middle" font-size="10" fill="currentColor">${esc(t)}</text>`),
  );

  grid.forEach((row, i) => {
    const cy = HEAT_TOP + i * HEAT_CELL_H;
    if (yl[i]) {
      parts.push(`<text x="${HEAT_LEFT - 6}" y="${cy + HEAT_CELL_H / 2 + 4}" text-anchor="end" font-size="10" fill="currentColor">${esc(yl[i])}</text>`);
    }
    row.forEach((v, j) => {
      if (v === null) return;
      const t = (v - min) / range;
      parts.push(
        `<rect x="${HEAT_LEFT + cellW * j + 1}" y="${cy + 1}" width="${cellW - 2}" height="${HEAT_CELL_H - 2}" rx="3" ` +
          `fill="${CHART_PALETTE[0]}" fill-opacity="${(0.1 + 0.9 * t).toFixed(2)}"/>`,
      );
      parts.push(`<text x="${HEAT_LEFT + cellW * (j + 0.5)}" y="${cy + HEAT_CELL_H / 2 + 4}" text-anchor="middle" font-size="10" fill="currentColor">${v}</text>`);
    });
  });

  return svgWrap(HEAT_W, h, parts);
};

const renderHeatmap = (fields = {}) => {
  const spec = {
    values: fields.values ?? '',
    xlabels: fields.xlabels ?? '',
    ylabels: fields.ylabels ?? '',
  };
  return figureFor('embed-heatmap', spec, heatSvg(spec));
};

defineBlock({
  id: 'chart-heatmap',
  label: 'Heatmap',
  icon: 'grid_on',
  marker: 'embed-heatmap',
  fields: [
    { name: 'values', label: 'Nilai (satu baris grid per baris, dipisah koma)', widget: 'text' },
    { name: 'xlabels', label: 'Label kolom (satu per baris)', widget: 'text', required: false },
    { name: 'ylabels', label: 'Label baris (satu per baris)', widget: 'text', required: false },
  ],
  render: renderHeatmap,
  fromBlock: ({ html = '' } = {}) => readSpec(html),
});

CMS.init();
