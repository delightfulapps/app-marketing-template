import site from "./_data/site.js";

// Every page's SEO values are derived here so no template ever has to assemble
// a title or an absolute URL. Pages override by setting front matter:
//
//   title        page heading; also the <title> prefix
//   seoTitle     replaces the whole computed <title>
//   description  meta description and social card description
//   ogImage      site-relative path to a 1200x630 PNG
//   ogImageAlt   alt text for that image
//   ogType       "website" (default) or "article"
//   updated      ISO date; drives <lastmod> and og:updated_time
//   noindex      true to keep the page out of the sitemap and search results
//   schemaKind   what kind of thing this page is — see below
export default {
  eleventyComputed: {
    // What this page *is*, as one word. Three things read it: the structured
    // data picks its page-scoped nodes from it, the markdown mirror picks how
    // to render the page from it, and the head uses it to decide whether to
    // advertise a mirror at all.
    //
    // Set in front matter rather than sniffed from the URL, so renaming a file
    // cannot silently downgrade a page to a generic one.
    schemaKind: (data) => data.schemaKind || "page",

    // Where this page's markdown twin lives, or undefined when it has none —
    // the head must never advertise a mirror that was not written. Mirrors are
    // paginated over collections.sitemapPages, so the condition here has to
    // match that collection's filter in eleventy.config.js.
    // `permalink: false` items — every file in src/content/ — have `false`,
    // not undefined, for both of these, so the type check is doing real work.
    mirrorHref: (data) => {
      // Both of these are read up front, before any early return. Eleventy
      // works out what a computed value depends on by watching which keys it
      // reads, so a branch that bails before touching page.url leaves page.url
      // unordered against this — and it arrives as an empty string, producing a
      // relative href that points at nothing. It fails quietly; read first.
      const { url, outputPath } = data.page;
      if (!site.markdownMirrors) return undefined;
      if (data.noindex === true) return undefined;
      if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) {
        return undefined;
      }
      return `${url}index.${site.mirrorExtension}`;
    },

    seo: {
      title: (data) =>
        data.seoTitle ||
        (data.title
          ? `${data.title} — ${site.name}`
          : `${site.name} — ${site.tagline}`),
      description: (data) => data.description || site.description,
      canonical: (data) => new URL(data.page.url, site.url).href,
      image: (data) => new URL(data.ogImage || site.ogImage, site.url).href,
      imageAlt: (data) => data.ogImageAlt || site.ogImageAlt,
      type: (data) => data.ogType || "website",
      noindex: (data) => data.noindex === true,
    },
  },
};
