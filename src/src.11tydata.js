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
export default {
  eleventyComputed: {
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
