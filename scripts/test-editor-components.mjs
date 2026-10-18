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