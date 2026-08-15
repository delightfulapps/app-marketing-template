import { readdirSync } from "node:fs";

// Which optional sections have anything in them.
//
// Read from the filesystem rather than from collections: eleventy.config.js
// needs this before the build starts, to decide whether the blog and changelog
// pages exist at all. Anything derived from `collections` is only available
// once templates are already being processed, which is too late to skip them.
//
// An empty section disappears completely — no page, no nav link, no feed, no
// sitemap entry — rather than shipping a "nothing here yet" dead end.

function markdownCount(dir) {
  try {
    return readdirSync(dir).filter((file) => file.endsWith(".md")).length;
  } catch {
    // Directory removed entirely — that counts as empty, not as an error.
    return 0;
  }
}

export default {
  blog: markdownCount("src/blog") > 0,
  changelog: markdownCount("src/content/releases") > 0,
  guides: markdownCount("src/guides") > 0,
};
