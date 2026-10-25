<!-- Banner -->
<img width="1679" height="1080" alt="Image" src="https://github.com/user-attachments/assets/e45ec4c9-fd2b-447c-bda0-89da5cfb3e86" />

---

<p align="center">
  <!-- Badge Dokumentasi Interaktif DeepWiki -->
  <a href="https://deepwiki.com/axelkenshi/axel-portofolio">
    <img src="https://img.shields.io/badge/Ask_DeepWiki-%5Binteractive_Docs%5D-4ee31a?style=for-the-badge&logo=databricks&logoColor=white" alt="Ask DeepWiki">
  </a>
  <!-- Badge Netlify deployment -->
  <a href="https://app.netlify.com/sites/myaxel/deploys">
    <img src="https://api.netlify.com/api/v1/badges/bbbaf767-8c46-4f47-8536-b2e61cecb094/deploy-status" alt="Netlify Status">
  </a>
  <!-- Badge Transparansi AI-Assisted -->
  <a href="#catatan-pengembangan--transparansi-ai">
    <img src="https://img.shields.io/badge/AI_Assisted-Claude_%26_DeepSeek-blueviolet?style=for-the-badge&logo=openai&logoColor=white" alt="AI Assisted">
  </a>
  <a href="https://github.com/axelkenshi/axel-portofolio/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License">
  </a>
  <a href="https://astro.build">
    <img src="https://img.shields.io/badge/Astro-v7.0-FF5D01?style=for-the-badge&logo=astro&logoColor=white" alt="Astro v7">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4">
  </a>
  <a href="https://svelte.dev">
    <img src="https://img.shields.io/badge/Svelte-v5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte 5">
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-v6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 6">
  </a>
  <a href="https://github.com/sveltia/sveltia-cms">
    <img src="https://img.shields.io/badge/Sveltia_CMS-v0.248.0-4B32C3?style=for-the-badge&logo=git&logoColor=white" alt="Sveltia CMS">
  </a>
</p>

<h3 align="center">Website portofolio sederhana dengan mesin rendering blog yang modern.</h3>

---

## Daftar isi README

