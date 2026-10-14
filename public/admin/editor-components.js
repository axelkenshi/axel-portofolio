CMS.registerPreviewStyle('/styles/callouts.css');

CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout',
  icon: 'info',
  trigger: 'button',
  fields: [
    { name: 'type', label: 'Tipe', widget: 'select',
      options: ['tip', 'note', 'alert', 'important', 'dangerous'], default: 'tip' },
    { name: 'body', label: 'Isi', widget: 'markdown' },
  ],
  pattern: /<div class="callout" data-type="(?<type>tip|note|alert|important|dangerous)">\s*(?<body>[\s\S]*?)\s*<\/div>/,
  toBlock: ({ type = 'tip', body = '' }) =>
    `<div class="callout" data-type="${type}">\n\n${body}\n\n</div>`,
});

// Ambil ID 11 karakter dari berbagai format link YouTube, atau dari ID saja
const YT_ID = (input = '') => {
  const raw = input.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const m = raw.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : '';
};

// Escape tanda kutip saja, agar nilai tetap stabil saat round-trip
const q = (s = '') => s.replace(/"/g, '&quot;');

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

CMS.registerEditorComponent({
  id: 'cdn-image',
  label: 'Gambar CDN',
  icon: 'image',
  trigger: 'button',
  fields: [
    { name: 'src', label: 'URL gambar (CDN)', widget: 'string' },
    { name: 'alt', label: 'Teks alternatif', widget: 'string', required: false },
  ],
  pattern: /<figure class="embed-image"><img src="(?<src>[^"]+)" alt="(?<alt>[^"]*)" loading="lazy"><\/figure>/,
  toBlock: ({ src = '', alt = '' }) =>
    src
      ? `<figure class="embed-image"><img src="${q(src)}" alt="${q(alt)}" loading="lazy"></figure>`
      : '',
  toPreview: ({ src = '', alt = '' }) =>
    src ? `<figure class="embed-image"><img src="${q(src)}" alt="${q(alt)}" loading="lazy"></figure>` : '',
});

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

CMS.init();