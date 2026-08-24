// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ⚠️ Domaine fictif pour la démo (cohérent avec src/data/site.ts) : à remplacer
// par le vrai nom de domaine du haras avant la mise en ligne.
const SITE_URL = 'https://ecuries-du-vallon.fr';

// Renseigne <lastmod> dans le sitemap pour les articles de blog, à partir de la
// date déjà présente dans leur frontmatter. Les pages statiques n'ont pas de
// date de modification fiable : mieux vaut omettre lastmod que d'en inventer une.
const blogDir = fileURLToPath(new URL('./src/content/blog/', import.meta.url));
const blogLastmodBySlug = new Map(
  readdirSync(blogDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const frontmatter = readFileSync(path.join(blogDir, file), 'utf-8');
      const match = frontmatter.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?/m);
      return [file.replace(/\.md$/, ''), match?.[1]];
    }),
);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [
    sitemap({
      serialize(item) {
        const slug = item.url.replace(/\/$/, '').split('/').pop();
        const lastmod = slug ? blogLastmodBySlug.get(slug) : undefined;
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
