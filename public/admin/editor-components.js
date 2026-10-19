CMS.registerPreviewStyle('/styles/callouts.css');

// ===== Pengaman global: fromBlock yang melempar error tidak lagi menggagalkan seluruh dokumen =====
const _registerEditorComponent = CMS.registerEditorComponent.bind(CMS);
CMS.registerEditorComponent = (def) => {
  if (def.fromBlock) {
    const original = def.fromBlock;
    def.fromBlock = (groups = {}) => {
      try {
        return original(groups);
      } catch (err) {
        console.error(`[${def.id}] fromBlock gagal, periksa blok ini:`, err, groups);
        return { ...groups };
      }
    };
  }
  _registerEditorComponent(def);
};

// ===== Helper bersama =====
// Escape tanda kutip saja, agar nilai tetap stabil saat round-trip
const q = (s = '') => s.replace(/"/g, '&quot;');

// esc: aman untuk nilai atribut dan teks HTML
const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// unesc: kebalikan dari esc() saat membaca balik markdown
// &amp; selalu didecode paling akhir agar tidak terjadi decode ganda
const unesc = (s = '') =>
  String(s)
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');

// asBlock: membungkus HTML hasil render dengan baris kosong agar markdown di sekitarnya tetap terpisah
const asBlock = (render) => (fields) => {
  const html = render(fields);
  return html ? `\n\n${html}\n\n` : '';
};

// Satu sumber untuk HTML grid, dipakai oleh toBlock (hasil markdown) dan toPreview (tampilan editor)
const gridHtml = (cols = '2', images = []) => {
  const n = Number(cols);
  const items = images.filter((img) => img && img.url).slice(0, n);
  if (items.length < n) return ''; // jumlah URL belum lengkap, jangan tulis blok rusak

  const figures = items
    .map((img) => `<figure><img src="${esc(img.url)}" alt="${esc(img.alt ?? '')}" loading="lazy"></figure>`)
    .join('');

  return `<div class="embed-grid" data-cols="${n}">${figures}</div>`;
};

// ===== 1. Callout ala github =====
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

// ===== 2. Embed block video youtube =====
// Fungsi khusus parsing url
// Ambil ID 11 karakter dari berbagai format link YouTube, atau dari ID saja
const YT_ID = (input = '') => {
  const raw = input.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const m = raw.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : '';
};

CMS.registerEditorComponent({
  id: 'youtube',
  label: 'YouTube',
  icon: 'smart_display',
  trigger: 'button',
  fields: [
    { name: 'url', label: 'Link YouTube (share)', widget: 'string' },
  ],
  pattern: /<div class="embed-youtube"><iframe src="https:\/\/www\.youtube\.com\/embed\/(?<id>[\w-]{11})"[^>]*><\/iframe><\/div>/,
  fromBlock: ({ id }) => ({ url: `https://youtu.be/${id}` }),
  toBlock: ({ url = '' }) => {
    const id = YT_ID(url);
    return id
      ? `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${id}" loading="lazy" allowfullscreen></iframe></div>`
      : '';
  },
  toPreview: ({ url = '' }) => {
    const id = YT_ID(url);
    const wrap = document.createElement('div');
    wrap.className = 'embed-youtube';
    if (id) {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube.com/embed/${id}`;
      frame.allowFullscreen = true;
      wrap.appendChild(frame);
    }
    return wrap;
  },
});

// ===== 3. GAMBAR CDN (caption dan kredit opsional) =====
// Fungsi khusus embed single CDN image
// Blok lama tanpa figcaption tetap terbaca karena bagian itu opsional di pattern
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

CMS.registerEditorComponent({
  id: 'cdn-image',
  label: 'Gambar CDN',
  icon: 'image',
  trigger: 'button',
  fields: [
    { name: 'src', label: 'URL gambar (CDN)', widget: 'string' },
    { name: 'alt', label: 'Teks alternatif', widget: 'string', required: false },
    { name: 'caption', label: 'Caption (opsional)', widget: 'string', required: false },
    { name: 'credit', label: 'Kredit / nama sumber (opsional)', widget: 'string', required: false },
    { name: 'creditUrl', label: 'URL kredit (opsional)', widget: 'string', required: false },
  ],
  pattern: /<figure class="embed-image"><img src="(?<src>[^"]+)" alt="(?<alt>[^"]*)" loading="lazy">(?:<figcaption><span class="caption-text">(?<caption>[^<]*)<\/span><span class="credit">(?:<a href="(?<creditUrl>[^"]*)"[^>]*>)?(?<credit>[^<]*)(?:<\/a>)?<\/span><\/figcaption>)?<\/figure>/,
  fromBlock: ({ src, alt, caption, credit, creditUrl }) => ({
    src: unesc(src),
    alt: unesc(alt),
    caption: unesc(caption),
    credit: unesc(credit),
    creditUrl: unesc(creditUrl),
  }),
  toBlock: asBlock(renderImage),
  toPreview: renderImage,
});

// ===== 4. Embed iframe url website external =====
CMS.registerEditorComponent({
  id: 'iframe-embed',
  label: 'Iframe eksternal',
  icon: 'web',
  trigger: 'button',
  fields: [
    { name: 'src', label: 'URL halaman (iframe)', widget: 'string' },
    { name: 'height', label: 'Tinggi (px)', widget: 'number', default: 480 },
  ],
  pattern: /<div class="embed-iframe"><iframe src="(?<src>[^"]+)" height="(?<height>\d+)" loading="lazy" allowfullscreen><\/iframe><\/div>/,
  fromBlock: ({ src = '', height = '480' } = {}) => ({
    src: unesc(src),
    height: Number(height) || 480,
  }),
  toBlock: ({ src = '', height = 480 }) =>
    src
      ? `<div class="embed-iframe"><iframe src="${q(src)}" height="${height}" loading="lazy" allowfullscreen></iframe></div>`
      : '',
  toPreview: ({ src = '', height = 480 }) => {
    const wrap = document.createElement('div');
    wrap.className = 'embed-iframe';
    if (src) {
      const frame = document.createElement('iframe');
      frame.src = src;
      frame.height = String(height);
      frame.allowFullscreen = true;
      wrap.appendChild(frame);
    }
    return wrap;
  },
});

// ===== 5. Render Grid block gambar 2-4 url cdn =====
// Fungsi khusus from block grid
const parseGridImages = (inner = '') =>
  [...inner.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)].map(([, src, alt]) => ({
    url: unesc(src),
    alt: unesc(alt),
  }));

CMS.registerEditorComponent({
  id: 'cdn-grid',
  label: 'Grid Gambar CDN',
  icon: 'grid_view',
  trigger: 'button',
  fields: [
    { name: 'cols', label: 'Jumlah gambar', widget: 'select', options: ['2', '4'], default: '2' },
    {
      name: 'images',
      label: 'Gambar (isi sesuai jumlah yang dipilih)',
      widget: 'list',
      min: 2,
      max: 4,
      fields: [
        { name: 'url', label: 'URL gambar (CDN)', widget: 'string' },
        { name: 'alt', label: 'Teks alternatif', widget: 'string', required: false },
      ],
    },
  ],
  pattern: /<div class="embed-grid" data-cols="(?<cols>2|4)">(?<inner>[\s\S]*?)<\/div>/,
  
  // fromBlock: menerima groups dari pattern, atau nilai field yang sudah diurai
  fromBlock: ({ cols = '2', inner = '', images } = {}) => ({
    cols: String(cols),
    images: images ?? parseGridImages(inner),
  }),
  toBlock: asBlock(({ cols, images }) => gridHtml(cols, images)),
  toPreview: ({ cols, images }) => gridHtml(cols, images),
});

// ===== 6. KARTU TAUTAN Previewed (link card) =====
// Fungsi khusus kartu tautan interaktif
const renderLinkCard = ({ title = '', description = '', url = '', image = '' } = {}) => {
  if (!title || !/^https?:\/\//.test(url)) return '';

  const cleanDesc = description.replace(/\s*\n\s*/g, ' ').trim();
  const thumb = image ? `<img class="link-thumb" src="${esc(image)}" alt="" loading="lazy">` : '';

  return `<a class="embed-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="link-body"><span class="link-title">${esc(title)}</span><span class="link-desc">${esc(cleanDesc)}</span></span>${thumb}</a>`;
};

CMS.registerEditorComponent({
  id: 'link-card',
  label: 'Kartu tautan',
  icon: 'link',
  trigger: 'button',
  fields: [
    { name: 'title', label: 'Judul', widget: 'string' },
    { name: 'description', label: 'Deskripsi (opsional)', widget: 'text', required: false },
    { name: 'url', label: 'URL tujuan (https://...)', widget: 'string' },
    { name: 'image', label: 'URL gambar pratinjau (opsional)', widget: 'string', required: false },
  ],
  pattern: /<a class="embed-link" href="(?<url>[^"]+)" target="_blank" rel="noopener noreferrer"><span class="link-body"><span class="link-title">(?<title>[^<]*)<\/span><span class="link-desc">(?<description>[^<]*)<\/span><\/span>(?:<img class="link-thumb" src="(?<image>[^"]*)" alt="" loading="lazy">)?<\/a>/,
  fromBlock: ({ url, title, description, image }) => ({
    url: unesc(url),
    title: unesc(title),
    description: unesc(description),
    image: unesc(image),
  }),
  toBlock: asBlock(renderLinkCard),
  toPreview: renderLinkCard,
});

// ===== 7. PERINTAH TERMINAL Sandbox =====
// Fungsi khusus blok perintah terminal & output
const renderTerminal = ({ command = '', output = '' } = {}) => {
  const cmd = command.replace(/\s*\n\s*/g, ' ').trim();
  if (!cmd) return '';

  const cleanOutput = output.trim();
  const outHtml = cleanOutput ? `\n<span class="term-out">${esc(cleanOutput)}</span>` : '';

  return `<pre class="terminal"><span class="term-cmd"><span class="term-prompt">$</span> ${esc(cmd)}</span>${outHtml}</pre>`;
};

CMS.registerEditorComponent({
  id: 'terminal',
  label: 'Terminal',
  icon: 'terminal',
  trigger: 'button',
  fields: [
    { name: 'command', label: 'Perintah (tanpa prompt $)', widget: 'string' },
    { name: 'output', label: 'Output (opsional)', widget: 'text', required: false },
  ],
  pattern: /<pre class="terminal"><span class="term-cmd"><span class="term-prompt">\$<\/span> (?<command>[^<]*)<\/span>(?:\n<span class="term-out">(?<output>[^<]*)<\/span>)?<\/pre>/,
  fromBlock: ({ command, output }) => ({
    command: unesc(command),
    output: unesc(output),
  }),
  toBlock: asBlock(renderTerminal),
  toPreview: renderTerminal,
});

// ===== 8. DETAIL YANG BISA DILIPAT (details) =====
// Fungsi khusus dropdown detail ala FaQ
// Isi (body) tetap markdown. Baris kosong sebelum dan sesudah body memastikan markdown dirender.
const renderDetails = ({ summary = '', body = '', open = false } = {}) => {
  const cleanBody = body.trim();
  if (!cleanBody) return '';

  return `<details class="fold"${open ? ' open' : ''}>\n<summary>${esc(summary || 'Selengkapnya')}</summary>\n\n${cleanBody}\n\n</details>`;
};

CMS.registerEditorComponent({
  id: 'details',
  label: 'Detail (bisa dilipat)',
  icon: 'unfold_more',
  trigger: 'button',
  fields: [
    { name: 'summary', label: 'Judul ringkas', widget: 'string' },
    { name: 'body', label: 'Isi text', widget: 'text' },
    { name: 'open', label: 'Terbuka secara default', widget: 'boolean', default: false, required: false },
  ],
  pattern: /<details class="fold"(?<open> open)?>\n<summary>(?<summary>[^<]*)<\/summary>\n\n(?<body>[\s\S]*?)\n\n<\/details>/,
  fromBlock: ({ open, summary, body }) => ({
    open: Boolean(open),
    summary: unesc(summary),
    body,
  }),
  toBlock: asBlock(renderDetails),
  toPreview: renderDetails,
});

// ===== 9. EMBED VIDEO DARI CDN KOSTUM (Non Youtube Provider) =====
// Fungsi khusus rendering video via CDN Source
const renderVideo = ({ src = '', poster = '', caption = '' } = {}) => {
  if (!src) return '';

  return `<figure class="embed-video"><video src="${esc(src)}" poster="${esc(poster)}" controls preload="metadata" playsinline></video><figcaption>${esc(caption)}</figcaption></figure>`;
};

CMS.registerEditorComponent({
  id: 'cdn-video',
  label: 'Video CDN',
  icon: 'movie',
  trigger: 'button',
  fields: [
    { name: 'src', label: 'URL video (CDN, .mp4 atau .webm)', widget: 'string' },
    { name: 'poster', label: 'URL poster / thumbnail (opsional)', widget: 'string', required: false },
    { name: 'caption', label: 'Caption (opsional)', widget: 'string', required: false },
  ],
  pattern: /<figure class="embed-video"><video src="(?<src>[^"]+)" poster="(?<poster>[^"]*)" controls preload="metadata" playsinline><\/video><figcaption>(?<caption>[^<]*)<\/figcaption><\/figure>/,
  fromBlock: ({ src, poster, caption }) => ({
    src: unesc(src),
    poster: unesc(poster),
    caption: unesc(caption),
  }),
  toBlock: asBlock(renderVideo),
  toPreview: renderVideo,
});

// ===== 10. BLOK KODE DENGAN NAMA FILE =====
// Fungsi khusus blok kode kostum (markdown fence, diproses Shiki/Expressive Code saat build)
// Memakai <pre> agar baris kosong di dalam kode tidak memutus blok HTML di markdown
// markdown fence Ia dibangun di atas Shiki dan berjalan saat build (package: astro-expressive-code)
// Kode fence digunakan juga untuk diff
const FENCE_CHAR = '\x60';

// Panjang pagar minimal 3 dan selalu lebih panjang dari deretan backtick terpanjang di dalam kode
const fenceFor = (code) => {
  const runs = code.match(/\x60+/g) || [];
  const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
  return FENCE_CHAR.repeat(Math.max(3, longest + 1));
};

// Output markdown asli. Kode tidak di-escape karena markdown menampilkan isi fence apa adanya.
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
  pattern: /(?<fence>\x60{3,})(?!diff[ \n])(?<language>[\w-]*)(?: title="(?<filename>[^"]*)")?\n(?<code>[\s\S]*?)\n\k<fence>(?!\x60)/,
  fromBlock: ({ filename = '', language = '', code = '' }) => ({
    filename,
    language: language || 'text',
    code,
  }),
  toBlock: asBlock(renderCodeFile),
  toPreview: renderCodePreview,
});

