// scripts/test-editor-components.mjs
// Uji komponen editor Sveltia (public/admin/editor-components.js).
// Jalankan dari root proyek: node scripts/test-editor-components.mjs
//
// Uji ini meniru Sveltia:
// - fromBlock dipanggil dengan hasil pattern.exec (RegExpMatchArray), bukan match.groups.
// - Komponen diambil lewat CMS.registerEditorComponent, jadi adapter di file ikut diuji.

import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');

// ---------- Mock CMS ----------
const registry = [];
globalThis.CMS = {
  registerEditorComponent: (def) => registry.push(def),
  registerPreviewStyle: () => {},
  init: () => {},
};
new Function(read('public/admin/editor-components.js'))();

// ---------- Utilitas ----------
let failures = 0;
const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'OK    ' : 'GAGAL '}${label}${detail ? ` - ${detail}` : ''}`);
};
const info = (text) => console.log(`INFO  ${text}`);

// Jalankan fn dan kumpulkan error yang dicatat adapter lewat console.error
const run = (fn) => {
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args);
  try {
    return { value: fn(), errors, thrown: null };
  } catch (thrown) {
    return { value: undefined, errors, thrown };
  } finally {
    console.error = original;
  }
};

const withGlobal = (re) =>
  new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);

const same = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');

// ---------- Sampel: minimal dua varian per komponen, semua field wajib ada ----------
// Varian kedua menguji field opsional yang kosong.
const samples = {
  callout: [{ type: 'tip', body: 'Isi callout' }],

  youtube: [{ url: 'https://youtu.be/dQw4w9WgXcQ' }],

  'cdn-image': [
    {
      src: 'https://cdn.example.com/a.webp',
      alt: 'Ilustrasi "contoh" & <uji>',
      caption: 'Caption & uji',
      credit: 'Unsplash',
      creditUrl: 'https://unsplash.com',
    },
    { src: 'https://cdn.example.com/b.webp', alt: '', caption: '', credit: '', creditUrl: '' },
  ],

  'cdn-grid': [
    {
      images: [
        { url: 'https://cdn.example.com/1.webp', alt: 'satu' },
        { url: 'https://cdn.example.com/2.webp', alt: '' },
        { url: 'https://cdn.example.com/3.webp', alt: 'tiga "kutip"' },
      ],
    },
    {
      images: [
        { url: 'https://cdn.example.com/4.webp', alt: 'empat' },
        { url: 'https://cdn.example.com/5.webp', alt: 'lima' },
      ],
    },
  ],

  'iframe-embed': [{ src: 'https://example.com/embed?x=1&y=2', height: 480 }],

  'link-card': [
    { title: 'Judul "uji"', description: 'Deskripsi biasa', url: 'https://example.com', image: '' },
    { title: 'Judul kedua', description: '', url: 'https://example.com/b', image: 'https://cdn.example.com/t.webp' },
  ],

  terminal: [
    { command: 'npm run build', output: 'Build selesai' },
    { command: 'ls -la', output: '' },
  ],

  details: [
    { summary: 'Ringkas', body: 'Isi **markdown**', open: false },
    { summary: 'Terbuka', body: 'Isi kedua', open: true },
  ],

  'cdn-video': [
    { src: 'https://cdn.example.com/v.mp4', poster: '', caption: 'Video uji' },
    { src: 'https://cdn.example.com/w.webm', poster: 'https://cdn.example.com/p.webp', caption: '' },
  ],

  'code-file': [
    { filename: 'a.ts', language: 'ts', code: 'const x = "1";\n\nconsole.log(x);' },
    { filename: '', language: 'bash', code: 'echo ```hai```' },
  ],

  'code-diff': [
    { filename: 'a.ts', before: 'a\nb', after: 'c' },
    { filename: '', before: '', after: 'baru' },
  ],

  // Rumus: multi-baris, backslash, kutip, <, &. Newline ganda menguji &#10;.
  math: [
    { tex: 'x = \\frac{a}{b} < c \\\\\n\n y = "q" & z' },
    { tex: 'e^{i\\pi}+1=0' },
  ],

  // Diagram: baris kosong di dalam sumber dan karakter khusus (-->, <br/>, kutip).
  mermaid: [
    { source: 'graph TD\n  A["Mulai"] --> B{Cek}\n\n  B -->|ya| C<br/>selesai' },
    { source: 'sequenceDiagram\n  A->>B: halo' },
  ],
};

// Komponen berbasis HTML yang diuji normalisasi. Kode dan callout dikecualikan.
const NORMALIZE_SKIP = new Set(['callout', 'code-file', 'code-diff']);

// ---------- Uji 1: round-trip per sampel ----------
for (const def of registry) {
  const variants = samples[def.id];
  if (!variants) {
    report(false, def.id, 'belum ada sampel uji');
    continue;
  }

  variants.forEach((sample, i) => {
    const label = `round-trip ${def.id} #${i + 1}`;
    const problems = [];

    const missing = def.fields.map((f) => f.name).filter((name) => !(name in sample));
    if (missing.length) {
      report(false, label, `sampel tidak lengkap: ${missing.join(', ')}`);
      return;
    }

    const md = def.toBlock(sample);
    if (!md) {
      report(false, label, 'toBlock mengembalikan string kosong untuk data terisi');
      return;
    }

    const m = def.pattern.exec(md);
    if (!m) {
      report(false, label, 'pattern tidak mengenali hasil toBlock');
      return;
    }

    // Cara Sveltia: fromBlock(match)
    const r = run(() => (def.fromBlock ? def.fromBlock(m) : { ...m.groups }));
    if (r.thrown) {
      report(false, label, `fromBlock melempar: ${r.thrown.message}`);
      return;
    }
    if (r.errors.length) {
      report(false, label, `fromBlock mencatat error: ${String(r.errors[0][0])}`);
      return;
    }
    const back = r.value;

    // Field wajib yang kosong setelah dibaca balik adalah gejala "This field is required" di GUI
    for (const f of def.fields) {
      if (f.required === false || f.widget === 'boolean') continue;
      if (back[f.name] === undefined || back[f.name] === '') {
        problems.push(`field wajib kosong: ${f.name}`);
      }
    }

    // Nilai harus sama dengan sampel
    for (const f of def.fields) {
      if (!same(sample[f.name], back[f.name])) {
        problems.push(`${f.name} beda (dapat ${JSON.stringify(back[f.name])})`);
      }
    }

    // Menulis ulang hasil baca balik harus menghasilkan markdown yang sama
    if (def.toBlock(back) !== md) problems.push('toBlock(hasil baca balik) berbeda dari markdown asli');

    // Pemanggilan dengan objek groups juga harus memberi hasil sama
    if (def.fromBlock) {
      const viaGroups = run(() => def.fromBlock(m.groups)).value;
      if (!same(back, viaGroups)) problems.push('fromBlock(match.groups) memberi hasil berbeda');
    }

    report(problems.length === 0, label, problems.join('; '));
  });
}

