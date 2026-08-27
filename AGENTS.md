# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

An Astro 7 static site: a showcase/demo site for a fictional equestrian center ("Les Écuries du Vallon"), used to explore Astro's features (content collections, SEO, Netlify Forms, image optimization, a Decap CMS admin). All UI copy and content is in French. Business details in `src/data/site.ts` (name, address, phone, hours...) and `SITE_URL` in `astro.config.mjs` are explicitly fictional placeholder data (marked with ⚠️ comments) — treat them as intentional, not bugs to fix, and change them together if this is ever pointed at a real business.

`CLAUDE.md` is a symlink to `AGENTS.md` in this repo (one file on disk, two names) — edit either path, and don't split them into separate documents.

## Commands

Package manager is pnpm (version pinned via `packageManager` in `package.json`); Node >=22.12.0. There is no test suite/command in this project.

| Command        | Action                                                    |
| :------------- | :-------------------------------------------------------- |
| `pnpm install` | Install dependencies                                      |
| `pnpm dev`     | Start the dev server at `localhost:4321`                  |
| `pnpm build`   | Build the static site to `./dist/` (what Netlify deploys) |
| `pnpm preview` | Serve `./dist/` locally to check the production build     |
| `pnpm lint`    | Run ESLint over the whole project                         |

When starting the dev server yourself, use background mode so it doesn't block:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Architecture

### Site data is centralized

