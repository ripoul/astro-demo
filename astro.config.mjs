// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ⚠️ Domaine fictif pour la démo (cohérent avec src/data/site.ts) : à remplacer
// par le vrai nom de domaine du haras avant la mise en ligne.
const SITE_URL = 'https://ecuries-du-vallon.fr';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
});