// ---------- Uji 2: input tidak lengkap tidak boleh melempar atau mencatat error ----------
for (const def of registry) {
  if (def.fromBlock) {
    for (const input of [{}, null, undefined]) {
      const r = run(() => def.fromBlock(input));
      const ok = !r.thrown && r.errors.length === 0;
      report(ok, `fromBlock tahan input kosong: ${def.id}`, ok ? '' : `input ${String(input)}`);
    }
  }
  const r = run(() => def.toBlock({}));
  report(!r.thrown, `toBlock tahan field kosong: ${def.id}`, r.thrown ? r.thrown.message : '');
  if (def.toPreview) {
    const p = run(() => def.toPreview({}));
    report(!p.thrown, `toPreview tahan field kosong: ${def.id}`, p.thrown ? p.thrown.message : '');
  }
}

// ---------- Uji 3: toPreview menghasilkan string untuk data terisi ----------
for (const def of registry) {
  if (!def.toPreview || !samples[def.id]) continue;
  samples[def.id].forEach((sample, i) => {
    const r = run(() => def.toPreview(sample));
    const ok = !r.thrown && typeof r.value === 'string' && r.value.length > 0;
    report(ok, `toPreview ${def.id} #${i + 1}`, ok ? '' : 'tidak menghasilkan string');
  });
}

// ---------- Uji 4: dokumen gabungan, setiap pattern hanya cocok dengan blok miliknya ----------
const SEP = '\n\nParagraf di antara blok.\n\n';
const allBlocks = [];
for (const def of registry) {
  for (const sample of samples[def.id] ?? []) {
    allBlocks.push({ def, sample, md: def.toBlock(sample) });
  }
}
const doc = allBlocks.map((b) => b.md).join(SEP);

for (const def of registry) {
  const expected = allBlocks.filter((b) => b.def === def);
  if (!expected.length) continue;

  const matches = [...doc.matchAll(withGlobal(def.pattern))];
  const problems = [];
  if (matches.length !== expected.length) {
    problems.push(`ditemukan ${matches.length}, seharusnya ${expected.length}`);
  }
  matches.forEach((mm, i) => {
    const exp = expected[i];
    if (!exp) return;
    const back = def.fromBlock ? run(() => def.fromBlock(mm)).value : { ...mm.groups };
    const bad = def.fields.filter((f) => !same(exp.sample[f.name], back?.[f.name])).map((f) => f.name);
    if (bad.length) problems.push(`blok ${i + 1} salah: ${bad.join(', ')}`);
  });
  report(problems.length === 0, `dokumen gabungan ${def.id}`, problems.join('; '));
}