// ===== 11. PERBANDINGAN SEBELUM DAN SESUDAH (Simple code diff) =====
// Kumpulan Fungsi inline diff ala github
// Baris "-" untuk sebelum dan "+" untuk sesudah. Baris konteks tidak dimodelkan agar tetap sederhana.
const toLines = (s = '') =>
  s.trim() === '' ? [] : s.replace(/\r/g, '').replace(/\n+$/, '').split('\n');

// Output markdown asli: semua baris sebelum dulu, lalu semua baris sesudah
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

// Pratinjau di editor memakai HTML agar tampilan konsisten dengan blok lain
const renderDiffPreview = ({ filename = '', before = '', after = '' } = {}) => {
  const rows = [
    ...toLines(before).map((line) => `<span class="diff-del">- ${esc(line)}</span>`),
    ...toLines(after).map((line) => `<span class="diff-add">+ ${esc(line)}</span>`),
  ];
  if (!rows.length) return '';

  return `<pre class="code-diff" data-file="${esc(filename)}"><code>${rows.join('\n')}</code></pre>`;
};

// Membaca balik isi fence menjadi dua teks: sebelum (-) dan sesudah (+)
const parseDiffBody = (body = '') => {
  const before = [];
  const after = [];

  body.split('\n').forEach((line) => {
    // "-" dan "+" tanpa spasi muncul jika editor membuang spasi di akhir baris kosong
    if (line === '-' || line.startsWith('- ')) before.push(line.slice(2));
    else if (line === '+' || line.startsWith('+ ')) after.push(line.slice(2));
    // baris lain diabaikan karena komponen ini hanya menyimpan sebelum dan sesudah
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
  pattern: /(?<fence>\x60{3,})diff(?: title="(?<filename>[^"]*)")?\n(?<body>[\s\S]*?)\n\k<fence>(?!\x60)/,
  fromBlock: ({ filename = '', body = '' }) => ({
    filename,
    ...parseDiffBody(body),
  }),
  toBlock: asBlock(renderDiff),
  toPreview: renderDiffPreview,
});

CMS.init();