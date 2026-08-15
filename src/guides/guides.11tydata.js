// How-to guides. Add a markdown file here with `title` and `description` front
// matter and it appears on /guides/, in /llms.txt and in the sitemap. Ships
// empty: with no file here the whole section — page, nav link, sitemap entry —
// does not exist. See src/_data/sections.js.
//
// Guides are reference material, not a timeline: they are sorted alphabetically
// by title and carry no publish date. Set `updated` when you revise one, and it
// drives <lastmod>, og:updated_time and dateModified.
//
// Only .md files directly in this directory switch the section on. A guide in a
// subdirectory still builds a page, but gets no index entry and no nav link —
// the same edge the blog has.
//
// Not to be confused with src/guides.11tydata.js, which is the data file for
// the /guides/ index page rather than for the guides themselves.
export default {
  tags: ["guides"],
  layout: "guide.webc",
  // Gets these pages TechArticle structured data and a verbatim markdown
  // mirror. See src/src.11tydata.js.
  schemaKind: "guide",
};
