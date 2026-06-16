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
    description: z.string(),
    img: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
  }),
});

// 3. Koleksi Projects Documentation
const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    shortDesc: z.string(),
    img: z.string(),
    date: z.coerce.date(),
    stack: z.array(z.string()),
    github: z.string().url().optional(),
    preview: z.string().url().optional(),
  }),
});

export const collections = {
  'blogging': bloggingCollection,
  'notes': notesCollection,
  'projects': projectsCollection,
};