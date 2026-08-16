# app-marketing-template

An Eleventy template for app marketing sites — iOS, iPadOS, macOS and visionOS.

Ships a complete, SEO-finished skeleton: homepage, pricing, support, press kit,
changelog, blog, guides and legal pages, with structured data, Open Graph cards,
two Atom feeds, a sitemap and a GitHub Pages deploy. Everything a new app site
needs before it needs anything specific.

It is finished for machine readers too — JSON-LD on every page, an `/llms.txt`
index, a `/for-llms/` facts page, a markdown twin of every page, and a one-knob
AI-crawler policy. See [Discoverability for language models](#discoverability-for-language-models).

Every string starts as a placeholder. `npm run check:todos` fails until they are
gone, so a placeholder cannot ship by accident.

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
| Name, URL, emails, store links, Product Hunt badge, brand colour | `src/_data/site.js` |
| Feature cards | add markdown to `src/content/features/` |
| FAQ (also feeds the FAQPage structured data) | `src/content/faq/` |
| Pricing tiers | `src/content/pricing/` |
| Release notes | `src/content/releases/` |
| Blog posts | `src/blog/` |
| How-to guides | add markdown to `src/guides/` |
| Legal and support copy | `src/privacy.md`, `src/terms.md`, `src/support.md` |
| Press kit prose | `src/press-kit.webc` |
| Who the app is for, when to recommend it, when not to | `src/content/audience/` |
| Which AI crawlers are allowed in | `aiCrawlers` in `src/_data/site.js` |
| Which sections appear on the homepage | `src/index.webc` |
| Header navigation | `eleventyNavigation` front matter on each page |
| Styling | `src/styles/tailwind.css` |

Content files are one markdown file per item. Add a feature by adding a file;
reorder by changing `order` in its front matter; remove a section entirely by
deleting its files — each homepage section hides itself when its collection is
empty.

Pricing tiers ship as Free, Pro Monthly and Pro Annual. A tier may set an
optional `note` in its front matter, rendered in the brand colour under the
price — that is where an annual plan states its saving. The call to action on
`/pricing/` is the App Store badge itself, shared by every tier, so it comes from
`appStoreUrl` and `macAppStoreUrl` in `src/_data/site.js` and needs no per-tier
link.

### Optional sections

Three sections — the blog, the changelog and the guides — disappear completely
when they have no content, so none of them ships as an empty shell. Delete
everything in `src/blog/` and there is no `/blog/` page, no nav link, no
`/blog.xml`, no sitemap entry and no feed link in `<head>`; the same goes for
`src/content/releases/` and the changelog, and for `src/guides/` and the guides.
Add a markdown file back and the whole section returns.
[src/_data/sections.js](src/_data/sections.js) decides this by counting files on
disk.

One caveat: that decision happens when the config loads, so **restart
`npm run serve` after adding the first post, release or guide** — a live rebuild
alone will not bring the section back.

#### Guides

The blog and the changelog ship with one placeholder file each. Guides ship with
none, so `/guides/` does not exist until you write the first one — there is
nothing to delete if you don't want them.

A guide is a markdown file in `src/guides/`. Front matter:

| Key | |
| --- | --- |
| `title` | required — the heading, the `<title>`, and what the index sorts on |
| `description` | strongly recommended — the one-line summary on `/guides/`, the meta description, and what `/llms.txt` shows a model |
| `updated` | optional ISO date — renders as "Last updated", and drives `<lastmod>`, `og:updated_time` and `dateModified` |

Guides are reference material rather than a timeline, so they are listed
alphabetically by title, not newest-first, and they carry no publish date and no
Atom feed. Everything else follows automatically: each guide gets a page at
`/guides/<filename>/`, `TechArticle` structured data, a markdown twin, a sitemap
entry, and a line in `/llms.txt` and `/llms-full.txt`.

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
| `npm run check` | `check:todos`, then `check:og`, then `check:ai` |
| `npm run check:todos` | Fails while placeholders remain |
| `npm run check:og` | Validates social-card metadata against the built output |
| `npm run check:ai` | Validates JSON-LD, `llms.txt`, the mirrors and `robots.txt` |
| `npm run icons` | Icon set from `icon.png` (needs ImageMagick) |
| `npm run og` | 1200×630 social cards (needs librsvg) |
| `npm run clean` | Remove `_site/` and the generated CSS |

## Discoverability for language models

A growing share of the people who will hear about your app never see your site —
they get an answer from an assistant that read it. That answer is assembled from
whatever the crawler found, and no major AI crawler except Google's runs
JavaScript, so what it found is the raw HTML. This template is static Eleventy
output, which clears that bar to begin with; the rest is about giving those
readers something accurate and structured to work with.

Four surfaces, all generated from `src/_data/site.js` and the content
collections, so none of them is maintained by hand and none can drift from the
site:

| Surface | What it is |
| --- | --- |
| JSON-LD on every page | One `@graph` per page: `Organization`, `WebSite`, `SoftwareApplication`/`Product`, the page itself and its breadcrumbs, plus `FAQPage`, `BlogPosting`, `TechArticle` for a guide, or an `ItemList` of releases or guides where those apply |
| `/llms.txt` | The [llmstxt.org](https://llmstxt.org) index — title, one-line summary, and curated links to every page worth reading |
| `/llms-full.txt` | The full text of the whole site in one markdown file, for a model that would rather read once than crawl |
| `/for-llms/` and `index.md` mirrors | A facts page for assistants, and a plain-markdown twin of every page at the same address with `index.md` appended |

Four knobs are worth a decision rather than a default:

**`oneLiner`** is the one plainly factual sentence a model should quote. It is
deliberately separate from `tagline`, which is allowed to be clever. Keep its
wording identical to how you describe the app elsewhere — consistent phrasing is
what lets a model connect this site to mentions of it somewhere else.

**`src/content/audience/`** holds who the app is for, when to recommend it, and
when it is not the answer. The last of those is the highest-value writing on the
whole site for this purpose: it is the only place that tells an assistant when
*not* to suggest your app, and one with nothing to go on will suggest it for
everything.

**`mastodon`** is one URL that turns into four things: a `sameAs` entry in the
`Organization` node, a `rel="me"` link, a `<meta name="fediverse:creator">` tag, and
the icon link in the footer. Leave it empty and none of them are emitted. The handle
is derived from the URL, so `https://mastodon.social/@you`, `/web/@you` and
`/users/you` all work.

The `rel="me"` half of profile verification is automatic; the other half is not:

1. Set `mastodon` in `src/_data/site.js` and deploy.
2. In Mastodon, go to Edit profile → Profile metadata and add a row pointing at your
   site.
3. Mastodon fetches that URL, finds the `rel="me"` pointing back at your profile, and
   shows the link verified.

`fediverse:creator` is what puts your account in the byline when someone links one of
your pages from Mastodon 4.3 or later. Neither tag is Mastodon-only in practice —
other fediverse servers read the same two conventions.

**`aiCrawlers`** decides who gets in, and the two kinds of bot are not the same
decision. Training crawlers harvest pages into a dataset; blocking them keeps
you out of a future model's weights and has no effect on whether you can be
cited today. Retrieval bots fetch a page *now*, because someone just asked a
question it might answer — blocking those is what makes a site invisible in AI
answers.

| Value | Effect |
| --- | --- |
| `"all"` | Both kinds. The default: a marketing site exists to be found |
| `"search-only"` | Citable, not trainable — retrieval in, dataset harvesters out |
| `"none"` | Neither. You will not appear in AI answers |

Classic search — Googlebot, Bingbot, Applebot, DuckDuckBot — is never affected
by this setting. Note that `Google-Extended` and `Applebot-Extended` are opt-out
tokens rather than crawlers: disallowing them removes you from Gemini and Apple
Intelligence without touching Google Search or Spotlight, which is why they sit
in the training bucket. Plain `Applebot` is the Siri and Spotlight crawler and
stays allowed under every setting. The full lists are in
[src/robots.txt.njk](src/robots.txt.njk).

### One thing to check after your first deploy

GitHub Pages decides the `Content-Type` of the `.md` mirrors, and there is no
way to set a header from this repo. Once the site is live:

```bash
curl -sI https://your-domain/index.md | grep -i content-type
```

`text/markdown` or `text/plain` — nothing to do. `application/octet-stream` makes
a browser download the file instead of showing it: set `mirrorExtension` to
`"txt"` in `site.js`. The permalink, the `<link>` tag in `<head>` and `check:ai`
all read that one value, so that is the entire change. Most model fetchers read
the body whatever the header says, so this is polish rather than correctness.

Set `markdownMirrors: false` to drop the mirrors altogether; `/llms-full.txt`
still carries every page's content.

## How it fits together

- **Eleventy 3**, ESM, with WebC for layouts and components. Non-HTML output
  (sitemap, robots, manifest, feeds, CNAME) stays Nunjucks.
- **Tailwind v4** runs inside the Eleventy build from an `eleventy.before` hook,
  writing `src/assets/css/site.css` (gitignored) which passthrough copy picks
  up. One process, no separate watcher.
- **Brand colour lives only in `site.js`.** `site-head.webc` emits it as CSS
  custom properties; `tailwind.css` maps its `@theme` tokens onto those
  variables; the manifest and `theme-color` metas read the same values. Light
  and dark are both handled — no colour is hardcoded in CSS. A very dark or
  very light brand colour needs `themeColorDark` set too, otherwise it vanishes
  into one of the two page backgrounds; mid-range colours can leave it empty.
  The text drawn *on* the brand colour is derived from its luminance, so there
  is no second knob to forget.
- **SEO is computed once** in `src/src.11tydata.js`. Pages set optional front
  matter (`title`, `description`, `ogImage`, `ogType`, `updated`, `noindex`,
  `schemaKind`) and every title, canonical URL, card tag, structured-data shape
  and markdown mirror follows. `schemaKind` is set explicitly rather than
  sniffed from the URL, so renaming a file cannot quietly downgrade a page.
- **The structured data cannot contain a placeholder**, by construction rather
  than by checking afterwards: every user-supplied string in
  `json-ld.webc` passes through a filter that drops unreplaced values, and
  undefined keys are omitted. The cost is that `check:ai` reports those fields
  as missing until `site.js` is filled in, which is the intended signal.
- **The custom domain comes from `site.url`** via `src/CNAME.njk`, so the deploy
  workflow has nothing to keep in sync. Delete that file if you deploy elsewhere.
- **The store badges are Apple's official artwork**, fetched from
  [Apple Marketing Tools](https://toolbox.marketingtools.apple.com) and committed
  as `src/assets/appstore-{ios,mac}-{black,white}.svg`. Black is served to light
  mode and white to dark via `<picture>`. Do not redraw or restyle them — Apple's
  [guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
  require the badge as supplied, at 40px height or more, with clear space around
  it. A badge only appears once its store URL is set in `site.js`. A universal
  purchase has one product page for every platform: set `appStoreUrl` and
  `macAppStoreUrl` to the same URL and only the App Store badge renders, which
  is the correct one for a single listing.
- **The Product Hunt badge is the one thing a visitor's browser fetches from
  somewhere else.** Set `productHuntPostId` and `productHuntUrl` in `site.js` and
  the badge appears in the hero under the store badges, a small Product Hunt glyph
  joins the footer icons, and the post lands in the `SoftwareApplication` node's
  `sameAs` — the app's node, not the Organization's, because a Product Hunt page
  identifies the product rather than the company publishing it. The badge image is
  hotlinked to `api.producthunt.com` on purpose: it is drawn per request,
  so the upvote count and any "#1 Product of the Day" ribbon stay current instead
  of freezing on the day you committed a copy. The light and dark artwork is
  chosen through the same `<picture>` mechanism the store badges use. Leave both
  knobs empty — the default — and nothing renders and the site talks to no origin
  but its own. If you want the badge but not the third-party request, download
  both themes from Product Hunt into `src/assets/` and point `imageLight` and
  `imageDark` in `src/_data/site.js` at them; the count stops updating, which is
  the trade.

## CI and deploying

Two workflows, both running the same three checks:

| Workflow | Runs on | Does |
| --- | --- | --- |
| `.github/workflows/check.yml` | pull requests to `main` | Builds, then `check:todos`, `check:og`, `check:ai` as separate steps so a failure names itself |
| `.github/workflows/deploy.yml` | pushes to `main` | The same checks, then publishes `_site` to GitHub Pages |

Enable Pages for the repository with source set to GitHub Actions, and point
your domain's DNS at GitHub.

Both are skipped on a repository that is itself marked as a GitHub template,
where every placeholder is still in place and `check:todos` is *supposed* to
fail. That is keyed on GitHub's own `is_template` flag rather than a hardcoded
repository name, so a site made from this template gets full CI with no edit to
either file. A pull request on a template repository still gets a `smoke` job —
the build and `check:og`, the two things that pass while the placeholders are in
place — so a dependency bump is never merged on no signal at all.

`.github/dependabot.yml` opens grouped pull requests weekly for the npm
toolchain (Eleventy and Tailwind as separate groups, so a breakage is cheap to
bisect) and for the workflow actions. Minor and patch updates are grouped;
majors arrive on their own, which is the pull request worth reading rather than
merging on a green tick. Neither the Node version in `.tool-versions` nor the
App Store badge SVGs are covered — those are checked by hand.

On your own site, expect the first run to fail at `check:todos` — that is the
guard working, not a broken workflow. It goes green once the placeholders are
replaced. Drop that step from both workflows if you would rather ship a
half-filled site.

`check:ai` fails on a fresh clone for the same reason and needs no separate
explanation: the structured data drops placeholder values rather than emitting
them, so an unfilled `site.js` shows up there as missing required fields.

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
