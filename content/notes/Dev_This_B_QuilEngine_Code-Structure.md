---
title: 'B. Quil Notes: Panduan pemeliharaan struktur kode quil-notes'
description: Dokumentasi ini menjelaskan langkah-langkah pemeliharaan dan peta hubungan antar komponen dari pages/quil-notes/
img: ''
tags: []
date: 2025-01-02
category: DeveloperDocs
---

## Perubahan class tailwind khusus seluruh /quil-notes

Baru-baru ini, 16-10-2026. Saya memutuskan untuk mengembangkan fitur toggle mode gelap/terang pada seluruh bagian milik `quil-notes/` karena sebelumnya UI notes secara keseluruhan dikunci pada tema gelap saja.
Saya berpikir untuk membuat metode baru yang memisahkan `@custom-variant quil-dark` sehingga memungkinkan kostumisasi tema latar secara independen tanpa mengganggu fungsionalitas tema milik /dev (portofolio web).

Kesimpulannya, saya melakukan refactor penuh pada seluruh isi `quil-notes/ & layouts/QuilLayout.astro` yang ditujukan pada kelas tailwind seperti pada tabel dibawah.

Sebagai acuan jika anda ingin mengembangkan lagi `quil-notes/` maka sesuaikan analogi kelas tailwind lama menjadi yang baru berikut agar mendukung mekanisme toggle tema secara dinamis.

| Kelas lama | Kelas baru |
| --- | --- |
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

Setelah itu, lakukan pengecekan apakah ada kelas tailwind "zinc" yang tersisa pada QuilLayout.astro dan quil-notes/ menggunakan perintah terminal berikut:



<pre class="terminal"><span class="term-cmd"><span class="term-prompt">$</span> rg -n &quot;zinc-&quot; src/layouts src/pages/quil-notes</span>
<span class="term-out">It is expected that no zinc classification residue remains (i.e., it should be clean).</span></pre>



kemudian lanjutkan dengan pengecekan berikut



<pre class="terminal"><span class="term-cmd"><span class="term-prompt">$</span> git diff --stat</span>
<span class="term-out">no files in src/pages/dev or index.astro should be changed (Focus on /quil-notes)</span></pre>





<pre class="terminal"><span class="term-cmd"><span class="term-prompt">$</span> rg -n &quot;dark:&quot; src/pages/quil-notes src/layouts</span>
<span class="term-out">It must be empty, or contain only classes that are intentionally left unchanged. This is because /quil-notes and QuilLayout use the .quil-dark class—with the exception of /dev and the main index page.</span></pre>
