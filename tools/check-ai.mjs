#!/usr/bin/env node
// Validates everything in _site that exists for machine readers: the JSON-LD
// on every page, /llms.txt, the markdown mirrors, and the crawler policy in
// robots.txt.
//
// Run after a build (`npm run build && npm run check:ai`). Exits non-zero on
// failure, so it works as a CI guard. No dependencies — same house rules as
// check-og.mjs, which this deliberately reads like.
//
// A fresh clone of the template FAILS here, exactly as it fails check:todos.
// The structured data drops placeholder values by construction rather than
// emitting them (see json-ld.webc), so an unfilled site.js shows up as missing
// required fields. That is the check working, not a broken setup.
//
// The failure modes it exists to catch, none of which are visible by eye:
//   - JSON-LD that does not parse at all
//   - a value carrying an HTML entity, so `Bits &amp; Bobs` is the app's name
//     as far as every consumer is concerned
//   - an @id reference pointing at a node that is not in the graph
//   - #app or #organization described differently on two pages, so one
//     identifier names two things
//   - the siteUrl/absoluteUrl filter trap, which fails by emitting relative
//     URLs rather than by erroring
//   - llms.txt linking to a page the build never wrote
//   - a page advertising a markdown mirror that does not exist
//   - a rel="me" or fediverse:creator that disagrees with site.js or with the
//     structured data, which verifies as a dead link rather than as an error

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import site from "../src/_data/site.js";

const SITE = "_site";
const ORIGIN = new URL(site.url).origin;

// Fields without which a node tells a consumer nothing useful. Not the full
// schema.org vocabulary — the subset Google and the AI crawlers actually read.
const REQUIRED = {
  Organization: ["name", "url", "logo"],
  WebSite: ["url", "name", "publisher"],
  SoftwareApplication: [
    "name",
    "description",
    "applicationCategory",
    "operatingSystem",
    "offers",
  ],
  WebPage: ["url", "name", "isPartOf", "breadcrumb"],
  CollectionPage: ["url", "name", "isPartOf", "breadcrumb"],
  AboutPage: ["url", "name", "isPartOf", "breadcrumb"],
  BreadcrumbList: ["itemListElement"],
  BlogPosting: [
    "headline",
    "datePublished",
    "author",
    "publisher",
    "mainEntityOfPage",
  ],
  // No datePublished, unlike BlogPosting: a guide is reference material that
  // may legitimately never carry one, where a post without a date is a bug.
  TechArticle: ["headline", "author", "publisher", "mainEntityOfPage"],
  FAQPage: ["mainEntity"],
  ItemList: ["itemListElement"],
};

// Keys whose value must be an absolute URL wherever they appear.
const URL_KEYS = new Set(["url", "@id", "logo", "image", "downloadUrl", "installUrl"]);

// Nodes that must be identical on every page, because they share one @id
// across the whole site.
const SHARED_IDS = [
  `${ORIGIN}/#organization`,
  `${ORIGIN}/#website`,
  `${ORIGIN}/#app`,
];

let failures = 0;
let warnings = 0;

function fail(scope, message) {
  failures++;
  console.log(`  ✗ ${scope}: ${message}`);
}

function warn(message) {
  warnings++;
  console.log(`  ! ${message}`);
}

function read(path) {
  return readFileSync(join(SITE, path), "utf8");
}

// --- Page discovery ---------------------------------------------------------

// Unbounded rather than depth-capped: a nested route added later must not be
// able to escape the check by being one level deeper than anyone expected.
function htmlPages(dir = "") {
  const pages = [];
  if (existsSync(join(SITE, dir, "index.html"))) {
    pages.push(join(dir, "index.html"));
  }
  for (const entry of readdirSync(join(SITE, dir), { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "assets") continue;
    pages.push(...htmlPages(join(dir, entry.name)));
  }
  return pages;
}

// --- Structured data --------------------------------------------------------

function graphOf(html) {
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ];
  return blocks.map((match) => match[1]);
}

const typesOf = (node) =>
  Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
  } else if (value && typeof value === "object") {
    visit(value);
    for (const item of Object.values(value)) walk(item, visit);
  }
}

