#!/usr/bin/env node
// Fails while any TODO: placeholder from the template is still in place.
//
// A fresh clone of this template is *expected* to fail — that is the point.
// Run `npm run setup`, replace the remaining copy and assets, and this turns
// green. Wire it into CI on your own site so a placeholder can never ship.
//
// No dependencies and no build step: it walks the source tree directly.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src", "README.md"];
const SKIP_DIRS = new Set(["node_modules", "_site", ".git", "assets"]);
const TEXT_EXTENSIONS = new Set([".md", ".webc", ".njk", ".js", ".json", ".css"]);

// Anything that looks like an unreplaced placeholder value.
const MARKER = /TODO[-:]/;

function* files(path) {
  if (statSync(path).isFile()) {
    yield path;
    return;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* files(join(path, entry.name));
    } else if (TEXT_EXTENSIONS.has(extname(entry.name))) {
      yield join(path, entry.name);
    }
  }
}

const hits = [];
for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of files(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (MARKER.test(line)) {
          hits.push({ file, line: i + 1, text: line.trim().slice(0, 100) });
        }
      });
  }
}

if (hits.length === 0) {
  console.log("PASS — no TODO placeholders left.");
  process.exit(0);
}

const byFile = new Map();
for (const hit of hits) {
  if (!byFile.has(hit.file)) byFile.set(hit.file, []);
  byFile.get(hit.file).push(hit);
}

for (const [file, fileHits] of byFile) {
  console.log(`\n${file}`);
  for (const hit of fileHits) console.log(`  ${hit.line}: ${hit.text}`);
}

console.log(
  `\nFAIL — ${hits.length} placeholder(s) across ${byFile.size} file(s).` +
    `\nRun \`npm run setup\` to fill in site.js, then edit the content in src/.`,
);
process.exit(1);
