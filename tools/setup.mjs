#!/usr/bin/env node
// One-time interactive setup for a site made from this template.
//
// Rewrites src/_data/site.js from your answers and prints the checklist of
// things it cannot do for you (assets, legal copy, screenshots). Safe to re-run
// — it reads the current values and offers them as defaults.
//
// No dependencies: node:readline only.

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readFileSync, writeFileSync } from "node:fs";

import site from "../src/_data/site.js";

const SITE_FILE = "src/_data/site.js";

// key, prompt, and how to fix up the answer. Order is the order asked.
const FIELDS = [
  { key: "name", prompt: "App name" },
  { key: "tagline", prompt: "Tagline (one line, under 60 chars)" },
  { key: "description", prompt: "Description (1–2 sentences)" },
  {
    key: "oneLiner",
    prompt: "One plain factual sentence a language model can quote",
  },
  {
    key: "url",
    prompt: "Site URL (e.g. https://example.com)",
    clean: (v) => v.replace(/\/+$/, ""),
  },
  { key: "publisher", prompt: "Publisher / legal entity" },
  { key: "supportEmail", prompt: "Support email" },
  { key: "pressEmail", prompt: "Press email" },
  {
    key: "appStoreId",
    prompt: "App Store ID (digits only, blank to skip)",
    optional: true,
  },
  {
    key: "appStoreUrl",
    prompt: "App Store URL (blank to hide the iOS badge)",
    optional: true,
  },
  {
    key: "macAppStoreUrl",
    prompt: "Mac App Store URL (blank to hide the Mac badge)",
    optional: true,
  },
  {
    key: "mastodon",
    prompt: "Mastodon profile URL (blank to skip)",
    optional: true,
    clean: (v) => v.replace(/\/+$/, ""),
    validate: (v) =>
      /^https?:\/\/[^/]+\/@?[^/]+/.test(v) ||
      "Expected a profile URL like https://mastodon.social/@yourapp",
  },
  {
    key: "themeColor",
    prompt: "Brand colour (hex)",
    validate: (v) => /^#[0-9a-f]{3,8}$/i.test(v) || "Expected a hex colour like #1d4ed8",
  },
  {
    key: "themeColorDark",
    prompt: "Brand colour for dark mode (blank to reuse the one above)",
    optional: true,
    validate: (v) => /^#[0-9a-f]{3,8}$/i.test(v) || "Expected a hex colour like #78a3d3",
  },
  { key: "appCategory", prompt: "schema.org application category" },
  {
    key: "appCategoryLabel",
    prompt: "Category in plain English (e.g. Developer Tools)",
  },
  { key: "operatingSystems", prompt: "Supported OS versions" },
  { key: "pricingNote", prompt: "One-line pricing summary" },
  { key: "ogImageAlt", prompt: "Alt text for the social card" },
  { key: "citationName", prompt: "How a model should name you in a citation" },
  { key: "citationNote", prompt: "One line on how to cite this site" },
  { key: "contentLicense", prompt: "What others may do with the page text" },
  { key: "assetLicense", prompt: "What others may do with the icon and screenshots" },
];

// Placeholder values are shown as "(unset)" rather than offered as a default,
// so pressing enter never re-accepts a TODO.
const placeholder = (value) => /^TODO[-:]/.test(String(value ?? ""));

const rl = createInterface({
  input: stdin,
  output: stdout,
  terminal: Boolean(stdin.isTTY),
});

// Reading through the async iterator rather than rl.question() so the script
// behaves the same when answers are piped in — question() drops buffered lines
// on a non-TTY stdin and hangs on the second prompt.
const lines = rl[Symbol.asyncIterator]();

async function readLine(promptText) {
  stdout.write(promptText);
  const { value, done } = await lines.next();
  if (done) {
    stdout.write("\nAborted — no more input.\n");
    process.exit(1);
  }
  if (!stdin.isTTY) stdout.write(`${value}\n`);
  return value;
}

async function ask(field) {
  const current = site[field.key];
  const suffix = placeholder(current) ? "" : ` [${current}]`;

  for (;;) {
    const answer = (await readLine(`${field.prompt}${suffix}: `)).trim();

    if (!answer) {
      if (!placeholder(current)) return current;
      if (field.optional) return "";
      console.log("  Required.");
      continue;
    }

    const value = field.clean ? field.clean(answer) : answer;
    const problem = field.validate?.(value);
    if (problem && problem !== true) {
      console.log(`  ${problem}`);
      continue;
    }
    return value;
  }
}

console.log(
  "\nSetting up your site. Press enter to keep a value shown in brackets.\n",
);

const answers = {};
for (const field of FIELDS) answers[field.key] = await ask(field);
rl.close();

// Rewrite in place so every comment in site.js survives. Each value lives on
// its own `key: "…"` line, including multi-line strings, which the description
// field is — so match lazily across newlines up to the closing quote.
let source = readFileSync(SITE_FILE, "utf8");

for (const [key, value] of Object.entries(answers)) {
  const escaped = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const re = new RegExp(`(\\n  ${key}:\\s*)(?:"[^"]*"|'[^']*')`, "s");
  if (!re.test(source)) {
    console.warn(`! Could not find ${key} in ${SITE_FILE} — set it by hand.`);
    continue;
  }
  source = source.replace(re, `$1"${escaped}"`);
}

// Strip the now-stale "TODO: your brand colour" style trailing comments.
source = source.replace(/, *\/\/ TODO:[^\n]*/g, ",");

writeFileSync(SITE_FILE, source);
console.log(`\nWrote ${SITE_FILE}.\n`);

console.log(`Still to do:

  1. Replace src/assets/icon.png with your 1024x1024 app icon,
     then run:  npm run icons && npm run og
  2. Drop screenshots into src/assets/screenshots/{ios,macos,visionos}/
     (numbered, e.g. 01_home.png — the filename becomes the alt text)
  3. Write the content in src/content/{features,faq,pricing,releases}/
  4. Replace src/privacy.md, src/terms.md and src/support.md with real copy
  5. Fill in the press kit prose in src/press-kit.webc
  6. Write src/content/audience/ — who the app is for, when to recommend it,
     and when it is not the right answer. Only /for-llms/, /llms.txt and the
     markdown mirrors read these, and the "not the right answer" entries are
     what stop an AI assistant recommending the app for things it cannot do.
  7. Set the list values in src/_data/site.js by hand — this wizard only
     rewrites single-line strings: sameAs (your other profiles, which is how a
     model connects them to this app), technologies, notToBeConfusedWith
  8. Decide src/_data/site.js aiCrawlers: "all" (the default), "search-only"
     (citable but not trainable), or "none"
  9. If you set a Mastodon URL above: after your first deploy, open Mastodon →
     Edit profile → Profile metadata and add a row pointing at your site.
     Mastodon fetches it, finds the rel="me" this template emits, and the link
     turns green. That half of the round-trip is the only part nothing here
     can do for you.

The App Store badges are already Apple's official artwork and appear as soon as
a store URL above is set — no asset work needed there.

Then run \`npm run check\` — it fails until every TODO: placeholder is gone.
`);