function checkGraph(page, graph) {
  // Every @id defined on this page, so references can be resolved locally.
  const defined = new Set();
  for (const node of graph) if (node["@id"]) defined.add(node["@id"]);

  for (const node of graph) {
    for (const type of typesOf(node)) {
      for (const field of REQUIRED[type] ?? []) {
        if (node[field] === undefined) {
          fail(page, `${type} is missing "${field}"`);
        }
      }
    }
  }

  walk(graph, (node) => {
    // A bare {"@id": …} is a reference, not a node. Anything else is a
    // definition and carries its own type.
    const keys = Object.keys(node);
    if (keys.length === 1 && keys[0] === "@id" && !defined.has(node["@id"])) {
      fail(page, `@id reference "${node["@id"]}" resolves to nothing`);
    }

    for (const [key, value] of Object.entries(node)) {
      if (!URL_KEYS.has(key) || typeof value !== "string") continue;
      if (!value.startsWith("http")) {
        fail(page, `"${key}" is relative: ${value}`);
      }
    }
  });

  // Empty lists are worse than absent ones: they assert "there are none".
  walk(graph, (node) => {
    for (const key of ["itemListElement", "mainEntity"]) {
      if (Array.isArray(node[key]) && node[key].length === 0) {
        fail(page, `"${key}" is present but empty`);
      }
    }
  });

  // An HTML entity surviving into a parsed value means the JSON was escaped by
  // the HTML serialiser rather than by JSON.stringify — "Bits &amp; Bobs" is
  // valid JSON carrying the wrong string, and nothing else would complain.
  // json-ld.webc emits &, < and > as \u escapes to prevent exactly this.
  walk(graph, (node) => {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string" && /&(amp|lt|gt|quot|#39);/.test(value)) {
        fail(page, `"${key}" contains an HTML entity: ${value.slice(0, 60)}`);
      }
    }
  });

  // The head and the graph must agree about the Mastodon account. A rel="me"
  // the structured data does not corroborate is the failure nobody spots by
  // eye — the page looks right and the profile link never verifies.
  const org = graph.find((node) => node["@id"] === `${ORIGIN}/#organization`);
  if (site.fediverse && org && !(org.sameAs ?? []).includes(site.fediverse.url)) {
    fail(page, `#organization sameAs omits ${site.fediverse.url}`);
  }

  const serialised = JSON.stringify(graph);
  if (/TODO[-:]/.test(serialised)) {
    fail(page, "structured data still contains a placeholder");
  }
}

// --- llms.txt ---------------------------------------------------------------

// Resolves a site URL to the file the build should have written for it.
function outputFor(url) {
  const path = url.slice(ORIGIN.length) || "/";
  return path.endsWith("/") ? join(SITE, path, "index.html") : join(SITE, path);
}

function checkLlmsTxt() {
  console.log("\nllms.txt");
  if (!existsSync(join(SITE, "llms.txt"))) {
    fail("llms.txt", "not written — is src/llms.txt.njk in the build?");
    return;
  }
  const text = read("llms.txt");

  if (!/^# \S/m.test(text.split("\n")[0])) {
    fail("llms.txt", "must open with an H1 naming the site (llmstxt.org)");
  }
  if (!/^> \S/m.test(text)) {
    fail("llms.txt", "no blockquote summary — that is the line models quote");
  }
  if (!/^## \S/m.test(text)) {
    fail("llms.txt", "no H2 section, so there is no link list to read");
  }
  if (/TODO[-:]/.test(text)) fail("llms.txt", "still contains a placeholder");

  const links = [...text.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map(
    (match) => match[1],
  );
  if (!links.length) fail("llms.txt", "lists no links at all");

  for (const url of links) {
    if (!url.startsWith(ORIGIN)) continue; // off-site links are not ours to check
    const target = outputFor(url);
    if (!existsSync(target)) {
      fail("llms.txt", `links to ${url}, but ${target} was never written`);
    }
  }
  console.log(`  ✓ ${links.length} links, all resolvable`);

  if (!existsSync(join(SITE, "llms-full.txt"))) {
    warn("no /llms-full.txt — models that would rather read once must crawl");
  } else if (/TODO[-:]/.test(read("llms-full.txt"))) {
    fail("llms-full.txt", "still contains a placeholder");
  }
}

// --- robots.txt -------------------------------------------------------------

// The retrieval bots. Blocking these is what makes a site invisible in AI
// answers, as distinct from merely untrainable — see src/robots.txt.njk.
const RETRIEVAL = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];

function checkRobots() {
  console.log("\nrobots.txt");
  if (!existsSync(join(SITE, "robots.txt"))) {
    fail("robots.txt", "not written");
    return;
  }
  const text = read("robots.txt");

  const sitemap = text.match(/^Sitemap:\s*(\S+)/m)?.[1];
  if (!sitemap) {
    fail("robots.txt", "no Sitemap: line");
  } else if (!sitemap.startsWith("http")) {
    fail("robots.txt", `Sitemap is relative: ${sitemap} — use the siteUrl filter`);
  }

  if (!text.includes("/llms.txt")) {
    warn("robots.txt does not mention /llms.txt");
  }

  // Applebot without the suffix is the Siri and Spotlight crawler, not the
  // Apple Intelligence opt-out token. Blocking it is almost always a mistake.
  const applebotBlock = text.match(
    /^User-agent: Applebot$[\s\S]*?^(Allow|Disallow):\s*(\S*)/m,
  );
  if (applebotBlock?.[1] === "Disallow" && applebotBlock[2] === "/") {
    fail(
      "robots.txt",
      "Applebot (unsuffixed) is disallowed — that drops the site from Siri and Spotlight, not just from Apple Intelligence",
    );
  }

  const expected = site.aiCrawlers === "all" ? "Allow" : "Disallow";
  for (const bot of RETRIEVAL) {
    if (!text.includes(`User-agent: ${bot}`)) {
      fail("robots.txt", `${bot} is not named — aiCrawlers is "${site.aiCrawlers}"`);
    }
  }
  console.log(
    `  ✓ aiCrawlers: "${site.aiCrawlers}" — retrieval bots ${expected.toLowerCase()}ed`,
  );
}

