---
title: F. Aksesibilitas global
description: Dokumentasi pengembangan fitur aksesibilitas web ini
img: ''
tags: []
date: 2025-01-06
category: DeveloperDocs
---

## Dokumentasi Fitur Aksesibilitas

Dokumen ini menjelaskan dock aksesibilitas (dock a11y) yang digunakan oleh portofolio (`/dev`) dan Quil Notes. Dokumen ini mencakup arsitektur, pengaturan yang disediakan, cara setiap pengaturan diterapkan, cara dock menyesuaikan diri dengan token desain setiap situs, dan aturan yang menjaga font disleksia tetap berada dalam cakupan yang benar.

---

## Daftar isi

[Ikhtisar](#ikhtisar)  
[Berkas](#berkas)  
[Pengaturan](#pengaturan)  
[Arsitektur](#arsitektur)  
[Cara sebuah pengaturan diterapkan](#cara-sebuah-pengaturan-diterapkan)  
[Token desain dan tema](#token-desain-dan-tema)  
[Cakupan konten: `data-a11y-text`](#cakupan-konten-data-a11y-text)  
[Elemen `#quil-content`](#elemen-quil-content)  
[Cakupan font disleksia](#cakupan-font-disleksia)  
[Keluar dari penerapan dengan `.a11y-keep-font`](#keluar-dari-penerapan-dengan-a11y-keep-font)  
[Mode fokus membaca](#mode-fokus-membaca)  
[Label dua bahasa (ID / EN)](#label-dua-bahasa-id--en)  
[Kendala yang ditemui dan cara memperbaikinya](#kendala-yang-ditemui-dan-cara-memperbaikinya)  
[Item yang masih terbuka](#item-yang-masih-terbuka)  
[Daftar periksa pengujian](#daftar-periksa-pengujian)  

---

## Ikhtisar

Dock a11y adalah panel samping modal. Panel ini dibuka dari bilah navigasi dan menyediakan:

- Ukuran teks (normal, besar)
- Jarak huruf dan baris (normal, lebar)
- Kontras (normal, tinggi)
- Filter simulasi penglihatan warna (eksperimental)
- Skala abu-abu
- Font ramah disleksia
- Mode fokus membaca (hanya desktop)
- Kurangi gerakan
- Kontrol baca nyaring (eksperimental, lihat `scripts/tts.ts`)
- Atur ulang

Pengaturan disimpan di `localStorage` dengan kunci `a11y` dan diterapkan sebagai atribut `data-*` pada `< html >`. CSS merespons atribut tersebut. Tidak ada pengaturan yang mengubah markup halaman.

## Berkas

| Berkas | Tanggung jawab |
| --- | --- |
| `src/components/AccessibilityDock.astro` | Markup dialog, definisi filter warna SVG, logika pergantian bahasa, skrip penerapan awal inline |
| `src/scripts/a11y.ts` | State (`load`, `save`, `apply`, `syncControls`), `setupA11y`, `setupDock` (event delegation) |
| `src/scripts/tts.ts` | Logika baca nyaring (tidak dibahas di sini) |
| `src/styles/a11y.css` | Seluruh CSS aksesibilitas: pengaturan, fokus, gerakan, gaya dialog |
| `src/styles/global.css` | Token desain untuk setiap situs, pemetaan token kontras |
| `src/layouts/QuilLayout.astro` | Layout Quil: `html.quil-root`, penanda cakupan `#quil-content`, pengaitan skrip |
| `src/pages/quil-notes/_components/QuilNavbar.astro` | Tombol pemicu dock (desktop dan mobile) |

## Pengaturan

Setiap pengaturan dipetakan ke satu kunci di `A11yState` dan satu atribut `data-*` pada `< html >`. Nilai default akan menghapus atribut tersebut.

| Pengaturan | Kunci state | Nilai | Atribut `< html >` |
| --- | --- | --- | --- |
| Ukuran teks | `textSize` | `normal`, `large` | `data-text-size="large"` |
| Jarak | `spacing` | `normal`, `wide` | `data-spacing="wide"` |
| Kontras | `contrast` | `normal`, `high` | `data-contrast="high"` |
| Filter warna | `colorFilter` | `none`, `protanopia`, `deuteranopia`, `tritanopia` | `data-color-filter="..."` |
| Skala abu-abu | `monochrome` | boolean | `data-monochrome="true"` |
| Font disleksia | `dyslexic` | boolean | `data-dyslexic="true"` |
| Kurangi gerakan | `reduceMotion` | boolean | `data-reduce-motion="true"` |
| Fokus membaca | `readFocus` | boolean | `data-read-focus="true"` |

State default adalah:

```ts
const DEFAULTS: A11yState = {
  textSize: "normal",
  spacing: "normal",
  contrast: "normal",
  colorFilter: "none",
  monochrome: false,
  dyslexic: false,
  reduceMotion: false,
  readFocus: false,
};
```

## Arsitektur

Sistem ini terdiri dari tiga lapisan:

1. **Penerapan awal (inline, di dalam `< body >`).** Skrip `is:inline` kecil membaca `localStorage` dan mengatur atribut `data-*` sebelum dialog ditampilkan. Ini mencegah kilasan state default saat halaman dimuat.
2. **Mesin state (`a11y.ts`).**
   - `load()` dan `save()` membaca dan menulis `localStorage`, dengan try/catch.
   - `apply(state)` menulis atribut `data-*`. Nilai default akan menghapus atribut.
   - `syncControls(state)` memperbarui `aria-checked` pada tombol radio dan `checked` pada kotak centang.
   - `setupA11y()` menghubungkan kontrol di dalam dialog. Fungsi ini aman dipanggil pada setiap navigasi.
3. **Dock (event delegation).** `setupDock()` memasang satu listener `click` pada `document`. Listener ini menangani:
   - `[data-open="< name >"]`: membuka `<dialog data-dialog="< name >">`.
   - `[data-close]` dan `[data-close-on-click]`: menutup dialog yang memuatnya.
   - Klik pada backdrop: klik pada elemen dialog itu sendiri akan menutup dialog.

Karena dock menggunakan event delegation dan hanya dihubungkan sekali (flag `dockWired`), dock tetap berfungsi setelah DOM diganti, misalnya setelah navigasi `ClientRouter`.

## Cara sebuah pengaturan diterapkan

Setiap pengaturan murni berbasis CSS yang digerakkan oleh atribut pada `< html >`. Contohnya:

```css
html[data-text-size="large"] [data-a11y-text] {
  font-size: 1.25em;
}
```

Aturan-aturan ini **tanpa layer** (tanpa `@layer`). Aturan tanpa layer menang atas semua layer Tailwind (`base`, `components`, `utilities`), sehingga override aksesibilitas tetap berlaku meskipun elemen juga memiliki kelas utilitas Tailwind.

## Token desain dan tema

Dock harus bekerja di beberapa situs dengan palet warna yang berbeda. Karena itu, dock hanya membaca token miliknya sendiri, dan setiap situs memetakan token tersebut ke warnanya sendiri.

**Token komponen** (didefinisikan di `a11y.css`, dipetakan per situs):

| Token | Arti |
| --- | --- |
| `--a11y-bg` | Latar dialog dan kontrol |
| `--a11y-fg` | Warna teks dialog dan kontrol |
| `--a11y-border` | Border dialog dan kontrol |
| `--a11y-well` | Permukaan yang tampak cekung |
| `--a11y-accent` | Cincin fokus, kotak centang, slider, petunjuk |

**Palet kontras** (universal, di `a11y.css`):

| Token | Nilai |
| --- | --- |
| `--a11y-hc-light-bg` | `#ffffff` |
| `--a11y-hc-light-fg` | `#000000` |
| `--a11y-hc-dark-bg` | `#000000` |
| `--a11y-hc-dark-fg` | `#ffffff` |

`a11y.css` tidak pernah menyebut token situs (seperti `--color-tan`, `--quil-card`, dan sebagainya) dan tidak pernah menargetkan warna `html` atau `body`. Dengan begitu, komponen tetap universal.

**Pemetaan situs.**

- Portofolio (`global.css`, bagian portofolio):

  ```css
  html[data-contrast="high"] {
    --color-tan: var(--a11y-hc-light-bg);
    --color-dark: var(--a11y-hc-light-fg);
  }
  ```

- Quil (`global.css`, bagian Quil, setelah blok `@layer utilities`):

  ```css
  html.quil-root[data-contrast="high"] {
    --quil-card: var(--a11y-hc-light-bg);
    --quil-fg: var(--a11y-hc-light-fg);
    /* ...token muted dan border... */
  }
  html.quil-root.quil-dark[data-contrast="high"] {
    --quil-card: var(--a11y-hc-dark-bg);
    /* ... */
  }
  ```

`--quil-bg` **sengaja tidak** diubah pada mode terang kontras tinggi. Kartu dipisahkan dari halaman dengan border hitam.

Override kontras Quil menggunakan selector `html.quil-root`. Kelas ini diatur pada elemen `< html >` di `QuilLayout.astro`. Tanpa kelas ini, token Quil tidak akan berganti.

## Cakupan konten: `data-a11y-text`

Pengaturan teks (ukuran, jarak, font disleksia) tidak boleh memengaruhi navigasi, footer, atau dialog itu sendiri. Cakupan ditentukan oleh satu atribut:

```html
<section id="quil-content" data-a11y-text>
```

Hanya elemen di dalam leluhur `[data-a11y-text]` yang terpengaruh oleh:

- Ukuran teks
- Jarak (huruf, kata, baris, dan margin paragraf)
- Font disleksia

Elemen di luar cakupan, seperti navbar, sidebar `< aside >`, footer, dan dialog dock, tidak pernah diubah.

**Mengapa menggunakan atribut dan bukan kelas atau daftar selector.** Versi sebelumnya menargetkan `.quil-prose` dan `.blog-prose`. Hasilnya tidak konsisten, karena:

- Halaman tanpa pembungkus tersebut (misalnya `about.astro`) tidak terpengaruh.
- Aturan `body` untuk font disleksia bocor ke semua elemen yang mewarisi dari `body`, termasuk tautan navbar dan dialog.
- `< p >` dan `< h1 >` hingga `< h3 >` memiliki `font-family` sendiri dari `@layer base`, sehingga pewarisan dari `body` tidak dapat mencapainya.

Satu atribut menyelesaikan ketiga masalah tersebut.

## Elemen `#quil-content`

`#quil-content` adalah kolom konten utama di `QuilLayout.astro`:

```astro
<section id="quil-content" data-a11y-text class="lg:col-span-9 quil-garden flex flex-col gap-6 scroll-mt-24">
  <div class="bg-quilCard border border-quil-border rounded-2xl p-6 lg:p-8 shadow-xl flex-grow">
    <slot />
  </div>
</section>
```

Elemen ini memiliki tiga fungsi:

1. **Cakupan aksesibilitas.** `data-a11y-text` membuat seluruh konten (slot) setiap halaman Quil dapat menerima pengaturan teks, termasuk `about.astro`, tanpa mengedit setiap halaman. Navbar, `< aside >` sidebar, footer, dan dock berada di luar section ini, sehingga fontnya tidak pernah berubah.
2. **Target scroll.** Skrip inline di `QuilLayout` menggunakan `#quil-content` untuk menggulir konten ke tampilan pada layout bertumpuk (mobile dan tablet).
3. **Target fokus membaca.** Pada mode fokus membaca, `< aside >` sidebar disembunyikan dan `#quil-content` dilebarkan ke seluruh lebar grid:

   ```css
   html[data-read-focus="true"] #quil-content {
     grid-column: 1 / -1;
   }
   ```

   Tanpa aturan ini, konten tetap memakai `col-span-9` dan meninggalkan kolom kosong di sebelah kanan.

**Aturan untuk kontributor:** jika halaman atau komponen baru **tidak** boleh menerima font disleksia atau perubahan ukuran teks, letakkan elemen tersebut di luar `#quil-content`, atau beri elemen tersebut kelas `.a11y-keep-font` (lihat di bawah). Jangan menambahkan atribut cakupan baru untuk halaman tertentu.

## Cakupan font disleksia

Font disleksia diterapkan pada setiap turunan dari `[data-a11y-text]`, dengan pengecualian:

```css
html[data-dyslexic="true"] [data-a11y-text],
html[data-dyslexic="true"] [data-a11y-text] *:not(
  :is(pre, code, kbd, samp, pre *, code *, kbd *, samp *,
      .katex, .katex *, .mermaid, .mermaid *,
      .a11y-keep-font, .a11y-keep-font *)
) {
  font-family: var(--font-dyslexic);
}
```

Pengecualian:

| Elemen | Alasan |
| --- | --- |
| `pre`, `code`, `kbd`, `samp` dan turunannya | Kode harus tetap monospace. Span penyorotan sintaks di dalam `pre code` juga dikecualikan. |
| `.katex` dan turunannya | KaTeX mengatur font-nya sendiri. Override akan merusak rumus. |
| `.mermaid` dan turunannya | Teks diagram dirender sebagai SVG dengan pengaturan font sendiri. |
| `.a11y-keep-font` dan turunannya | Opt-out eksplisit (lihat di bawah). |

Blok kode menerima stack monospace yang eksplisit:

```css
html[data-dyslexic="true"] [data-a11y-text] :is(code, pre, kbd, samp) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

**Mengapa pengecualian dibuat eksplisit.** Pewarisan saja tidak cukup. Elemen `code` di dalam `p` akan mewarisi font disleksia dari `p`. Oleh karena itu, aturan pengecualian menetapkan font langsung pada elemen yang dikecualikan, dan tidak bergantung pada elemen induknya.

## Keluar dari penerapan dengan `.a11y-keep-font`

Tambahkan kelas `a11y-keep-font` pada elemen mana pun di dalam cakupan `[data-a11y-text]` yang harus mempertahankan font aslinya:

```astro
<p class="a11y-keep-font">Paragraf ini tetap menggunakan font situs.</p>
```

Fallback default adalah `--font-source-sans`. Untuk mempertahankan font lain, atur custom property pada elemen tersebut:

```astro
<span class="a11y-keep-font" style="--a11y-keep-font: 'Mark Script', cursive">Axel</span>
```

Aturannya adalah:

```css
html[data-dyslexic="true"] [data-a11y-text] .a11y-keep-font,
html[data-dyslexic="true"] [data-a11y-text] .a11y-keep-font * {
  font-family: var(--a11y-keep-font, var(--font-source-sans));
}
```

## Mode fokus membaca

Mode fokus membaca menyembunyikan setiap `< aside >` dan memperlebar kolom utama:

```css
html[data-read-focus="true"] aside {
  display: none !important;
}
html[data-read-focus="true"] main {
  max-width: 46rem;
}
html[data-read-focus="true"] #quil-content {
  grid-column: 1 / -1;
}
```

Dock menandai opsi ini sebagai hanya untuk desktop. Pada mobile dan tablet, layout sudah berkolom tunggal.

## Label dua bahasa (ID / EN)

Label dialog menggunakan dua span, satu untuk setiap bahasa:

```html
<span data-lang="id">Aksesibilitas</span><span data-lang="en">Accessibility</span>
```

Dialog menggunakan bahasa Indonesia secara default. Mengatur `data-a11y-lang="en"` pada dialog akan menukar bahasa yang tampil, dengan aturan berikut di `a11y.css`:

```css
dialog[data-dialog="a11y"]:not([data-a11y-lang="en"]) [data-lang="en"] { display: none !important; }
dialog[data-dialog="a11y"][data-a11y-lang="en"] [data-lang="id"] { display: none !important; }
```

Pilihan bahasa disimpan di `localStorage` dengan kunci `a11y-lang`. Tombol pengganti bahasa adalah `[data-lang-toggle]`.

## Kendala yang ditemui dan cara memperbaikinya

| Masalah | Penyebab | Perbaikan |
| --- | --- | --- |
| Aturan aksesibilitas tidak berpengaruh pada prose Quil | Aturan berada di dalam `@layer base`, layer dengan prioritas terendah. `tracking-wide`, `leading-relaxed`, dan margin tipografi di `utilities` menang pada elemen yang sama. | Menghapus pembungkus `@layer`. Aturan tanpa layer menang atas semua layer. |
| Font disleksia hanya muncul di sebagian halaman | Mekanisme yang bercampur: pewarisan dari `body` dan daftar selector. Elemen dengan `font-family` sendiri (`p`, `h1`–`h3`) tidak pernah tercapai oleh pewarisan. | Satu atribut cakupan `data-a11y-text`, dengan aturan eksplisit untuk setiap turunan. |
| Font disleksia bocor ke navbar dan dialog | `html[data-dyslexic] body` membuat `body` menggunakan font disleksia, dan teks tanpa font sendiri ikut mewarisinya. | Menghapus aturan `body`. Cakupan dibatasi pada `[data-a11y-text]`. |
| Mode kontras tinggi memaksa halaman putih pada mode terang dan gelap | `html[data-contrast="high"] body` mengatur `background` dan `color` secara langsung, melewati token. | Menghapus aturan tersebut. Kontras hanya bekerja melalui token. |
| Warna dialog tidak mengikuti tema Quil | Dialog menggunakan `bg-tan`, varian `dark:`, dan oranye yang ditulis langsung. | Dialog membaca token `--a11y-*`, yang dipetakan per situs. |
| Warna fokus tetap oranye | `#f97316` ditulis langsung. | Menggunakan `--a11y-accent`, yang dipetakan ke `--quil-accent` pada Quil. |
| `root` tidak terdefinisi di skrip penerapan awal | Variabel dideklarasikan setelah digunakan di dalam blok `try`, sehingga error-nya tertelan. | Deklarasikan `const root = document.documentElement;` di awal skrip inline. |
| Menu mobile tetap terbuka di belakang dialog | Panel mobile memanggil `stopPropagation`, sehingga listener klik `document` yang menutupnya tidak pernah terpanggil. | Tombol pemicu secara eksplisit memanggil `closeMobileMenu()`. |
| Mode fokus membaca menyisakan kolom kosong | `#quil-content` tetap menggunakan `col-span-9` setelah sidebar disembunyikan. | `grid-column: 1 / -1` pada `#quil-content` dalam mode fokus membaca. |
| Tabel dan kode inline melampaui kartu Quil | Plugin tipografi tidak membatasi elemen-elemen ini. | `.quil-prose table` menggunakan display block dengan scroll horizontal. `overflow-wrap: anywhere` pada kode inline. |

## Item yang masih terbuka

- **Import Tailwind ganda di `a11y.css`.** Berkas masih diawali dengan `@import "tailwindcss";`. Ini menduplikasi preflight dan utilities, dan aturan preflight yang muncul belakangan dapat menimpa ukuran heading dari `global.css`. Hapus baris ini.
- **`@apply` di `a11y.css`.** Aturan tombol `.a11y-tts` menggunakan `@apply bg-green-500` dan `@apply bg-red-600`. Setelah import dihapus, ganti dengan nilai biasa (`#22c55e` dan `#dc2626`).
- **Deklarasi font ganda.** `a11y.css` mengimpor `@fontsource/opendyslexic/400.css` dan juga mendeklarasikan `@font-face` untuk family yang sama. Pertahankan hanya `@font-face` lokal.
- **Selector ganda.** `.a11y-slider input, .a11y-slider input` muncul dua kali.
- **Baca nyaring.** `scripts/tts.ts` belum ditinjau dalam pass dokumentasi ini.
- **Cakupan portofolio.** Area konten portofolio perlu ditambahkan `data-a11y-text` pada pembungkusnya agar dapat menerima pengaturan teks.

## Daftar periksa pengujian

Jalankan daftar ini di mobile dan desktop, dalam mode terang dan gelap, untuk masing-masing: feed Quil, artikel Quil, `about`, dan halaman portofolio.

- [ ] Ukuran teks "besar" memperbesar teks artikel dan about, bukan navbar.
- [ ] Jarak "lebar" mengubah jarak huruf dan tinggi baris pada konten. Verifikasi di DevTools bahwa `html[data-spacing="wide"] [data-a11y-text]` tidak dicoret.
- [ ] Font disleksia berlaku untuk paragraf, item daftar, dan heading di dalam `#quil-content`.
- [ ] Tautan navbar, teks footer, dan teks dialog tetap menggunakan font aslinya.
- [ ] Blok kode dan kode inline tetap monospace.
- [ ] Rumus KaTeX dan diagram Mermaid tampil tanpa perubahan.
- [ ] Kontras tinggi: mode terang menampilkan halaman putih dengan border kartu hitam; mode gelap menampilkan halaman hitam dengan border putih. Teks footer tetap terbaca.
- [ ] Skala abu-abu dan filter warna berlaku untuk seluruh halaman.
- [ ] Kurangi gerakan menghentikan transisi dan animasi.
- [ ] Fokus membaca menyembunyikan sidebar, memperlebar konten, dan tidak menyisakan kolom kosong (hanya desktop).
- [ ] Atur ulang mengembalikan setiap kontrol ke nilai default dan menghapus semua atribut `data-*` dari `< html >`.
- [ ] Pengaturan tetap tersimpan setelah reload dan setelah navigasi.
- [ ] Dialog terbuka dari navbar desktop dan dari menu mobile, dan menu mobile tertutup.
- [ ] Tombol pengganti bahasa mengganti label dialog antara bahasa Indonesia dan Inggris.

Untuk memeriksa sebuah pengaturan, buka DevTools, pilih elemen, dan periksa `font-family`, `letter-spacing`, atau `background-color` yang terhitung. Aturan yang ditimpa akan tampil dicoret di panel Styles.
