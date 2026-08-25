# astro-demo — showcase site for a (fictional) equestrian center

[![Node.js](https://img.shields.io/badge/node-%3E%3D22.12.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9%2B-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Astro](https://img.shields.io/badge/astro-%5E7.1.2-BC52EE?logo=astro&logoColor=white)](https://astro.build)

An Astro demo project: a full showcase site for a fictional equestrian center,
**Les Écuries du Vallon**, used as realistic "lorem ipsum" content to explore
Astro's features (static pages, layouts, components, content collections for the
blog, SEO, a form wired up to Netlify...).

All business information (name, address, phone number, opening hours, prices,
domain name...) is fictional — see [`src/data/site.ts`](src/data/site.ts).

## Commands

All commands are run from the root of the project:

| Command        | Action                                                                                    |
| :------------- | :---------------------------------------------------------------------------------------- |
| `pnpm install` | Installs the project's dependencies.                                                      |
| `pnpm dev`     | Starts the local dev server (with hot reload) at `localhost:4321`.                        |
| `pnpm build`   | Builds the static production site into `./dist/` — this is the folder Netlify deploys.    |
| `pnpm preview` | Serves the contents of `./dist/` locally, to check the production build before deploying. |

## Hosting — Netlify

The site is meant to be deployed on [Netlify](https://www.netlify.com/), mainly to
take advantage of **Netlify Forms** without having to write or host a backend for
the contact form.

The form ([`src/components/ContactForm.astro`](src/components/ContactForm.astro))
is already set up to be detected by Netlify at build time:

- `data-netlify="true"` and `name="contact"` on the `<form>` tag
- a hidden `<input type="hidden" name="form-name" value="contact" />` field
  (required: without it, Netlify can't match the submission to the right form)
- a client-side AJAX (`fetch`) submit that shows a success/error toast instead
  of redirecting to a new page

### Netlify-side configuration

Once the site is connected to Netlify (build command `pnpm build`, publish
directory `dist`):

1. Submissions automatically show up under **Project configuration → Forms** on
   the Netlify dashboard.
2. 📖 Official docs: [docs.netlify.com/manage/forms/submissions](https://docs.netlify.com/manage/forms/submissions/)
3. ⚠️ **Remember to set up notifications.** By default, Netlify sends **no email
   or alert** when someone fills out the form — submissions just pile up silently
   in the dashboard. To get notified, go to **Project configuration →
   Notifications → Emails and webhooks → Form submission notifications** (or
   install the official Slack app) and add at least one email notification.

## Content management — Decap CMS

Blog posts can be written and edited from a browser at **`/admin`**
([`src/pages/admin.html`](src/pages/admin.html) +
[`public/admin/config.yml`](public/admin/config.yml)) instead of hand-editing
markdown files, via [Decap CMS](https://decapcms.org/). Runs in **editorial
workflow** mode (`publish_mode: editorial_workflow`): saving an entry opens a
branch + Pull Request against `main` on `ripoul/astro-demo` instead of
committing directly — nothing reaches production until that PR is merged
(from the CMS's own workflow board, or from GitHub directly). Since the repo
is already connected to Netlify, each PR should get its own **Deploy
Preview** — a full, real, unlisted build of the site with that draft included,
which is what stands in for an "admin-only preview" here (there's no
authentication on the built pages themselves — it's a static site — so
nothing reaches `main` until the PR is merged, which is the only real gate).
This also means CMS-authored changes go through the same `lint.yml`/`build.yml`
CI checks as any other PR before they can be merged.

Decap needs a backend to do the GitHub OAuth handshake (browser JS can't hold
an OAuth client secret). Netlify Identity + Git Gateway would be the
zero-setup option since the site is already on Netlify, but Netlify has
deprecated Git Gateway for new setups — so this uses a small **Cloudflare
Worker OAuth proxy** instead, kept as its own repo:
[`ripoul/astro-demo-decap-proxy`](https://github.com/ripoul/astro-demo-decap-proxy)
(forked from [decap-proxy](https://github.com/sterlingwes/decap-proxy), the
proxy Decap's own docs reference). Kept separate from this repo because that
template has no LICENSE (its `is_template` flag signals "use this template",
not "vendor this code") and because its TypeScript/Vitest/Wrangler toolchain
shouldn't mix with this repo's ESLint/Prettier setup. Runs entirely on
Cloudflare's free tier — doesn't touch Netlify's usage/credits at all.

Current values: Worker at `https://decap-proxy.ripoul.workers.dev`, no CI
auto-deploy on that repo (deemed not worth it for how rarely it changes) — any
change to it needs a manual redeploy:

```bash
npx wrangler deploy
```

(from inside the `astro-demo-decap-proxy` checkout — secrets set via
`wrangler secret put` apply immediately without this, but `wrangler.toml`
edits need it).

**Access control**: the GitHub OAuth login itself is open to anyone with a
GitHub account, but _saving_ requires that account to actually have
collaborator/push access on `ripoul/astro-demo` — GitHub's own repo
permissions are the real gate, not the login screen. Manage who can publish
under this repo's **Settings → Collaborators**.

### Setting this up again on another project

1. Create a **new** GitHub OAuth App per project (`github.com/settings/applications/new`) — one App = one callback URL = one site, don't reuse an existing one.
2. Use [`sterlingwes/decap-proxy`](https://github.com/sterlingwes/decap-proxy)'s "Use this template" button to create a dedicated repo for the proxy (never copy its source into the site's own repo).
3. `cp wrangler.toml.sample wrangler.toml`, set `name`, leave `GITHUB_REPO_PRIVATE = "0"` unless the site's repo is private.
4. `npx wrangler login`, then `npx wrangler secret put GITHUB_OAUTH_ID` / `GITHUB_OAUTH_SECRET` with the values from step 1.
5. `npx wrangler deploy`, confirm `Hello 👋` at the printed URL.
6. Point the new site's `public/admin/config.yml` `backend.base_url` at that URL and `backend.repo` at the right `owner/repo`.

## SEO

The site includes a fairly complete set of SEO optimizations:

- **Sitemap**: [`@astrojs/sitemap`](astro.config.mjs) integration + the site's
  canonical URL declared (`site:`) → automatically generates `/sitemap-index.xml`
  at build time, with `lastmod` on blog articles (read from their frontmatter
  `date`).
- **robots.txt**: generated at [`src/pages/robots.txt.ts`](src/pages/robots.txt.ts)
  from `Astro.site`, so it can never drift from the domain configured in
  `astro.config.mjs`.
- **Per-page tags** (via [`BaseLayout.astro`](src/layouts/BaseLayout.astro)):
  dynamic `<title>`, meta description, canonical URL, Open Graph and Twitter
  Card. Every page always has a share image: the page's own image if provided,
  otherwise the site's hero photo, cropped to the standard 1200×630 OG size at
  build time via `astro:assets`.
- **Real, optimized images**: photos live in [`src/assets/images/`](src/assets/images)
  and go through Astro's `<Image>` component — responsive `srcset`, modern
  formats, explicit dimensions (no layout shift), descriptive `alt` text, and
  `priority` loading on the largest above-the-fold image per page.
- **JSON-LD structured data**:
  - schema.org `SportsActivityLocation` on every page (address, phone,
    geolocation, opening hours, `sameAs` linking Facebook/Instagram)
  - schema.org `BlogPosting` on every article
  - schema.org `BreadcrumbList` on every page below the homepage, backed by a
    visible breadcrumb trail ([`Breadcrumbs.astro`](src/components/Breadcrumbs.astro))
- **Content architecture**: blog articles are grouped under
  `/blog/categorie/<categorie>/` archive pages, cross-linked from every
  category badge, for internal linking and topical grouping.
- **RSS feed**: [`/rss.xml`](src/pages/rss.xml.ts), linked from the document
  `<head>`.
- **Heading hierarchy**: [`SectionHeading`](src/components/SectionHeading.astro)
  accepts an `as="h1" | "h2"` prop to guarantee a single real `<h1>` per page.
- **Self-hosted fonts**: Fraunces and Source Sans 3 ship via
  [Fontsource](https://fontsource.org/) instead of the Google Fonts CDN, removing
  a third-party render-blocking request.

## SEO — next steps

Not done yet — worth revisiting once the business has real content:

- **Link a Google Business Profile** (formerly "Google My Business", created at
  [business.google.com](https://business.google.com)) once it exists:
  - Use the _exact_ same name/address/phone as [`src/data/site.ts`](src/data/site.ts)
    on the profile (NAP consistency between the site and the profile matters for
    local SEO).
  - Fill in the profile's "Website" field with the site's URL.
  - Add the profile's public URL (its Maps link or `g.page/...` short link) to
    the `sameAs` array in the `SportsActivityLocation` JSON-LD in
    [`BaseLayout.astro`](src/layouts/BaseLayout.astro), next to Facebook/Instagram.
  - Reviews live on the Google Business Profile itself (Maps / knowledge panel),
    not on the site — that's what actually shows star ratings in local search
    results.
  - ⚠️ **Don't add `AggregateRating`/`Review` schema to the site's own
    `SportsActivityLocation` expecting star rich results in web search.** Per
    [Google's review-snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet):
    _"If the entity that's being reviewed controls the reviews about itself,
    their pages that use `LocalBusiness` or any other type of `Organization`
    structured data are ineligible for the star review feature."_ Self-serving
    ratings on your own domain are excluded — only the Business Profile's own
    reviews count. The most a site can legitimately do is display real
    testimonials as visible text, linking back to the Google profile as the
    source.

## Analytics (optional)

Google Analytics 4 is wired up but **off by default**. Set `PUBLIC_GA_ID` (see
[`.env.example`](.env.example)) to a real GA4 measurement ID to enable it.

Because this is a French site, GA is gated behind a consent banner
([`CookieConsent.astro`](src/components/CookieConsent.astro)): the tracking
script ([`Analytics.astro`](src/components/Analytics.astro)) never loads until
the visitor accepts. Nothing is requested from Google before that click, and
the banner itself doesn't render at all when `PUBLIC_GA_ID` is unset.
