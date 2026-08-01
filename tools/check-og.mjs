#!/usr/bin/env node
// Validates the social-card metadata in _site the way a link unfurler does:
// parse each page's head, resolve og:image against the build output, and check
// the asset actually matches what the tags claim.
//
// Run after a build (`npm run build && npm run check:og`). Exits non-zero on
// failure, so it also works as a CI guard — it shells out to nothing and has no
// dependencies, PNG dimensions are read straight from the IHDR header.
//
// Catches the failure modes that break unfurls silently: a missing tag, a
// relative URL, an og:image path with no file behind it, declared dimensions
// that disagree with the real pixels, or a title past the truncation point.

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

import site from "../src/_data/site.js";

const SITE = "_site";

const REQUIRED_TAGS = [
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:image:alt",
  "og:type",
  "og:site_name",
  "twitter:title",
  "twitter:description",
  "twitter:image",
];

// Tags that must hold one specific value.
const EXACT = { "twitter:card": "summary_large_image" };

// Tags whose value must be an absolute URL. Relative values are the single most
// common reason a card fails to render, and they fail without any error.
const ABSOLUTE_TAGS = ["og:image", "og:url", "twitter:image"];

// Slack truncates a title around 88 characters and X around 70; descriptions
// are cut near 200 everywhere. Over the hard limit fails, over the soft one
// just warns.
const TITLE_HARD = 88;
const TITLE_SOFT = 70;
const DESCRIPTION_HARD = 200;

let failures = 0;
let warnings = 0;

function fail(page, message) {
  failures++;
  console.log(`  ✗ ${page}: ${message}`);
}

function warn(message) {
  warnings++;
  console.log(`  ! ${message}`);
}

// PNG: 8-byte signature, then the IHDR chunk carries width and height as
// big-endian uint32 at offsets 16 and 20.
function pngSize(path) {
  const buf = readFileSync(path);
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function metaTags(html) {
  const tags = {};
  const re =
    /<meta\s+(?:property|name)="((?:og|twitter):[^"]+)"\s+content="([^"]*)"/g;
  for (const match of html.matchAll(re)) tags[match[1]] = match[2];
  return tags;
}

// site.url is compared case-insensitively because `new URL()` lowercases the
// host, so a mixed-case value in site.js would otherwise never match.
const origin = new URL(site.url).origin;

function checkImage(tags) {
  const url = tags["og:image"];
  if (!url?.startsWith(origin)) return; // absoluteness is reported separately

  const path = join(SITE, url.slice(origin.length));
  if (!existsSync(path)) {
    fail("og:image", `404 — nothing at ${path}`);
    return;
  }

  const size = pngSize(path);
  if (!size) {
    fail(
      "og:image",
      `${path} is not a PNG — not every unfurler accepts other formats`,
    );
    return;
  }

  const { width, height } = size;
  const bytes = statSync(path).size;
  const aspect = width / height;
  const declaredWidth = Number(tags["og:image:width"]);
  const declaredHeight = Number(tags["og:image:height"]);

  if (width !== declaredWidth || height !== declaredHeight) {
    fail(
      "og:image",
      `actual ${width}x${height} but og:image:width/height declare ${declaredWidth}x${declaredHeight}`,
    );
  }
  if (aspect < 1.9 || aspect > 1.92) {
    fail("og:image", `aspect ${aspect.toFixed(3)} is not ~1.91:1 — expect cropping`);
  }
  if (width < 600) {
    fail("og:image", `${width}px wide — X and Facebook downgrade below 600`);
  }
  if (bytes > 5_000_000) {
    fail("og:image", `${(bytes / 1e6).toFixed(1)} MB exceeds the 5 MB limit`);
  } else if (bytes > 300_000) {
    warn(`og:image is ${(bytes / 1024).toFixed(0)} KB — slow scrapers may skip it`);
  }

  console.log(
    `  ✓ image ${width}x${height} ${(bytes / 1024).toFixed(0)} KB, aspect ${aspect.toFixed(3)}`,
  );
}

function checkPage(page) {
  const tags = metaTags(readFileSync(join(SITE, page), "utf8"));
  console.log(`\n${page}`);

  for (const tag of REQUIRED_TAGS) {
    if (!tags[tag]) fail(tag, "missing");
  }
  for (const [tag, expected] of Object.entries(EXACT)) {
    if (tags[tag] !== expected) {
      fail(tag, `expected "${expected}", got "${tags[tag] ?? "nothing"}"`);
    }
  }
  for (const tag of ABSOLUTE_TAGS) {
    if (tags[tag] && !tags[tag].startsWith("http")) {
      fail(tag, `relative URL "${tags[tag]}"`);
    }
  }

  checkImage(tags);

  const title = tags["og:title"] ?? "";
  const description = tags["og:description"] ?? "";
  if (title.length > TITLE_HARD) {
    fail("og:title", `${title.length} chars — truncated everywhere`);
  } else if (title.length > TITLE_SOFT) {
    warn(`og:title is ${title.length} chars — X truncates near ${TITLE_SOFT}`);
  }
  if (description.length > DESCRIPTION_HARD) {
    fail("og:description", `${description.length} chars — truncated everywhere`);
  }
  console.log(
    `  ✓ title ${title.length} chars, description ${description.length} chars`,
  );
}

if (!existsSync(SITE)) {
  console.error(`No ${SITE}/ directory — run \`npm run build\` first.`);
  process.exit(1);
}

// Every directory holding an index.html, plus the root page. Recurses one level
// so nested output like /blog/<post>/ is covered too.
function htmlPages(dir = "", depth = 2) {
  const pages = [];
  if (existsSync(join(SITE, dir, "index.html"))) {
    pages.push(join(dir, "index.html"));
  }
  if (depth === 0) return pages;
  for (const entry of readdirSync(join(SITE, dir), { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "assets") continue;
    pages.push(...htmlPages(join(dir, entry.name), depth - 1));
  }
  return pages;
}

const pages = htmlPages();
for (const page of pages) checkPage(page);

console.log(
  `\n${failures === 0 ? "PASS" : `FAIL — ${failures} issue(s)`}` +
    `${warnings > 0 ? `, ${warnings} warning(s)` : ""}` +
    ` across ${pages.length} pages`,
);
process.exit(failures === 0 ? 0 : 1);
