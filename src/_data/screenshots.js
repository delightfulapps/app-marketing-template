import { readdirSync } from "node:fs";
import { join } from "node:path";

import site from "./site.js";

const ROOT = "src/assets/screenshots";
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

// Add a platform by adding a directory here and a matching folder under
// src/assets/screenshots/. Nothing else needs to change — the homepage gallery
// and the press kit both read this file.
const PLATFORMS = {
  ios: "iOS",
  macos: "macOS",
  visionos: "visionOS",
};

// Alt text is derived from the filename, so `02_app_details.png` becomes
// "… on iOS — app details". Name files descriptively and the alt text follows.
function label(stem) {
  return stem.replace(/^\d+[-_]/, "").replace(/[-_]/g, " ");
}

function list(dir, platform) {
  try {
    return readdirSync(join(ROOT, dir))
      .filter((f) => IMAGE_RE.test(f))
      .sort()
      .map((f) => ({
        url: `/assets/screenshots/${dir}/${f}`,
        alt: `${site.name} on ${platform} — ${label(f.replace(IMAGE_RE, ""))}`,
      }));
  } catch {
    // Directory missing or empty — the gallery simply skips this platform.
    return [];
  }
}

export default Object.fromEntries(
  Object.entries(PLATFORMS).map(([dir, platform]) => [
    dir,
    { platform, items: list(dir, platform) },
  ]),
);
