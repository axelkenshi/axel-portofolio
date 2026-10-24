# Dokumentasi Arsitektur: Landing Page Astro

Dokumen ini dibuat sebagai panduan pemeliharaan (maintenance) untuk landing page bergaya *linktree* Anda di masa depan.

## 1. Filosofi Arsitektur
Halaman ini menganut prinsip **"Satu Halaman, Satu Tanggung Jawab"**. Berbeda dengan pendekatan Astro pada umumnya yang memecah UI menjadi banyak komponen, seluruh struktur HTML, styling (CSS), dan fungsionalitas (JavaScript) sengaja dikunci dalam satu file `.astro`. 

Tujuan pendekatan ini:
*   **Portabilitas Tinggi**: Mudah dipindahkan atau disalin ke proyek lain tanpa perlu melacak *import* komponen.
*   **Kontekstual**: Segala perubahan UI dan logikanya terpusat di satu tempat.
*   **Kemandirian**: Tidak ada *dependency* internal antar file (kecuali CSS global).

---

## 2. Struktur Data (Frontmatter)
Semua konten dinamis diatur melalui blok `---` di bagian paling atas file. Anda tidak perlu menyentuh HTML untuk memperbarui konten.

*   **`profile`**: Berisi data utama (Nama, Bio, Foto, URL Web3Forms). Terdapat properti `background`; jika `src` diisi, animasi *fallback* akan mati. Jika dikosongkan (`''`), latar animasi akan muncul.
*   **`work`**: *Array of objects* untuk portofolio di dalam dialog "Karya Digital". Mendukung properti `linkprev` (jika diisi, logo menjadi tautan yang bisa diklik).
*   **`socials`**: Daftar tautan ikon media sosial di bawah profil.
*   **`links`**: Daftar tautan utama berbentuk kapsul (Portofolio, Blog, ORB).
*   **Variabel Global**: 
    *   `siteUrl`: Mengambil dari `Astro.site` atau *fallback* URL.
    *   `hasBg`: Boolean untuk mengecek apakah CDN background diisi atau kosong.

---

## 3. Struktur HTML (Body)
Struktur halaman dibagi menjadi beberapa bagian logis:
1.  **Navigasi (`<nav>` & `<dialog>`)**: 
    *   Kiri: Ganti Bahasa (`lang-toggle`), Bagikan (`share-btn`).
    *   Kanan: Karya (`work-open`), Keahlian (`skill-open`), QR (`qr-open`).
    *   *Catatan*: Semua popup menggunakan elemen asli `<dialog>` HTML5.
2.  **Profil (`<header>`)**: Foto profil (bisa diklik), nama, peran, dan tautan sosial.
3.  **Tautan (`<section>`)**: Daftar kartu kapsul (`links`).
4.  **Kontak (`<section>`)**: Formulir Web3Forms dengan validasi matematika sederhana (Captcha).
5.  **Komentar (`<section>`)**: Container untuk *embed* Giscus.

---

## 4. Styling (CSS)
Styling ditulis di dalam tag `<style is:global>` untuk memastikan kelas-kelas bisa digunakan oleh *inline scripts* dan elemen dialog.

*   **Tema (Dark Mode Locked)**: Tema dikunci pada Dark Mode (kelas `dark` pada tag `<html>`). Mode terang telah dihapus secara sistemik.
*   **Glassmorphism**: Menggunakan *custom properties* (`--color-site-glass`, dll) yang dipadukan dengan `backdrop-filter: blur()`. Efek ini memberikan kesan kaca transparan yang menyatu dengan latar belakang.
*   **Fallback Background**: 
    *   Latar belakang statis menggunakan *grid pattern* (SVG *inline*) dengan karakter ASCII acak.
    *   Efek sapuan sinar (Sweeping Gradient) menggunakan pseudo-element (`::before`) dengan animasi `translate3d`. Ini dioptimalkan untuk GPU agar tidak membebani perangkat *low-end*.
*   **Tooltip Karya**: Muncul dari bawah menggunakan `position: absolute`. Memiliki trik `nth-child(3n+1)` dan `nth-child(3n+3)` agar posisinya tidak meluber keluar dari container saat berada di kolom kiri/kanan.

---

## 5. Fungsionalitas (JavaScript)
Semua interaksi diatur oleh satu tag `<script>` di bagian bawah. Tidak ada *framework* JS (React/Vue) yang digunakan, murni Vanilla JS.

*   **Language Switcher**: Mengubah atribut `data-lang` pada `<html>`. CSS akan otomatis menyembunyikan/menampilkan elemen berdasarkan atribut ini.
*   **Modals (Dialog)**: 
    *   Menggunakan `showModal()` untuk memunculkan popup.
    *   Klik pada area *backdrop* (luar konten) akan menutup dialog.
    *   Khusus dialog **Work**, tombol close dibuat eksplisit (`workDialog.close()`) dan bukan `form method="dialog"` untuk mencegah bentrok dengan *stacking context* (z-index) dan animasi.
*   **Work Tooltip**: Interaksi *hover* (desktop) dan *click* (mobile) menggunakan kelas `.is-active`.
*   **Web Share API**: Menggunakan `navigator.share()` bawaan OS. Jika tidak didukung (desktop lama), otomatis beralih ke fungsi *copy to clipboard*.
*   **Web3Forms**: Menggunakan `fetch()` API untuk mengirim data tanpa *reload*. Disediakan validasi matematika acak sebelum data dikirim untuk menghindari bot.
*   **Giscus**: Dimuat secara dinamis menggunakan `document.createElement('script')` agar tema dan bahasa dapat disinkronkan saat pengguna mengganti bahasa.

---

## 6. Panduan Perawatan Cepat (Cheatsheet)

**Menambah Proyek Baru ke Dialog Karya:**
Tambahkan objek baru di dalam *array* `work`:
```javascript
{ 
  name: "Nama Proyek", 
  logo: "/img/projects/logo.png", 
  linkprev: "https://link-ke-proyek.com", // Biarkan kosong "" jika tidak ada link
  shortDescEn: "English desc", 
  shortDescId: "Deskripsi Indonesia" 
}
```

**Mengganti Latar Belakang Animasi dengan Gambar/GIF dari CDN:**
Cukup isi properti `src` pada `profile.background` di frontmatter:
```javascript
background: { src: 'https://link-cdn-anda/gambar.jpg', opacity: 0.6 },
```
*(Latar animasi hitam-putih akan otomatis mati dan digantikan oleh gambar Anda).*

**Mengaktifkan Kembali Mode Terang (Light Mode):**
1. Hapus `class="dark"` pada tag `<html>`.
2. Hapus `data-theme="transparent_dark"` pada inisialisasi Giscus di JS.
3. Hapus warna latar khusus *fallback* jika perlu, atau sesuaikan *custom properties* CSS.

---
*Dokumen ini dibuat pada Oktober 2026. Segala perubahan struktur wajib memperbarui dokumen ini agar konteks tidak hilang.*
