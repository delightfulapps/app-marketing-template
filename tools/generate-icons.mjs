#!/usr/bin/env node
// Derives the sized icon set in src/assets/icons/ from the 1024px master at
// src/assets/icon.png.
//
// Run manually (`npm run icons`) when the app icon changes, then re-run
// `npm run og` (the cards embed icon-512) and commit the results. Deliberately
// NOT part of `npm run build`: ImageMagick isn't on the CI runner.
//
// The master stays untouched — the press kit offers it as a download and the
// eleventy.before zip step references it by that exact path.
//
// Requires ImageMagick (`brew install imagemagick`).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const MASTER = "src/assets/icon.png";
const OUT_DIR = "src/assets/icons";

// Quantising to 255 colours roughly quarters the file size of the small icons
// with no visible banding — worth it when the favicon is fetched on every page.
const PNG_OPTS = [
  "-strip",
  "-colors",
  "255",
  "-define",
  "png:compression-level=9",
];

const SIZES = [
  { size: 512, file: "icon-512.png" }, // manifest, OG card source
  { size: 256, file: "icon-256.png" }, // hero
  { size: 192, file: "icon-192.png" }, // manifest, header, press kit
  { size: 180, file: "apple-touch-icon.png" },
];

if (!existsSync(MASTER)) {
  console.error(`No ${MASTER}. Drop a 1024x1024 PNG there first.`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const { size, file } of SIZES) {
  const out = `${OUT_DIR}/${file}`;
  execFileSync("magick", [
    MASTER,
    "-resize",
    `${size}x${size}`,
    ...PNG_OPTS,
    out,
  ]);
  console.log(`wrote ${out}`);
}

// Multi-resolution .ico for bare /favicon.ico requests from feed readers and
// older crawlers. eleventy.config.js passthrough-copies this one to the root.
execFileSync("magick", [
  MASTER,
  "-define",
  "icon:auto-resize=48,32,16",
  `${OUT_DIR}/favicon.ico`,
]);
console.log(`wrote ${OUT_DIR}/favicon.ico`);
