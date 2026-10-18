<img width="1757" height="1080" alt="Image" src="https://github.com/user-attachments/assets/172cd83f-3f80-4fce-867b-2fe55a0b5015" />

## Struktur folder

ingat:
pages/index.astro adalah entry point sebagai Landing page.

```text
├── public/   # Assets statis dan konfigurasi integrasi Sveltia-CMS.
│   ├── robots.txt 
│   ├── site.webmanifest 
│   ├── Content-Security-Policy # Pertahanan CSP Netlify 
│   ├── styles/ 
│   │   └── callouts.css # styling kostum khusus editor component sveltia
│   └── admin/ 
│       ├── chunks/
│       ├── index.html
│       ├── editor-components.js
│       └── sveltia-cms.js
│
├── scripts/   # Scripts untuk manual generate content (via CLI bun new-notes, bun new-blog)
│   └── generate-content.js
│
├── content/
│   ├── blogging/            # File Markdown (.md) untuk blog profesional
│   │   └── post-1.md
│   ├── notes/               # File Markdown (.md) untuk Quil Notes (brainstorming)
│   │   └── note-1.md
├── src/
│   ├── components/
│   │   └── ThemeInit.astro  # (Sudah ada dahulu) Komponen yang menginisialisasi tema (dark/light)
│   ├── layouts/
│   │   ├── DevLayout.astro     # layout utama dev portofolio (head, navbar, footer)
│   │   └── QuilLayout.astro   # Layout utama khusus untuk semua halaman Quil Notes
│   ├── styles/
│   │   └── globals.css      # CSS global (reset, font, warna, dll.)
│   ├── scripts/
│   │   ├── canvas-utils.ts   # Optimasi javascript dev/ AboutMe & Milestone
│   │   └── translate/
│   │       └── translate-dom.ts   # Logika browser translator API chromium
│   ├── content.config.ts
│   │
│   └── pages/
│       ├── index.astro      # Entry-point halaman ala linktree
│       │
│       ├── dev/
│       │   ├── index.astro  # Sub-Page developer Portofolio (panggil komponen; About, Exp, Cert, Project..etc)
│       │   │
│       │   └── _components/
│       │       ├── Navbar.svelte    # (Sudah ada dahulu) Menu navigasi responsif (seperti di mockup)
│       │       ├── AboutMe.astro  # Komponen statis untuk Hero Canvas (animasi hero)
│       │       ├── HeroCanvas.astro  # Komponen statis untuk Hero Canvas (animasi hero)
│       │       ├── Certification.astro  # Komponen statis untuk bukti Sertifikasi
│       │       ├── Milestone.astro   # Komponen statis untuk Experience
│       │       ├── BlogFeeds.astro   # Komponen statis untuk Blog khusus portofolio
│       │       └── Projects.astro   # Komponen statis untuk Blog khusus show proyek
│       │
│       └── quil-notes/
│           │
│           ├── _components/
│           │   ├── QuilNavbar.astro   # Navigasi atas (Xnshi Note's, Home, Archive, About, Search Bar)
│           │   ├── QuilSidebar.astro  # Sidebar kiri (Profil Axel Kenshi, Categories, Tags)
│           │   ├── SearchBar.svelte   # Search Bar dengan Vanilla JS Logic + Dropdown Popup Overlay
│           │   ├── Pagination.astro   # Komponen kontrol halaman (1, 2, 3... 25) kolom kanan
│           │   ├── NextPrev.svelte    # Komponen kontrol feed next-previous pada kaki konten rendering slug
│           │   └── TranslateToggle.astro    # Komponen toggle id/en di area Meta Catatan isi konten slug
│           │
│           ├── index.astro            # Feed utama (Ekuivalen dengan Home)
│           ├── archive.astro          # Halaman Arsip/Lini Masa (seperti di screenshot archive)
│           ├── about.astro            # Halaman statis "About The Writer"
│           ├── [slug].astro           # Detail bacaan Markdown catatan
│           ├── page/
│           │   └── [page].astro        # halaman pagination
│           ├── tags/
│           │   └── [tag].astro        # Filter catatan berdasarkan Tag
│           └── categories/          
│               └── [category].astro   # Filter catatan berdasarkan Category tunggal
│
├── astro.config.mjs
├── bun.lock
├── svelte.config.js
├── tsconfig.json
└── package.json
```

## Cara menggunakan integrasi Sveltia

```bash
bun add @sveltia/cms

atau langsung saja gunakan (karena sudah tercantum di package.json):
bun install
```

lalu cobalah jalankan di mode lokal:

```bash
bun run build

bun run preview
```

kemudian akses pada url browser `http://localhost:4321/admin/`

### Cara menghubungkan autentikasi github pada sveltia di production

Dalam case ini, saya menggunakan netlify supaya tidak repot -bahkan tidak perlu menuliskan serverless function dalam integrasinya.

**Login GitHub di production (Netlify)**

Login hanya dibutuhkan saat mengedit dari website yang sudah di-deploy. Langkahnya:

a. Buat GitHub OAuth App

Buka GitHub > Settings > Developer settings > OAuth Apps > New OAuth App.
Homepage URL: https://axelkenshi.web.id
Authorization callback URL: https://api.netlify.com/auth/done
Simpan Client ID, lalu buat Client Secret.

b. Aktifkan provider di Netlify

Buka site Anda di Netlify > Project configuration > Access & security > OAuth. Lokasi menu ini bisa berbeda di UI terbaru.
Install provider GitHub, lalu masukkan Client ID dan Client Secret dari langkah (a).

c. Pastikan config.yml tidak punya base_url. Dengan begitu Sveltia memakai login Netlify. Tidak perlu menulis serverless function sendiri.

d. Hubungkan repo ke Netlify (Skip langkah ini jika sudah pernah deploy)

Add new site > Import from GitHub, pilih axelkenshi/axel-portofolio.
Build command: bun run build. Publish directory: dist.
Install command: bun install.
Project ini membutuhkan Node 22.12 atau lebih baru

### Jika folder public/admin/ masih kosong, maka lakukan:

1. Salin file sveltia-cms.js dari node modules

```bash
cp node_modules/@sveltia/cms/dist/sveltia-cms.js public/admin/
```

2. Salin folder chunks dari node modules

```bash
cp -r node_modules/@sveltia/cms/dist/chunks public/admin/
```

3. Buat file index.html pada public/admin/ yang memanggil `<script src="sveltia-cms.js"></script>`

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sveltia CMS</title>
  </head>
  <body>
    <script src="sveltia-cms.js"></script>
  </body>
</html>
```

## Perubahan class tailwind khusus /quil-notes

Baru-baru ini, 16-10-2026. Saya memutuskan untuk mengembangkan fitur toggle mode gelap/terang pada seluruh bagian milik `quil-notes/` karena sebelumnya UI notes secara keseluruhan dikunci pada tema gelap saja.
Saya berpikir untuk membuat metode baru yang memisahkan `@custom-variant quil-dark` sehingga memungkinkan kostumisasi tema latar secara independen tanpa mengganggu fungsionalitas tema milik /dev (portofolio web).

Kesimpulannya, saya melakukan refactor penuh pada seluruh isi `quil-notes/ & layouts/QuilLayout.astro` yang ditujukan pada kelas tailwind seperti pada tabel dibawah.

Sebagai acuan jika anda ingin mengembangkan lagi `quil-notes/` maka sesuaikan analogi kelas tailwind lama menjadi yang baru berikut agar mendukung mekanisme toggle tema secara dinamis.

| Kelas lama | Kelas baru |
| :--- | :--- |
| `text-zinc-100`, `text-zinc-200` | `text-quil-fg` |
| `text-zinc-300`, `text-zinc-400` | `text-quil-fg-soft` |
| `text-zinc-500` | `text-quil-fg-muted` |
| `text-zinc-600`, `text-zinc-700` | `text-quil-fg-faint` |
| `text-zinc-800`, `text-zinc-900` (separator) | `text-quil-border` |
| `hover:text-zinc-200`, `group-hover:text-zinc-100` | `hover:text-quil-fg` |
| `bg-zinc-900/xx` | `bg-quil-surface/xx` |
| `bg-zinc-950/xx` | `bg-quil-well/xx` |
| `bg-zinc-800/xx` (latar hover) | `bg-quil-border/xx` |
| `border-zinc-800/xx`, `border-zinc-900/xx` | `border-quil-border/xx` |
| `hover:border-zinc-700` | `hover:border-quil-border-strong` |

Setelah itu, lakukan pengecekan apakah ada kelas tailwind "zinc" yang tersisa pada QuilLayout.astro dan quil-notes/

```bash
rg -n "zinc-" src/layouts src/pages/quil-notes
```

```bash
git diff --stat                              # tidak boleh ada file di src/pages/dev atau index.astro
rg -n "dark:" src/pages/quil-notes src/layouts   # harus kosong, atau hanya kelas yang sengaja tidak diubah
rg -n "quil-dark" src                        # harus hanya di quil
```
