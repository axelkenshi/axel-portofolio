# Custom block Sveltia: panduan pemeliharaan

Dokumen ini merangkum pola custom block di `public/admin/editor-components.js`, cara mengujinya, dan jebakan yang pernah terjadi. Tujuannya agar tidak mengulang siklus error yang sama saat menambah atau mengubah komponen.

## 1. Berkas yang terlibat

| Berkas | Fungsi |
|---|---|
| `public/admin/editor-components.js` | Definisi semua komponen (pattern, toBlock, fromBlock, toPreview) |
| `public/admin/config.yml` | Daftar id komponen per koleksi (`editor_components: [...]`) |
| `public/styles/callouts.css` | Gaya tampilan HTML komponen, dipakai di preview dan halaman |
| `scripts/test-editor-components.mjs` | Harness uji Node, wajib dijalankan setelah setiap perubahan |

`callouts.css` hanya diubah bila benar-benar perlu. Callout adalah acuan pola dan tidak boleh diubah tanpa alasan kuat.

## 2. Kontrak Sveltia yang harus diingat

- **`fromBlock` menerima `RegExpMatchArray`** (hasil `pattern.exec`). Named group ada di `match.groups`. Kode kita menangani ini lewat adapter di bagian atas `editor-components.js`. Jangan menulis `fromBlock` yang membaca argumen seolah sudah berupa objek group tanpa adapter.
- **Komponen tanpa `fromBlock`** (contohnya callout) memakai named group sebagai nilai field langsung. Ini pola paling sederhana, tetapi hanya cocok jika nilai field bisa dibaca langsung dari markdown.
- **Field dengan `required` (default)** memblokir save bila kosong. Pesan "This field is required" berarti `fromBlock` tidak mengisi field itu.
- **Field URL** memakai `pattern: [regex, pesan]` (sudah diverifikasi di tipe Sveltia 0.248.0). Ini mencegah input salah tersimpan.

## 3. Pola satu komponen

Setiap komponen HTML mengikuti pola berikut:

1. **Penanda**: `markerPattern('nama-class')` mencari elemen dengan class tertentu. Class tambahan dari normalisasi HTML tidak merusak pencarian.
2. **`render(fields)`**: membuat HTML dari field. Dipakai untuk `toBlock` dan `toPreview`. Escape nilai dengan `esc()`.
3. **`fromBlock({ html })`**: membaca kembali dengan `attrOf(html, 'atribut')` dan `textOf(html, 'class')`. Hindari regex yang bergantung pada urutan atribut atau class persis.
4. **`toBlock`**: dibungkus `asBlock`, yang menambahkan `\n\n` di sekeliling blok.

Pola ini harus lolos uji round-trip: `toBlock(fromBlock(pattern.exec(toBlock(sampel)))) === toBlock(sampel)`.

Komponen markdown (code-file, code-diff) memakai fence backtick. Pagar pembukanya **harus** didahului baris kosong atau awal dokumen, yaitu `(?<=^|\n\n)`. Tanpa ini, pagar penutup blok lain bisa salah dikenali sebagai pembuka.

## 4. Aturan yang mencegah error berulang

- **`toBlock` jangan mengembalikan string kosong untuk data terisi.** Blok yang hilang diam-diam membuat debugging sulit. Jika input tidak valid, cegah lewat validasi field, bukan lewat `toBlock`.
- **Jangan membuat field terpisah yang harus cocok dengan data lain** (seperti `cols` yang harus sama dengan jumlah gambar). Turunkan nilainya dari data yang ada.
- **Setiap id di `config.yml` harus didefinisikan**, dan setiap definisi harus ada di `config.yml`. Ketidakcocokan membuat komponen tidak muncul atau error.
- **Jangan merujuk variabel yang tidak ada di dalam fungsi.** Contoh yang pernah terjadi: `html` di `renderTerminal`, yang menyebabkan ReferenceError.
- **Jangan mengandalkan urutan atribut atau class persis.** Rich text dapat menambah atau mengubah atribut.

