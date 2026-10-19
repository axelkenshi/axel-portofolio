// scripts/test-editor-components.mjs
import { readFileSync } from 'node:fs';

// Mock CMS agar file komponen bisa dijalankan di Node
const registry = [];
globalThis.CMS = {
  registerEditorComponent: (c) => registry.push(c),
  registerPreviewStyle() {},
  init() {},
};
new Function(readFileSync('public/admin/editor-components.js', 'utf8'))();

// Contoh data untuk setiap komponen. Tambahkan contoh baru saat membuat komponen baru.
const samples = {
  callout: { type: 'tip', body: 'Isi callout' },
  youtube: { url: 'https://youtu.be/dQw4w9WgXcQ' },
  'cdn-image': {
    src: 'https://cdn.example.com/a.webp',
    alt: 'Ilustrasi "contoh" & uji',
    caption: 'Caption uji',
    credit: 'Unsplash',
    creditUrl: 'https://unsplash.com',
  },
  'cdn-grid': {
    cols: '2',
    images: [
      { url: 'https://cdn.example.com/1.webp', alt: 'satu' },
      { url: 'https://cdn.example.com/2.webp', alt: 'dua' },
    ],
  },
  'link-card': { title: 'Judul', description: 'Deskripsi', url: 'https://example.com', image: '' },
  'pull-quote': { quote: 'Kutipan uji', author: 'Penulis', sourceUrl: 'https://example.com' },
  'code-file': { filename: 'a.ts', language: 'ts', code: 'const x = 1;\n\nconsole.log(x);' },
  terminal: { command: 'npm run build', output: 'Build selesai' },
  details: { summary: 'Ringkas', body: 'Isi **markdown**', open: false },
  'code-diff': { filename: 'a.ts', before: 'a', after: 'b' },
  'cdn-video': { src: 'https://cdn.example.com/v.mp4', poster: '', caption: 'Video uji' },
  'iframe-embed': { src: 'https://example.com/embed', height: 480 },
};

for (const c of registry) {
  const sample = samples[c.id];
  if (!sample) {
    console.log('LEWATI (belum ada sampel):', c.id);
    continue;
  }

  const md = c.toBlock(sample);
  const m = c.pattern.exec(md);
  if (!m) {
    console.log('GAGAL pattern tidak cocok dengan toBlock:', c.id);
    continue;
  }

  const back = c.fromBlock ? c.fromBlock(m.groups) : m.groups;

  // Field wajib yang kosong setelah dibaca balik adalah sumber error "field empty" di GUI
  for (const f of c.fields) {
    if (f.required === false || f.widget === 'boolean') continue;
    if (back[f.name] === undefined || back[f.name] === '') {
      console.log(`KOSONG setelah baca balik: ${c.id}.${f.name}`);
    }
  }

  const md2 = c.toBlock(back);
  console.log(md === md2 ? 'OK    ' : 'BEDA  ', c.id);
}

// Uji 1: fromBlock tidak boleh melempar error walau input tidak lengkap
const consoleErrors = [];
const originalError = console.error;
console.error = (...args) => consoleErrors.push(args[0]);
for (const c of registry) {
  if (c.fromBlock) c.fromBlock({});
}
console.error = originalError;
consoleErrors.forEach((msg) => console.log('GAGAL fromBlock({}):', msg));

// Uji 2: semua pattern harus cocok tepat satu kali dalam satu dokumen gabungan
const doc = registry
  .map((c) => (samples[c.id] ? c.toBlock(samples[c.id]) : ''))
  .join('\n\n');
for (const c of registry) {
  if (!samples[c.id]) continue;
  const count = [...doc.matchAll(new RegExp(c.pattern.source, 'g'))].length;
  console.log(count === 1 ? 'OK    dokumen gabungan:' : `TUMPANG TINDIH (${count}):`, c.id);
}

// Uji normalisasi: tambah class ekstra dan spasi, lalu pastikan nilai tetap terbaca
for (const c of registry) {
  if (!samples[c.id] || c.id === 'callout') continue;
  const md = c.toBlock(samples[c.id]);
  const normalized = md.replace(/class="([^"]*)"/g, 'class="$1 ekstra"').replace(/\s>/g, '>');
  const m = c.pattern.exec(normalized);
  if (!m) {
    console.log('GAGAL pattern setelah normalisasi:', c.id);
    continue;
  }
  const back = c.fromBlock ? c.fromBlock(m.groups) : m.groups;
  const same = JSON.stringify(back) === JSON.stringify(c.fromBlock(c.pattern.exec(md).groups));
  console.log(same ? 'OK    normalisasi:' : 'BEDA  normalisasi:', c.id);
}