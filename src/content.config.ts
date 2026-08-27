import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      category: z.enum(['resultats', 'stage', 'actualite']),
      // Sert aussi d'image de partage (og:image / twitter:image) sur l'article.
      cover: image(),
      coverAlt: z.string(),
      draft: z.boolean().default(false),
    }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      image: image(),
      alt: z.string(),
      description: z.string(),
      date: z.coerce.date(),
    }),
});

export const collections = { blog, gallery };