// --- Markdown mirrors -------------------------------------------------------

function checkMirror(page, html) {
  const href = html.match(
    /<link rel="alternate" type="text\/markdown" href="([^"]+)"/,
  )?.[1];

  if (!site.markdownMirrors) {
    if (href) fail(page, "advertises a mirror but markdownMirrors is off");
    return;
  }
  if (!href) {
    fail(page, "no <link rel=alternate type=text/markdown>");
    return;
  }
  if (!href.startsWith("/")) {
    fail(page, `mirror href "${href}" is relative — it resolves against the page`);
    return;
  }

  const target = join(SITE, href);
  if (!existsSync(target)) {
    fail(page, `advertises ${href}, which was never written`);
  } else if (readFileSync(target, "utf8").trim().length < 40) {
    fail(page, `mirror ${href} is effectively empty`);
  }
}

// --- Fediverse --------------------------------------------------------------

// Both tags are derived from one string in site.js, so the thing worth
// asserting is that the derivation ran and reached the page — an account set
// but not emitted, or emitted after the account was removed, are the two ways
// this drifts. Shaped like checkMirror, including the feature-off branch:
// absent means absent, not blank.
function checkFediverse(page, html) {
  const me = html.match(/<link rel="me" href="([^"]+)"/)?.[1];
  const creator = html.match(
    /<meta name="fediverse:creator" content="([^"]+)"/,
  )?.[1];

  if (!site.fediverse) {
    if (me) fail(page, `emits rel="me" ${me} but site.js names no account`);
    if (creator) {
      fail(page, `emits fediverse:creator ${creator} but site.js names no account`);
    }
    return;
  }

  if (me !== site.fediverse.url) {
    fail(page, `rel="me" is ${me ?? "missing"}, expected ${site.fediverse.url}`);
  }
  if (creator !== site.fediverse.handle) {
    fail(
      page,
      `fediverse:creator is ${creator ?? "missing"}, expected ${site.fediverse.handle}`,
    );
  }
}

// --- Run --------------------------------------------------------------------

if (!existsSync(SITE)) {
  console.error(`No ${SITE}/ directory — run \`npm run build\` first.`);
  process.exit(1);
}

// Checked before anything is read: an unparseable profile URL silently drops
// every fediverse tag from the build, which otherwise looks exactly like not
// having set one.
if (site.mastodon && !site.fediverse) {
  console.log("\nsite.js");
  fail("site.js", `mastodon: "${site.mastodon}" is not a profile URL`);
}

const pages = htmlPages();
// Keyed by @id, so the same node can be compared across every page.
const shared = new Map();

for (const page of pages) {
  const html = read(page);
  console.log(`\n${page}`);

  const blocks = graphOf(html);
  if (blocks.length === 0) {
    fail(page, "no JSON-LD at all");
  }

  for (const block of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (error) {
      // Usually something in the content closed the script block early, or the
      // value was serialised through a path that re-encodes it as markup.
      fail(page, `JSON-LD does not parse — ${error.message}`);
      continue;
    }

    const graph = parsed["@graph"] ?? [parsed];
    checkGraph(page, graph);

    for (const node of graph) {
      if (!SHARED_IDS.includes(node["@id"])) continue;
      const serialised = JSON.stringify(node);
      const seen = shared.get(node["@id"]);
      if (!seen) {
        shared.set(node["@id"], { page, serialised });
      } else if (seen.serialised !== serialised) {
        fail(
          page,
          `${node["@id"]} differs from the version on ${seen.page} — one @id, two entities`,
        );
      }
    }
    console.log(`  ✓ ${graph.length} nodes`);
  }

  checkMirror(page, html);
  checkFediverse(page, html);
}

for (const id of SHARED_IDS) {
  if (!shared.has(id)) warn(`no node anywhere defines ${id}`);
}

checkLlmsTxt();
checkRobots();

console.log(
  `\n${failures === 0 ? "PASS" : `FAIL — ${failures} issue(s)`}` +
    `${warnings > 0 ? `, ${warnings} warning(s)` : ""}` +
    ` across ${pages.length} pages`,
);
process.exit(failures === 0 ? 0 : 1);