// ---------- Uji 5: normalisasi HTML (class tambahan dan spasi sebelum ">") ----------
for (const def of registry) {
  if (def.id === 'callout') {
    info('callout tidak diuji normalisasi: pola tetap seperti semula dan sudah berfungsi di Sveltia');
    continue;
  }
  if (NORMALIZE_SKIP.has(def.id) || !samples[def.id]) continue;

  samples[def.id].forEach((sample, i) => {
    const label = `normalisasi ${def.id} #${i + 1}`;
    const md = def.toBlock(sample);
    const norm = md
      .replace(/class="([^"]*)"/g, 'class="$1 ekstra-uji"')
      .replace(/">/g, '" >');

    const m = def.pattern.exec(norm);
    if (!m) {
      report(false, label, 'pattern tidak cocok setelah class tambahan');
      return;
    }
    const back = def.fromBlock ? run(() => def.fromBlock(m)).value : { ...m.groups };
    const bad = def.fields.filter((f) => !same(sample[f.name], back?.[f.name])).map((f) => f.name);
    report(bad.length === 0, label, bad.length ? `beda: ${bad.join(', ')}` : '');
  });
}

// ---------- Uji 6: aturan validasi URL menerima sampel dan menolak input salah ----------
for (const def of registry) {
  if (!samples[def.id]) continue;
  for (const f of def.fields) {
    if (!Array.isArray(f.pattern)) continue;
    const re = new RegExp(f.pattern[0]);
    const valid = samples[def.id][0][f.name];
    if (valid) {
      report(re.test(String(valid)), `validasi ${def.id}.${f.name} menerima contoh`, re.test(String(valid)) ? '' : `${valid}`);
    }
    report(!re.test('bukan link'), `validasi ${def.id}.${f.name} menolak input salah`);
  }
}

// ---------- Uji 7: field di config.yml sama dengan komponen yang terdaftar ----------
const yml = read('public/admin/config.yml');
const listed = [
  ...new Set(
    [...yml.matchAll(/editor_components:\s*\[([^\]]*)\]/g)]
      .flatMap((m) => m[1].split(','))
      .map((s) => s.replace(/['"\s]/g, ''))
      .filter(Boolean),
  ),
];

if (!listed.length) {
  info('config.yml: tidak menemukan editor_components satu baris. Periksa manual.');
} else {
  const ids = registry.map((d) => d.id);
  for (const id of listed) {
    const ok = ids.includes(id);
    report(ok, `config "${id}" punya definisi`, ok ? '' : 'ada di config.yml tapi tidak didefinisikan');
  }
  for (const id of ids) {
    const ok = listed.includes(id);
    report(ok, `definisi "${id}" dipakai di config`, ok ? '' : 'didefinisikan tapi tidak ada di config.yml');
  }
}

// ---------- Uji 9: math dan mermaid tahan terhadap escape markdown dari editor ----------
// Editor bisa menggandakan backslash dan mengubah newline saat menyimpan.
// Uji ini meniru perlakuan itu pada markdown yang dihasilkan toBlock.
for (const id of ['math', 'mermaid']) {
  const def = registry.find((d) => d.id === id);
  samples[id].forEach((sample, i) => {
    const label = `escape editor ${id} #${i + 1}`;
    const md = def.toBlock(sample);
    const problems = [];
    if (md.includes('\\')) problems.push('markdown hasil toBlock mengandung backslash');

    const escaped = md.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    const m = def.pattern.exec(escaped);
    if (!m) {
      report(false, label, 'pattern tidak cocok setelah escape');
      return;
    }
    const back = run(() => def.fromBlock(m)).value;
    const bad = def.fields.filter((f) => !same(sample[f.name], back?.[f.name])).map((f) => f.name);
    if (bad.length) problems.push(`beda setelah escape: ${bad.join(', ')}`);
    report(problems.length === 0, label, problems.join('; '));
  });
}

// ---------- Uji 8: skrip browser valid dan semua aset /vendor/ yang dirujuknya ada ----------
// Ini menangkap ketidakcocokan antara blocks.js dan hasil vendor-blocks.mjs.
const blocksSrc = read('public/js/blocks.js');
try {
  new Function(blocksSrc); // hanya parse, tidak dijalankan
  report(true, 'public/js/blocks.js sintaksnya valid');
} catch (err) {
  report(false, 'public/js/blocks.js sintaksnya valid', err.message);
}

const vendorRefs = [...new Set([...blocksSrc.matchAll(/['"`](\/vendor\/[^'"`]+)['"`]/g)].map((m) => m[1]))];
const vendorDir = (ref) => new URL(`public${ref}`, ROOT);
for (const ref of vendorRefs) {
  const exists = existsSync(vendorDir(ref));
  report(exists, `aset ${ref} ada`, exists ? '' : 'jalankan: node scripts/vendor-blocks.mjs');
}
if (!vendorRefs.length) report(false, 'blocks.js tidak merujuk aset /vendor/ apa pun');

// ---------- Ringkasan ----------
console.log('');
console.log(failures ? `${failures} uji GAGAL` : 'Semua uji lulus');
process.exitCode = failures ? 1 : 0;
