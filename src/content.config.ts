import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 1. Koleksi Blog Profesional
const bloggingCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blogging' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    img: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
  }),
});

// 2. Koleksi Quil Notes (Personal)
const notesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(), // Opsional, jika kosong bisa kita slice dari isi konten
    img: z.string().optional(),         // Opsional, agar tidak wajib ada gambar di setiap catatan
    tags: z.array(z.string()).default([]), // Jika lupa menulis tag, otomatis jadi array kosong []
    date: z.coerce.date(),
    category: z.string().default('Uncategorized'), // Tambahan untuk fitur kategori seperti di mockup
  }),
});

export const collections = {
  'blogging': bloggingCollection,
  'notes': notesCollection,
};