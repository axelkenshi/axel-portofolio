import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  // 1. Ambil data dari content collection catatanmu
  // Ubah 'notes' sesuai dengan nama koleksi di src/content/config.ts milikmu
  const notes = await getCollection('notes'); 

  return rss({
    // Judul blog RSS kamu
    title: 'Quil Notes — Axel Kenshi',
    // Deskripsi singkat RSS
    description: 'Catatan teknologi, pemikiran, dan eksperimen coding dari Axel.',
    // Mengambil base URL dari properti `site` di astro.config.mjs secara otomatis
    site: context.site,
    // Looping semua artikel untuk dimasukkan ke daftar XML
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.pubDate || new Date(), // Pastikan ada frontmatter pubDate di markdown-mu
      description: note.data.description || 'Baca selengkapnya di Quil Notes.',
      // Sesuaikan pola link dengan rute halaman detail catatanmu
      link: `/quil-notes/${note.id}/`, 
    })),
    // (Opsional) Kostumisasi stylesheet agar tampilan XML rapi di browser biasa
    customData: `
          <language>id-id</language>
          <image>
            <url>https://axelkenshi.my.id/favicon.svg</url>
            <title>Quil Notes — Axel Kenshi</title>
            <link>https://axelkenshi.my.id</link>
          </image>
        `,
  });
}
