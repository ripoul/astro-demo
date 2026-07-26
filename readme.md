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

| Command         | Action                                                                                     |
| :--------------- | :------------------------------------------------------------------------------------------ |
| `pnpm install`  | Installs the project's dependencies.                                                       |
| `pnpm dev`      | Starts the local dev server (with hot reload) at `localhost:4321`.                          |
| `pnpm build`    | Builds the static production site into `./dist/` — this is the folder Netlify deploys.      |
| `pnpm preview`  | Serves the contents of `./dist/` locally, to check the production build before deploying.   |

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

## SEO

The site includes a few baseline SEO optimizations:

- **Sitemap**: [`@astrojs/sitemap`](astro.config.mjs) integration + the site's
  canonical URL declared (`site:`) → automatically generates `/sitemap-index.xml`
  at build time.
- **robots.txt**: [`public/robots.txt`](public/robots.txt) allows indexing and
  references the sitemap.
- **Per-page tags** (via [`BaseLayout.astro`](src/layouts/BaseLayout.astro)):
  dynamic `<title>`, meta description, canonical URL, Open Graph and Twitter Card
  (switches to `summary_large_image` as soon as an image is provided).
- **JSON-LD structured data**:
  - schema.org `SportsActivityLocation` on every page (address, phone,
    geolocation, opening hours)
  - schema.org `BlogPosting` on every article
- **Heading hierarchy**: [`SectionHeading`](src/components/SectionHeading.astro)
  accepts an `as="h1" | "h2"` prop to guarantee a single real `<h1>` per page.
- **Per-article share image**: optional `image` field on the `blog` collection
  ([`src/content.config.ts`](src/content.config.ts)) to illustrate social shares.