- [Tentang proyek](#tentang-proyek)
- [Fitur utama](#fitur-utama)
- [Gambaran struktur](#gambaran-struktur)
- [Memulai](#memulai)
  - [Prasyarat](#prasyarat)
  - [Clone repository](#clone-repository)
  - [Development lokal](#development-lokal)
  - [Mengaktifkan Sveltia CMS](#mengaktifkan-sveltia-cms)
- [Deploy ke Netlify](#deploy-ke-netlify)
- [Catatan Pengembangan](#catatan-pengembangan--transparansi-ai)
- [Dokumentasi lanjutan](#dokumentasi-lanjutan)
- [Opsional: Ringkasan untuk pages/index.astro](LandingPage_docs.id.md)
- [Lisensi](#lisensi)

---

## Tentang proyek

Ini adalah website portofolio biasa. Namun, yang membuat repository ini menarik adalah fungsionalitas inti di `src/pages/quil-notes`, yaitu mesin rendering konten berbasis Markdown dengan Astro Content Collection.

Bagian `pages/index.astro` dan `pages/dev` adalah kebutuhan pribadi saya sebagai pengembang untuk portofolio. Anda bisa mengabaikannya atau mencabut integrasinya, lalu cukup menyisakan `/quil-notes` sebagai mesin rendering blog. Setelah itu, silakan kembangkan menjadi hal lain sesuka hati.

## Fitur utama

- **Quil Notes**: mesin blog berbasis Markdown dengan halaman feed, arsip, kategori, tag, pencarian, dan navigasi antar catatan.
- **Sveltia CMS**: dashboard penulisan di `/admin` dengan custom block seperti gambar, video, tautan, kode, terminal, dan rumus.
- **Rumus dan diagram**: KaTeX dan Mermaid dimuat dari aset yang disimpan di proyek sendiri, sehingga tidak bergantung pada CDN.
- **Tema terang dan gelap**: mengikuti preferensi sistem dan bisa diubah pengguna.
- **Portofolio /dev**: halaman profil pribadi yang bersifat opsional dan bisa dicabut kapan saja.

## Gambaran struktur

Berikut peta tingkat tinggi. Detail teknis setiap bagian akan dijelaskan di dokumentasi terpisah [Lihat panduan kode inti](#dokumentasi-lanjutan).

```text
├── public/      # Aset statis, konfigurasi Sveltia CMS, dan aset vendor
├── scripts/     # Script bantu dan pengujian otomatis
├── content/     # Isi konten Markdown (blogging dan notes)
├── src/
│   ├── components/   # Komponen bersama
│   ├── layouts/      # Kerangka halaman (Quil Notes dan portofolio)
│   ├── styles/       # CSS global
│   └── pages/
│       ├── quil-notes/   # Mesin rendering blog (inti proyek)
│       ├── dev/          # Portofolio pribadi (opsional)
│       └── index.astro   # Landing page
├── astro.config.mjs
└── package.json
```

## Memulai

### Prasyarat

- **Node.js 22.12** (Saat ini) atau lebih baru
- **Bun** sebagai package manager dan runner script (Pastikan versi Node.js sesuai dengan spesifikasi yang dibutuhkan Bun versi tertentu)

### Clone repository

```bash
git clone https://github.com/axelkenshi/axel-portofolio.git
cd axel-portofolio
```

### Development lokal

Pasang dependensi, lalu jalankan server development:

```bash
bun install
bun run dev
```

Buka `http://localhost:4321` di browser. Untuk membaca [dokumentasi tingkat lanjut](#dokumentasi-lanjutan) di mode lokal, ganti domain pada tautan dokumentasi dengan `localhost:4321`.

### Mengaktifkan Sveltia CMS

Dependensi `@sveltia/cms` sudah tercantum di `package.json`, jadi cukup jalankan `bun install`. Jika folder `public/admin/` masih kosong, salin berkas berikut dari `node_modules`:

Abaikan perintah ini bila di folder public/ sudah ada konfigurasinya, anda hanya perlu edit ringan nanti.

```bash
cp node_modules/@sveltia/cms/dist/sveltia-cms.js public/admin/
cp -r node_modules/@sveltia/cms/dist/chunks public/admin/
```

**Menguji CMS di lokal**

Sveltia hanya berjalan pada mode build atau production, tidak pada mode development. Jadi, jalankan:

```bash
bun run build
bun run preview
```

Lalu buka `http://localhost:4321/admin/`. Setiap kali mengubah konfigurasi CMS, jalankan build ulang untuk melihat hasilnya.

## Deploy ke Netlify

Saya memakai Netlify agar tidak perlu menulis serverless function sendiri untuk autentikasi GitHub di Sveltia.

**1. Hubungkan repository**

Di Netlify, pilih **Add new site > Import from GitHub**, lalu pilih repository Anda. Gunakan pengaturan berikut:

| Pengaturan        | Nilai           |
| ----------------- | --------------- |
| Install command   | `bun install`   |
| Build command     | `bun run build` |
| Publish directory | `dist`          |

_Lewati langkah ini jika site sudah pernah di-deploy._

**2. Buat GitHub OAuth App**

Buka GitHub > Settings > Developer settings > OAuth Apps > New OAuth App, lalu isi:

- **Homepage URL**: domain website Anda
- **Authorization callback URL**: `https://api.netlify.com/auth/done`

Simpan **Client ID**, lalu buat **Client Secret**.

**3. Aktifkan provider GitHub di Netlify**

Buka site Anda di Netlify > **Project configuration > Access & security > OAuth**. Lokasi menu ini bisa berbeda di UI terbaru. Install provider GitHub, lalu masukkan Client ID dan Client Secret dari langkah sebelumnya.

**4. Pastikan konfigurasi CMS**

Pastikan `public/admin/config.yml` tidak memiliki `base_url`. Dengan begitu, Sveltia memakai login Netlify. Login hanya dibutuhkan saat mengedit dari website yang sudah di-deploy.

Jangan lupa untuk mengganti juga bagian ini `config.yml`, arahkan ke repositori anda.

```yml
backend:
  name: github
  repo: USERNAME/REPO-NAME
  branch: main
```

<details>
<summary><strong>mengatur arah domain website pada source code ini?</strong></summary>

Ubah nama domain anda pada 2 hal utama ini:

1. `astro.config.mjs` pada bagian `site: "https://your.example",`
2. `pages/rss.xml.js` pada bagian `<url> , <title> , <link>`

`Sisanya, seperti link anchor pada footer QuilLayout dan pada komponen lain bisa anda atur nanti.`

</details>

<details>
<summary><strong>Apakah sebenarnya untuk hosting tidaklah bergantung dengan netlify?</strong></summary>
Ya, Tidak ada ketergantungan yang mengikat untuk menggunakan netlify,

Secara personal, keputusan saya menggunakan netlify adalah kemudahan OAuth akun github di sisi deployment. Tidak ada integrasi plugin atau konfigurasi serverless, yah mungkin ini juga berlaku untuk hosting lain seperti vercel, cloudflare dan lainnya. Anda bisa sesuaikan sendiri.

Jika anda merasa tidak relavan menggunakan netlify
Hapus file `netlify.toml` dan pertahanan CSP Netlify di folder `public/Content-Security-Policy`

Tujuan awal website ini dirancang untuk penggunaan personal seperti blogging/storytelling, tetapi jika anda tertarik menggunakannya untuk penggunaan organisasi, anda perlu merombak integrasi CMS menyeluruh dan beberapa hal lainnya secara mandiri.

</details>

## Catatan Pengembangan & Transparansi AI

Proyek portofolio ini dirancang, diarahkan, dan dikurasi sepenuhnya oleh **Axel Kenshi** selaku *Lead Developer*. Dalam proses pembuatannya, pengembangan kode dan struktur logika banyak dibantu oleh model AI mutakhir (**Claude** dan **DeepSeek**) sebagai *pair programmer* untuk mempercepat *coding* dan optimalisasi arsitektur. 

Dokumentasi arsitektur mendalam dan diagram alur sistem dari proyek ini dapat diakses secara interaktif melalui [DeepWiki Axel-Portofolio](https://deepwiki.com/axelkenshi/axel-portofolio).

## Dokumentasi lanjutan

Seluruh dokumentasi teknis yang lebih detail disimpan di `content/notes/Dev...md`. Anda bisa membacanya langsung lewat antarmuka Quil Notes:

1. Panduan struktur kode inti (global): `https://axelkenshi.my.id/quil-notes/dev_this_core-engine`
2. Panduan kode Quil Notes: `https://axelkenshi.my.id/quil-notes/dev_this_quilnotes_code-structure`
3. Panduan pencabutan total `/dev` dan `pages/index.astro` _(segera hadir)_
4. Panduan konfigurasi Sveltia & custom block editor Sveltia: `https://axelkenshi.my.id/quil-notes/dev_this_sveltia_customization`

Ganti nama domain saya menjadi awalan localhost:4321 untuk melihatnya secara lokal, atau cari saja dalam kategori di laman Quil Notes dengan inisial DeveloperDocs

## Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE).
