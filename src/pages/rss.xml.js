import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// Ringkas Markdown menjadi teks polos untuk deskripsi fallback
function excerpt(body = '', max = 160) {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')    // blok kode
    .replace(/!\[.*?\]\(.*?\)/g, ' ')   // gambar
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // link jadi teksnya saja
    .replace(/[#*_>`~]/g, '')           // simbol markdown
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? plain.slice(0, max).trimEnd() + '…' : plain;
}

export async function GET(context) {
  const notes = await getCollection('notes');

  const items = notes
    .map((note) => ({
      title: note.data.title,
      pubDate: note.data.date,
      description: note.data.description || excerpt(note.body),
      link: `/quil-notes/${note.id}`,
      categories: [note.data.category, ...note.data.tags].filter(Boolean),
    }))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
    .slice(0, 30);

  return rss({
    title: 'Quil Notes — Axel Kenshi',
    description: 'Catatan tentang teknologi, pemikiran, dan eksperimen kode dari Axel.',
    site: context.site,
    items,
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
