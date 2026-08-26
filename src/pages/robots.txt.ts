import type { APIRoute } from 'astro';

// Généré à partir de `site` (astro.config.mjs) pour ne jamais désynchroniser
// l'URL du sitemap si le nom de domaine change.
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);

  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${sitemapURL}\n`,
    {
      headers: { 'Content-Type': 'text/plain' },
    },
  );
};
