## Struktur folder

ingat:
pages/index.astro adalah entry point sebagai Landing page.

```text
├── public/   # Assets statis seperti gambar, favicon, dll.
│   └── admin/ 
│       ├── chunks/
│       ├── index.html 
│       └── sveltia-cms.js
│
├── scripts/   # Scripts untuk generate content (via CLI bun new-notes, bun new-blog)
│   └── generate-content.js
│
├── content/
│   ├── blogging/            # File Markdown (.md) untuk blog profesional
│   │   └── post-1.md
│   ├── notes/               # File Markdown (.md) untuk Quil Notes (brainstorming)
│   │   └── note-1.md
├── src/
│   ├── components/
│   │   ├── Navbar.svelte    # (Sudah ada dahulu) Menu navigasi responsif (seperti di mockup)
│   │   ├── AboutMe.astro  # Komponen statis untuk Hero Canvas (animasi hero)
│   │   ├── HeroCanvas.astro  # Komponen statis untuk Hero Canvas (animasi hero)
│   │   ├── Certification.astro  # Komponen statis untuk bukti Sertifikasi
│   │   ├── Milestone.astro   # Komponen statis untuk Experience
│   │   ├── BlogFeeds.astro   # Komponen statis untuk Blog khusus portofolio
│   │   ├── Projects.astro   # Komponen statis untuk Blog khusus show proyek
│   │   └── ThemeInit.astro  # (Sudah ada dahulu) Komponen yang menginisialisasi tema (dark/light)
│   ├── layouts/
│   │   ├── Layout.astro     # Main layout (head, navbar, footer)
│   │   └── QuilLayout.astro   # Layout utama khusus untuk semua halaman Quil Notes
│   ├── styles/
│   │   └── globals.css      # CSS global (reset, font, warna, dll.)
│   ├── content.config.ts
│   └── pages/
│       ├── index.astro      # Entry-point halaman ala linktree
│       ├── dev/
│       │   └── index.astro  # Sub-Page developer Portofolio (panggil komponen; About, Exp, Cert, Project..etc)
│       └── quil-notes/
│           │
│           ├── _components/
│           │   ├── QuilNavbar.astro   # Navigasi atas (Xnshi Note's, Home, Archive, About, Search Bar)
│           │   ├── QuilSidebar.astro  # Sidebar kiri (Profil Axel Kenshi, Categories, Tags)
│           │   ├── SearchBar.svelte   # Search Bar dengan Vanilla JS Logic + Dropdown Popup Overlay
│           │   └── Pagination.astro   # Komponen kontrol halaman (1, 2, 3... 25)
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

### Jika folder public/admin/ masih kosong, maka lakukan:

1. Salin file sveltia-cms.js dari node modules

```bash
cp node_modules/@sveltia/cms/dist/sveltia-cms.js public/admin/
```

2. Salin folder chunks dari node modules
```bash
cp -r node_modules/@sveltia/cms/dist/chunks public/admin/
```

3. Buat file index html yang memanggil `<script src="sveltia-cms.js"></script>`

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
