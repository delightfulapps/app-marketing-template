#!/usr/bin/env node
// Generates the 1200x630 Open Graph cards into src/assets/og/.
//
// Run manually (`npm run og`) whenever the name, tagline, brand colour or icon
// changes, then commit the PNGs. Deliberately NOT part of `npm run build`: CI is
// a bare ubuntu runner and rsvg-convert isn't installed there.
//
// Every colour and every string comes from src/_data/site.js, so the cards
// follow the site rather than needing their own edit.
//
// Requires rsvg-convert (`brew install librsvg`) and a prior `npm run icons`.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

import site from "../src/_data/site.js";

const OUT_DIR = "src/assets/og";
const ICON = "src/assets/icons/icon-512.png";

const W = 1200;
const H = 630;
const INSET = 90; // Slack, Discord and X each crop the edges differently.

const FONT =
  "-apple-system, SF Pro Text, Helvetica Neue, Helvetica, Arial, sans-serif";
// Average glyph advance for this face at semibold, as a fraction of font-size.
// Only used to decide where to wrap, and deliberately pessimistic so a long
// tagline breaks early rather than running off the card.
const CHAR_RATIO = 0.56;

// One card per section of the site. `ogImage` front matter picks which one.
const CARDS = [
  { file: "default", label: null },
  { file: "press-kit", label: "Press Kit" },
  { file: "changelog", label: "Changelog" },
  { file: "blog", label: "Blog" },
  { file: "pricing", label: "Pricing" },
  { file: "legal", label: "Legal" },
];

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Greedy wrap on an estimated character budget.
function wrap(text, fontSize, maxWidth) {
  const perLine = Math.floor(maxWidth / (fontSize * CHAR_RATIO));
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function svg({ label }) {
  const iconData = readFileSync(ICON).toString("base64");
  const iconSize = 160;
  const iconY = 130;
  const textX = INSET + iconSize + 40;

  // Centre the title block on the icon, whether or not there's an eyebrow.
  const labelY = 178;
  const titleY = label ? 258 : 238;

  const subtitleSize = 42;
  const subtitleLines = wrap(site.tagline, subtitleSize, W - INSET * 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${site.backgroundColor}"/>
  <rect width="${W}" height="8" fill="${site.themeColor}"/>
  <image x="${INSET}" y="${iconY}" width="${iconSize}" height="${iconSize}" xlink:href="data:image/png;base64,${iconData}"/>
  <g font-family="${FONT}">
    ${
      label
        ? `<text x="${textX}" y="${labelY}" font-size="26" font-weight="600" letter-spacing="2" fill="${site.themeColor}">${escape(label.toUpperCase())}</text>`
        : ""
    }
    <text x="${textX}" y="${titleY}" font-size="84" font-weight="600" letter-spacing="-1.5" fill="${site.themeColor}">${escape(site.name)}</text>
    <text x="${INSET}" y="400" font-size="${subtitleSize}" fill="#5a5a5a">
      ${subtitleLines
        .map((l, i) => `<tspan x="${INSET}" dy="${i === 0 ? 0 : 56}">${escape(l)}</tspan>`)
        .join("\n      ")}
    </text>
    <text x="${INSET}" y="${H - INSET + 5}" font-size="28" fill="#5a5a5a">${escape(site.url.replace(/^https?:\/\//, ""))}</text>
  </g>
</svg>
`;
}

if (!existsSync(ICON)) {
  console.error(`No ${ICON}. Run \`npm run icons\` first.`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const card of CARDS) {
  const tmp = join(OUT_DIR, `${card.file}.svg`);
  const png = join(OUT_DIR, `${card.file}.png`);
  writeFileSync(tmp, svg(card));
  execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), tmp, "-o", png]);
  rmSync(tmp);
  console.log(`wrote ${png}`);
}
