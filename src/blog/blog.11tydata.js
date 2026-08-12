// Blog posts. Add a markdown file here with `title` and `date` front matter and
// it appears on /blog/, in the Atom feed, and in the sitemap.
export default {
  tags: ["posts"],
  layout: "post.webc",
  // Gets these pages BlogPosting structured data and a verbatim markdown
  // mirror. See src/src.11tydata.js.
  schemaKind: "post",
};
