# app-marketing-template

An Eleventy template for app marketing sites — iOS, iPadOS, macOS and visionOS.

Ships a complete, SEO-finished skeleton: homepage, pricing, support, press kit,
changelog, blog and legal pages, with structured data, Open Graph cards, two
Atom feeds, a sitemap and a GitHub Pages deploy. Everything a new app site needs
before it needs anything specific.

Every string starts as a `TODO:` placeholder. `npm run check:todos` fails until
they are gone, so a placeholder cannot ship by accident.

## Quick start

```bash
npm install && npm run setup
```

`setup` asks for the app name, URL, store links, brand colour and the rest, and
rewrites `src/_data/site.js`. Then:

```bash
npm run serve
```

## What to edit

| To change | Edit |
| --- | --- |
| Name, URL, emails, store links, brand colour | `src/_data/site.js` |
| Feature cards | add markdown to `src/content/features/` |
| FAQ (also feeds the FAQPage structured data) | `src/content/faq/` |
| Pricing tiers | `src/content/pricing/` |
| Release notes | `src/content/releases/` |
| Blog posts | `src/blog/` |
| Legal and support copy | `src/privacy.md`, `src/terms.md`, `src/support.md` |
| Press kit prose | `src/press-kit.webc` |
| Which sections appear on the homepage | `src/index.webc` |
| Header navigation | `eleventyNavigation` front matter on each page |
| Styling | `src/styles/tailwind.css` |

Content files are one markdown file per item. Add a feature by adding a file;
reorder by changing `order` in its front matter; remove a section entirely by
deleting its files — each component hides itself when its collection is empty.

## Assets to replace

1. `src/assets/icon.png` — your 1024×1024 app icon. Then run
   `npm run icons && npm run og` to regenerate the favicon set and the social
   cards. Both need local tools (`brew install imagemagick librsvg`) and are
   deliberately not part of `npm run build`; commit their output.
2. `src/assets/screenshots/{ios,macos,visionos}/` — drop numbered PNGs in and
   they appear in the homepage gallery and the press kit with no code change.
   The filename becomes the alt text, so name them descriptively:
   `02_app_details.png` → "… on iOS — app details".

## Scripts

| Command | Does |
| --- | --- |
| `npm run serve` | Dev server with live reload |
| `npm run build` | Build to `_site/` |
| `npm run setup` | Interactive first-run configuration |
| `npm run check` | `check:todos` then `check:og` |
| `npm run check:todos` | Fails while `TODO:` placeholders remain |
| `npm run check:og` | Validates social-card metadata against the built output |
| `npm run icons` | Icon set from `icon.png` (needs ImageMagick) |
| `npm run og` | 1200×630 social cards (needs librsvg) |
| `npm run clean` | Remove `_site/` and the generated CSS |

## How it fits together

- **Eleventy 3**, ESM, with WebC for layouts and components. Non-HTML output
  (sitemap, robots, manifest, feeds, CNAME) stays Nunjucks.
- **Tailwind v4** runs inside the Eleventy build from an `eleventy.before` hook,
  writing `src/assets/css/site.css` (gitignored) which passthrough copy picks
  up. One process, no separate watcher.
- **Brand colour lives only in `site.js`.** `site-head.webc` emits it as CSS
  custom properties; `tailwind.css` maps its `@theme` tokens onto those
  variables; the manifest and `theme-color` metas read the same values. Light
  and dark are both handled — no colour is hardcoded in CSS.
- **SEO is computed once** in `src/src.11tydata.js`. Pages set optional front
  matter (`title`, `description`, `ogImage`, `ogType`, `updated`, `noindex`) and
  every title, canonical URL and card tag follows.
- **The custom domain comes from `site.url`** via `src/CNAME.njk`, so the deploy
  workflow has nothing to keep in sync. Delete that file if you deploy elsewhere.
- **The store badges are Apple's official artwork**, fetched from
  [Apple Marketing Tools](https://toolbox.marketingtools.apple.com) and committed
  as `src/assets/appstore-{ios,mac}-{black,white}.svg`. Black is served to light
  mode and white to dark via `<picture>`. Do not redraw or restyle them — Apple's
  [guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
  require the badge as supplied, at 40px height or more, with clear space around
  it. A badge only appears once its store URL is set in `site.js`.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`, running both checks first. Enable Pages for the repository with
source set to GitHub Actions, and point your domain's DNS at GitHub.

Expect the first run to fail at `check:todos` — that is the guard working, not a
broken workflow. It goes green once the placeholders are replaced. Drop that
step from the workflow if you would rather deploy a half-filled site.

## Three WebC gotchas worth knowing

These cost real time to diagnose, so they are worth stating plainly:

1. **`webc:setup` runs once per component for the whole build**, not once per
   page. A `const` there freezes the first page's data into every page — which
   silently gave every page the same `<title>` and nav state. Keep pure
   functions in `webc:setup` and read page data as `$data.x` at the point of use.
2. **A `permalink` ending in `/` drops a `.webc` page silently.** Permalinks are
   rendered by the page's own engine and WebC produces nothing for
   `/pricing/`, so the page is never written and no error appears. Rely on
   Eleventy's file-based routing instead — `src/pricing.webc` already builds to
   `/pricing/`.
3. **Custom elements cannot sit directly in `<head>`.** The HTML parser
   relocates them into the body. `base.webc` mounts the head component as
   `<meta webc:is="site-head">` for this reason.
