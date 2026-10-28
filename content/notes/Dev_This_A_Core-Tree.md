---
title: 'A. Pohon struktur kode inti: Komponen, styling dasar, content collection'
description: Penjelasan arsitektur aplikasi dan hubungan antar komponen dalam cakupan luas
img: ''
tags: []
date: 2025-01-01
category: DeveloperDocs
---

## Struktur pohon file

**ingat:**

pages/index.astro secara alami hanyalah entry point dari url domain.
Jika suatu saat anda ingin merubah struktur file untuk kebutuhan pribadi, pastikan anda memahami bagaimana astro bekerja dalam memetakan rute url berbasis hierarki file serta penyesuaian ulang jalur import antar komponen.

```text
├── public/   # Assets statis dan konfigurasi integrasi Sveltia-CMS.
│   ├── site.webmanifest
│   ├── Content-Security-Policy     # Pertahanan CSP Netlify
│   ├── robots.txt      # Izin crawler bot AI/Search engine
│   ├── fonts/          # font .woff2 global
│   ├── js
│   │   └── block.js         # Fungsi render katex & mermaid from vendor/ hardcoded library
│   ├── vendor/              # hard copy node/dist temporary, tutorial di docs/id/sveltia-custom-block.md
│   │   └── katex/           # fonts, katex.min.css katex.min.js
│   │   └── mermaid/         # chunks/ mermaid.esm.min.js
│   ├── styles/
│   │   └── callouts.css          # styling kostum khusus editor component sveltia
│   └── admin/
│       ├── chunks/               # Sveltia engine
│       ├── config.yml            # Konfigurasi skema Dashboard
│       ├── index.html            # Entry Point url/admin
│       ├── editor-components.js  # Custom Block components
│       └── sveltia-cms.js        # Sveltia core
│
├── scripts/
│   ├── generate-content.js         # Scripts untuk manual generate content (via CLI bun new-notes, bun new-blog)
│   └── test-editor-components.mjs  # Scripts Pengujian otomatis untuk editor-components custom sveltia
│
├── content/
│   ├── blogging/            # File Markdown (.md) untuk blog profesional
│   │   └── post-1.md
│   ├── notes/               # File Markdown (.md) untuk Quil Notes (brainstorming)
│   │   └── note-1.md
├── src/
│   ├── components/
│   │   ├── AccesibilityDock.astro  # Modal popup Aksesibilitas universal
│   │   └── ThemeInit.astro  # (Sudah ada dahulu) Komponen yang menginisialisasi tema (dark/light) untuk dev/
│   ├── layouts/
│   │   ├── DevLayout.astro     # layout utama dev portofolio (head, navbar, footer)
│   │   └── QuilLayout.astro   # Layout utama khusus untuk semua halaman Quil Notes
│   ├── styles/
│   │   └── globals.css      # CSS global (reset, font, warna, dll.)
│   ├── scripts/
│   │   ├── canvas-utils.ts   # Optimasi javascript dev/ AboutMe & Milestone
│   │   ├── a11y.ts           # Accesibility functionability
│   │   ├── tts.ts            # Text-to-Speech via web API Logic
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
├── package.json
└── LICENSE
```

## Diagram relasi antar komponen

Soon!
