import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import navigationPlugin from "@11ty/eleventy-navigation";
import { findNavigationEntries } from "@11ty/eleventy-navigation/eleventy-navigation.js";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlightPlugin from "@11ty/eleventy-plugin-syntaxhighlight";
import webcPlugin from "@11ty/eleventy-plugin-webc";

import sections from "./src/_data/sections.js";
import site from "./src/_data/site.js";

// The input lives outside src/assets/ so passthrough copy does not ship the
// unprocessed source alongside the built stylesheet.
const TAILWIND_IN = "src/styles/tailwind.css";
const TAILWIND_OUT = "src/assets/css/site.css";

export default function (eleventyConfig) {
  // --- Plugins ---------------------------------------------------------

  eleventyConfig.addPlugin(webcPlugin, {
    components: [
      "src/_includes/components/**/*.webc",
      "npm:@11ty/eleventy-img/*.webc",
    ],
  });

  // Registered for its breadcrumb filters; the header reads the `nav`
  // collection below instead, which WebC can consume without an escape hatch.
  eleventyConfig.addPlugin(navigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlightPlugin);

  // Upgrades plain <img> tags in the output HTML to responsive srcset with
  // AVIF/WebP and intrinsic width/height, so templates never hand-maintain
  // image dimensions. Screenshots are the main beneficiary.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "auto"],
    widths: ["auto"],
    defaultAttributes: { loading: "lazy", decoding: "async" },
  });

  if (sections.blog) {
    eleventyConfig.addPlugin(feedPlugin, {
      type: "atom",
      outputPath: "/blog.xml",
      collection: { name: "posts", limit: 20 },
      metadata: {
        language: "en",
        title: `${site.name} blog`,
        subtitle: site.description,
        base: site.url,
        author: { name: site.publisher },
      },
    });
  }

  // The changelog feed is hand-written in src/changelog.xml.njk instead: its
  // entries are anchors on /changelog/, not pages, so feedPlugin has no URL to
  // link them to.
  //
  // Guides have no feed at all, deliberately. A feed announces new things; a
  // guide is revised in place far more often than it is published, so every
  // edit would either spam subscribers or go unannounced.

  // --- Optional sections -----------------------------------------------

  // Delete every post, every release, or every guide, and that section stops
  // existing: ignoring the templates takes the page out of the build, which
  // takes it out of collections, which takes it out of the nav and the sitemap
  // in turn. Restore it by adding a markdown file back.
  //
  // Guides are the one section that ships with no content, so out of the box
  // /guides/ is not built at all.
  if (!sections.blog) {
    eleventyConfig.ignores.add("src/blog.webc");
  }
  if (!sections.changelog) {
    eleventyConfig.ignores.add("src/changelog.webc");
    eleventyConfig.ignores.add("src/changelog.xml.njk");
  }
  if (!sections.guides) {
    eleventyConfig.ignores.add("src/guides.webc");
  }

  // --- Assets ----------------------------------------------------------

  eleventyConfig.addPassthroughCopy("src/assets");
  // Browsers and older crawlers request /favicon.ico at the root, not /assets/.
  eleventyConfig.addPassthroughCopy({
    "src/assets/icons/favicon.ico": "favicon.ico",
  });
  eleventyConfig.addWatchTarget(TAILWIND_IN);
  // WebC components are registered through the plugin's own glob rather than as
  // Eleventy layouts, so the dev server does not watch them by default — edits
  // would appear to do nothing until a restart.
  eleventyConfig.addWatchTarget("src/_includes/components/");

  // Tailwind runs inside the Eleventy build rather than as a second process,
  // writing into src/assets/css/ so the existing passthrough copy picks it up.
  // Keeps `npm run serve` a single command and keeps rebuilds in step.
  eleventyConfig.on("eleventy.before", () => {
    execFileSync(
      "node_modules/.bin/tailwindcss",
      ["-i", TAILWIND_IN, "-o", TAILWIND_OUT, "--minify"],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
  });

  // The press kit offers a single archive of the icon and every screenshot.
  // Built here so it can never drift from what the site actually ships.
  eleventyConfig.on("eleventy.before", () => {
    if (!existsSync("src/assets/icon.png")) return;
    // zip adds to an existing archive, so a deleted screenshot would live on
    // in the press kit forever. Start clean every build.
    rmSync("src/assets/press-kit.zip", { force: true });
    execFileSync(
      "zip",
      [
        "-rq",
        "press-kit.zip",
        "icon.png",
        "screenshots/",
        "-x",
        "*.DS_Store",
        "*/.gitkeep",
      ],
      { cwd: "src/assets" },
    );
  });

  // --- Filters ---------------------------------------------------------

  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.valueOf()) ? "" : d.toISOString();
  });

  eleventyConfig.addFilter("ymd", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.valueOf()) ? "" : d.toISOString().slice(0, 10);
  });

  // Named `siteUrl`, not `absoluteUrl`: eleventy-plugin-rss registers its own
  // `absoluteUrl` filter that needs an explicit base and silently returns the
  // input unchanged without one. Sharing the name produced relative URLs in the
  // sitemap and robots.txt, which is exactly the bug this filter exists to stop.
  eleventyConfig.addFilter("siteUrl", (path) => new URL(path ?? "/", site.url).href);

  // --- Collections -----------------------------------------------------

  const byOrder = (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0);

  for (const name of ["features", "faq", "pricing", "audience"]) {
    eleventyConfig.addCollection(name, (api) =>
      api.getFilteredByTag(name).sort(byOrder),
    );
  }

  eleventyConfig.addCollection("releases", (api) =>
    api
      .getFilteredByTag("releases")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date)),
  );

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByTag("posts").reverse(),
  );

  // Guides are reference material rather than a timeline, so they are ordered
  // the way a reader scans a list — alphabetically, and stably as they are
  // edited. Sorting in place is safe: getFilteredByTag returns a fresh array.
  // `title` is coerced because a guide that omits it would otherwise throw
  // mid-build, rather than failing in check:ai where the message can be read.
  eleventyConfig.addCollection("guides", (api) =>
    api
      .getFilteredByTag("guides")
      .sort((a, b) =>
        String(a.data.title ?? "").localeCompare(
          String(b.data.title ?? ""),
          "en",
          { numeric: true, sensitivity: "base" },
        ),
      ),
  );

  // eleventy-navigation ships Nunjucks filters, which WebC can only reach
  // through a nested `webc:type="11ty"` block. Building the tree as a
  // collection instead means components read plain data — no escape hatch.
  // Pages opt in with front matter: eleventyNavigation: { key, order, parent }
  // Filtering on `url` keeps entries for pages that are never written (an
  // ignored template, or permalink: false) out of the header.
  eleventyConfig.addCollection("nav", (api) =>
    findNavigationEntries(api.getAll().filter((item) => item.url)),
  );

  eleventyConfig.addCollection("sitemapPages", (api) =>
    api
      .getAll()
      .filter(
        (item) =>
          item.outputPath &&
          item.outputPath.endsWith(".html") &&
          item.data.noindex !== true,
      )
      .sort((a, b) => a.url.localeCompare(b.url)),
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
    templateFormats: ["webc", "njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