`src/data/site.ts` exports one `SITE` object (name, contact, address, hours, social links, map coordinates), a derived `OPENING_HOURS_SCHEMA` (converts the French day/time strings into schema.org's `OpeningHoursSpecification` format), and `NAV_LINKS`. `BaseLayout.astro`, `Header.astro`, `Footer.astro`, and every JSON-LD block read from here — update this one file rather than hardcoding business details in a component.

### `BaseLayout.astro` is the SEO hub

Every page renders through `src/layouts/BaseLayout.astro`, which centralizes: title templating, meta description, canonical URL, Open Graph/Twitter tags (auto-cropping the page's image — or the site's hero photo as fallback — to 1200×630 at build time via `astro:assets`'s `getImage`), the RSS `<link>`, and a sitewide `SportsActivityLocation` JSON-LD block built from `SITE`. It also conditionally renders `<CookieConsent />` + `<Analytics />` together, gated on `import.meta.env.PUBLIC_GA_ID` being set (see `.env.example`).

### Consent-gated analytics

GA4 is off unless `PUBLIC_GA_ID` is set. When it is, `CookieConsent.astro` shows a banner and, on the visitor's choice, stores it in `localStorage` and fires a `cookie-consent-changed` custom event (typed as a `WindowEventMap` extension in `src/env.d.ts`). `Analytics.astro` checks `localStorage` on load and also listens for that event, only injecting the `gtag.js` script once consent is `granted`. Nothing is requested from Google before that.

### Blog and gallery are content collections

`src/content.config.ts` defines two collections, both a glob loader over markdown files under `src/content/`:

- **`blog`** (`src/content/blog/**/*.md`): `title`, `description`, `date`, a `category` enum (`resultats | stage | actualite`), a `cover` image, `coverAlt`, and `draft`. Category labels live in `src/data/blogCategories.ts` rather than in `CategoryBadge.astro`, because Astro components can only export the component itself, not plain values.
- **`gallery`** (`src/content/gallery/**/*.md`): just `image`, `alt`, `description`, `date` — no title, category, or draft; every entry is one photo with a caption.

Routes built on these collections:

- `src/pages/blog/index.astro` — listing
- `src/pages/blog/[slug].astro` — one article, via `getStaticPaths()` + `getCollection('blog', ...)`, filtering out drafts
- `src/pages/blog/categorie/[category].astro` — per-category archive pages, cross-linked from every `CategoryBadge`
- `src/pages/galerie.astro` — single masonry-layout page over every `gallery` entry (`GalleryCard`), sorted newest-first; a vanilla-JS `<dialog>` lightbox opens a larger `getImage` render (width 1400) with the caption on click

### Decap CMS powers the `/admin` editor

`src/pages/admin.html` + `public/admin/config.yml` wire up [Decap CMS](https://decapcms.org/) (loaded from a CDN `<script>`, no npm dependency or build step) as a browser editor for the `blog` and `gallery` collections. `config.yml`'s two `collections` blocks are a hand-maintained mirror of the schemas in `src/content.config.ts` — changing a field in one place means updating the other by hand. It runs in `publish_mode: editorial_workflow`: saving an entry opens a branch + PR against `main` instead of committing directly, so nothing reaches production before that PR is reviewed/merged (the repo's Netlify Deploy Preview on the PR doubles as the admin preview). The GitHub OAuth handshake is handled by a separate Cloudflare Worker proxy repo (`ripoul/astro-demo-decap-proxy`, not part of this codebase) — see `readme.md` for the full setup and redeploy steps. `/admin` is deliberately excluded from indexing and the sitemap in three places: the `noindex` meta tag in `admin.html`, `Disallow: /admin` in `robots.txt.ts`, and the `filter` option passed to the `sitemap()` integration in `astro.config.mjs`.

`public/admin/preview-templates.js` + `preview.css` register custom `CMS.registerPreviewTemplate` components for both collections so the editor's live preview looks like the real site instead of Decap's unstyled default. These are a **hand-maintained duplicate** of `src/styles/global.css`'s design tokens and the blog/gallery layouts, not derived from them — update both sides together when either changes. To test admin/preview changes locally without real GitHub credentials, swap `backend:` in a throwaway `config.yml` copy for Decap's built-in `{ name: test-repo }` (in-memory, one-click auth, content lost on reload) instead of fighting the real OAuth proxy.

### Sitemap `lastmod` is computed at config time

`astro.config.mjs` reads every file under `src/content/blog/` directly with `node:fs` (Astro's content-collection APIs aren't available at config-eval time) to pull each post's frontmatter `date`, then passes a custom `serialize()` to `@astrojs/sitemap` so blog URLs get an accurate `<lastmod>`. Static pages intentionally get no `lastmod` rather than a fabricated one.

### `robots.txt` and `rss.xml` are endpoints, not static files

`src/pages/robots.txt.ts` and `src/pages/rss.xml.ts` generate their output from `Astro.site` / the blog collection at build time, so they can never drift from the domain configured in `astro.config.mjs` or from the actual post list.

### Netlify Forms

`ContactForm.astro` is wired for Netlify's build-time form detection (`data-netlify="true"`, `name="contact"`, a hidden `form-name` input) but submits via a client-side `fetch` (`x-www-form-urlencoded`), showing a success/error toast instead of a redirect. If you add or rename a form field, keep the hidden `form-name` value in sync — Netlify matches submissions to forms by that field.

### Styling

Plain CSS with custom properties (see `src/styles/global.css` for the design tokens: `--color-primary`, `--color-surface`, etc.) plus component-scoped `<style>` blocks in each `.astro` file. No CSS framework is installed — the "Tailwind" doc link below is generic Astro guidance, not something this project uses.

## Tooling

- **Lint/format**: ESLint flat config (`eslint.config.js`: `@eslint/js` + `typescript-eslint` + `eslint-plugin-astro`, all `recommended`, with `eslint-config-prettier` last to defer style rules to Prettier). Prettier (`prettier.config.mjs`) uses `singleQuote: true` and `prettier-plugin-astro`.
- **Pre-commit**: Husky runs `pnpm exec lint-staged` (config in `package.json`) — ESLint with `--max-warnings=0` plus Prettier on staged `.ts`/`.astro` files, Prettier-only on JSON/CSS/Markdown/YAML.
- **CI**: `.github/workflows/lint.yml` and `build.yml` run `pnpm lint` / `pnpm build` on push and PR to `main`. There is no `test.yml` — this project has no test suite.
- **TypeScript stays below 7.x.** `tsconfig.json` extends `astro/tsconfigs/strict`. `dependabot.yml` intentionally ignores TypeScript major-version bumps because `typescript-eslint` and `@astrojs/check` don't support TS 7 yet — don't upgrade past the 6.x line until those do.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
