import path from "path";
import fs from "fs";

// 1. Tangkap argumen dari terminal
const type = process.argv[2]; // 'notes' atau 'blog'
const rawTitle = process.argv[3];

if (!rawTitle) {
  console.error("❌ Judul wajib diisi! Contoh: bun new-notes \"Judul Catatan\"");
  process.exit(1);
}

// 🎯 2. FORMAT BARU: Mengubah Judul menjadi Pascal_Snake_Case (.md)
// Contoh: "misteri destructuring javascript" -> "Misteri_Destructuring_Javascript.md"
const fileName = rawTitle
  .split(/[^a-zA-Z0-9]+/) // Pecah kalimat berdasarkan karakter non-alfanumerik (spasi, strip, dll)
  .filter(Boolean)        // Buang elemen kosong jika ada spasi ganda
  .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi huruf pertama tiap kata
  .join("_") + ".md";     // Gabungkan dengan karakter underscore dan tambah ekstensi .md

// 3. Target folder langsung ke root /content
const folderTarget = type === "notes" ? "notes" : "blogging";
const targetDir = path.join(process.cwd(), "content", folderTarget);
const targetPath = path.join(targetDir, fileName);

// 4. Ambil tanggal hari ini (Format: YYYY-MM-DD)
const currentDate = new Date().toISOString().split("T")[0];

// 5. Racik template frontmatter
let template = "";
if (type === "notes") {
  template = `---
title: "${rawTitle}"
description: ""
img: ""
tags: []
date: ${currentDate}
category: ""
---

Tulis catatanmu di sini...
`;
} else {
  template = `---
title: "${rawTitle}"
description: ""
date: "${currentDate}"
img: ""
tags: [""]
---

Tulis artikel blogmu di sini...
`;
}

// 6. Eksekusi penulisan file
try {
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Folder target tidak ditemukan di: ${targetDir}`);
    process.exit(1);
  }

  await Bun.write(targetPath, template);
  console.log(`\n⚡ [Quil Engine] Sukses menulis file baru!`);
  console.log(`📝 Judul  : ${rawTitle}`);
  console.log(`📁 Lokasi : content/${folderTarget}/${fileName}\n`);
} catch (error) {
  console.error("❌ Gagal membuat file:", error);
}