## 5. Cara menguji

Jalankan dari root proyek:

```bash
node scripts/test-editor-components.mjs
```

Harness ini memanggil `fromBlock` dengan `RegExpMatchArray`, sama seperti Sveltia. Ia menguji:

- round-trip setiap sampel, termasuk field yang kosong,
- input tidak lengkap tidak boleh melempar error,
- dokumen gabungan: setiap pattern hanya cocok dengan blok miliknya,
- normalisasi HTML (class tambahan dan spasi),
- validasi URL,
- kecocokan `config.yml` dengan definisi.

Semua baris harus `OK`. Baris `INFO` tidak menggagalkan uji.

Untuk memastikan harness masih bisa menangkap bug, lakukan uji mutasi sesekali: hapus adapter sementara, jalankan harness, dan pastikan muncul `GAGAL`.

## 6. Checklist menambah komponen baru

1. Tambah definisi di `editor-components.js` memakai `defineBlock` (untuk HTML) atau `CMS.registerEditorComponent` (untuk fence markdown).
2. Tambah sampel di harness: satu varian penuh dan satu varian field opsional kosong.
3. Tambah id di `config.yml` pada kedua koleksi yang memakainya.
4. Jalankan harness sampai semua `OK`.
5. Uji di GUI: isi field, simpan, muat ulang halaman, buka lagi. Nilai harus tetap ada.
6. Cek console browser. Baris `fromBlock menerima` hanya diagnosa dan boleh dihapus setelah stabil.
7. Tambah gaya di `callouts.css` hanya jika komponen memerlukannya.

## 7. Catatan terbuka

- Log diagnosa `fromBlock menerima` di adapter perlu dihapus setelah masalah dianggap selesai.
- Grid gambar: 2 atau 4 gambar memakai kisi 2 kolom. 3 gambar memakai `data-cols="3"` dengan gambar ketiga direntangkan penuh.
- Bentuk argumen `fromBlock` di Sveltia 0.248.0 belum dikonfirmasi dari tipe resminya. Adapter menangani kedua bentuk. Konfirmasi lewat log diagnosa di browser.
- Komponen math (LaTeX) dan mermaid belum dibuat. Lihat catatan pengembangan terpisah.

## Langkah Pemeliharaan Blok khusus KaTeX dan Mermaid Diagram

Disalin manual dari paket npm. Jangan edit manual.

```bash
# 1. Pasang paket di folder sementara (tanpa menyentuh package.json proyek)
PROJECT=$(pwd)
TMP=$(mktemp -d)
cd "$TMP" && bun init -y >/dev/null && bun add katex@0.19.0 mermaid@12.2.0
cd "$PROJECT"

# 2. Pastikan berkas sumber ada
ls "$TMP/node_modules/katex/dist/katex.min.js" "$TMP/node_modules/katex/dist/katex.min.css"
ls "$TMP/node_modules/mermaid/dist/mermaid.esm.min.mjs" "$TMP/node_modules/mermaid/dist/chunks/mermaid.esm.min"

# 3. Salin ke public/vendor
mkdir -p public/vendor/katex public/vendor/mermaid/chunks
cp "$TMP/node_modules/katex/dist/katex.min.js" "$TMP/node_modules/katex/dist/katex.min.css" public/vendor/katex/
cp -r "$TMP/node_modules/katex/dist/fonts" public/vendor/katex/
cp "$TMP/node_modules/mermaid/dist/mermaid.esm.min.mjs" public/vendor/mermaid/
cp -r "$TMP/node_modules/mermaid/dist/chunks/mermaid.esm.min" public/vendor/mermaid/chunks/

# 4. Catat versi dan hapus folder sementara
printf '# Versi aset vendor\n\n- katex 0.19.0\n- mermaid 12.2.0\n\nDisalin manual dari paket npm. Jangan edit manual.\n' > public/vendor/VERSIONS.md
rm -rf "$TMP"

# 5. Verifikasi
ls public/vendor/katex public/vendor/mermaid
node scripts/test-editor-components.mjs
```
