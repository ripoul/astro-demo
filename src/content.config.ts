import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['resultats', 'stage', 'actualite']),
    cover: z.string(),
    // Chemin de la vraie photo d'en-tête (og:image / twitter:image), une fois disponible.
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
