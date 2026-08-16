// The single knob-board for a site built from this template.
// `npm run setup` rewrites this file interactively; you can also just edit it.
// Every TODO: below must be replaced before launch — `npm run check:todos` enforces it.

const config = {
  // --- Identity --------------------------------------------------------
  name: "TODO: App Name",
  tagline: "TODO: one-line pitch, under 60 characters.",
  description:
    "TODO: one or two sentences describing what the app does and who it is for. Used as the default meta description and social card copy.",

  // The one sentence a language model should quote when asked what this is.
  // Deliberately not `tagline`: that one is marketing copy and may be clever,
  // this one must be plainly, boringly factual. It leads /llms.txt, /for-llms/
  // and every markdown mirror, so keep the wording identical to how you
  // describe the app elsewhere — consistent phrasing is what lets a model
  // connect this site to mentions of it on other sites.
  oneLiner:
    "TODO: App Name is a [category] app for [platform] that helps [who] do [what].",

  // No trailing slash. Also drives the CNAME file and every absolute URL.
  url: "https://TODO-example.com",
  locale: "en_US",

  // --- Contact ---------------------------------------------------------
  supportEmail: "TODO: support@example.com",
  pressEmail: "TODO: press@example.com",
  publisher: "TODO: Your Company Pty Ltd",

  // Year the publisher started, as a plain string. Emitted as the
  // Organization's foundingDate. Leave empty to omit it.
  foundedYear: "",

  // Every other profile that is unambiguously *you* — Mastodon, GitHub, X,
  // LinkedIn, a company page. Emitted as schema.org `sameAs`, which is how a
  // model works out that a post from one of these accounts is about this app.
  // Ships empty on purpose: a placeholder here would force every site with no
  // Mastodon account to edit a knob it does not want.
  sameAs: [],

  // Your Mastodon profile URL, e.g. https://mastodon.social/@yourapp. Drives
  // four things: the footer link, the rel="me" that lets Mastodon verify the
  // website link on your profile, the fediverse:creator byline on link
  // previews of your pages, and a schema.org sameAs entry — it is folded into
  // the list above, so do not enter it twice. Empty omits all four.
  mastodon: "",

  // --- App Store -------------------------------------------------------
  // appStoreId powers the apple-itunes-app smart banner.
  // Leave either store URL empty to hide that badge — an iOS-only or
  // Mac-only site needs no other change. A universal purchase should set both
  // to the same URL: only the App Store badge renders, which is the correct
  // one for a single product page.
  appStoreId: "TODO: 0000000000",
  appStoreUrl: "TODO: https://apps.apple.com/us/app/your-app/id0000000000",
  macAppStoreUrl: "TODO: https://apps.apple.com/us/app/your-app/id0000000000",

  // --- Product Hunt ----------------------------------------------------
  // From your launch's embed code (Product Hunt → your product → Promote →
  // Embed). Two values because they are genuinely two things: the badge image
  // API only accepts the numeric post id, and the link has to point at the
  // slug. Both must be set — either one empty hides the homepage badge and the
  // footer glyph, so a site that never launched on Product Hunt edits nothing.
  // Ships empty rather than TODO: for the same reason mastodon does.
  //
  // The badge image is fetched from Product Hunt at page load rather than
  // committed here, which is what keeps the upvote count and any award ribbon
  // current. It is the only third-party request this template makes: leave
  // these empty and the site talks to nobody but its own origin.
  productHuntPostId: "",
  productHuntUrl: "",

  // --- Presentation ----------------------------------------------------
  // The single source of truth for brand colour. site-head.webc emits these
  // as CSS custom properties, Tailwind's @theme maps its tokens onto them,
  // and site.webmanifest and the theme-color metas read them too. Nothing
  // else in the project should hardcode a brand colour.
  // themeColorDark is optional: leave it empty and dark mode reuses themeColor.
  // Set it when the brand colour is very dark or very light, or it disappears
  // into one of the two page backgrounds. Text drawn on top of the brand colour
  // is derived from its luminance, so there is no matching knob for that.
  themeColor: "#1d4ed8", // TODO: your brand colour
  themeColorDark: "",
  backgroundColor: "#fbfbfa", // TODO: light-mode page background
  backgroundColorDark: "#101014", // TODO: dark-mode page background

  // --- Social cards ----------------------------------------------------
  ogImage: "/assets/og/default.png",
  ogImageAlt: "TODO: describe the social card image for screen readers.",

  // --- Structured data -------------------------------------------------
  // See https://schema.org/softwareApplicationCategory for the vocabulary.
  // appCategory is the machine-readable token; appCategoryLabel is what a
  // reader sees in the press kit fact sheet. They are rarely the same words.
  appCategory: "TODO: ProductivityApplication",
  appCategoryLabel: "TODO: Productivity",
  operatingSystems: "TODO: iOS 18, iPadOS 18, macOS 15",

  // Shown in the press kit fact sheet and the SoftwareApplication offer.
  price: "0",
  priceCurrency: "USD",
  pricingNote:
    "TODO: Free download, with monthly and annual Pro subscriptions.",

  // --- Language models -------------------------------------------------
  // Which AI crawlers robots.txt lets in. See src/robots.txt.njk for the
  // bucket each named bot falls into.
  //
  //   "all"          every bot, training and retrieval alike. The default:
  //                  a marketing site exists to be found, and being absent
  //                  from a model's answer is the more expensive outcome.
  //   "search-only"  citable but not trainable — retrieval bots that fetch a
  //                  page to answer a live question are allowed, dataset
  //                  harvesters are not.
  //   "none"         no AI crawlers. Classic search (Googlebot, Bingbot,
  //                  Applebot) is never affected by this setting.
  aiCrawlers: "all",

  // Ship a plain-markdown twin of every page at /page/index.md, advertised
  // from the HTML with <link rel="alternate" type="text/markdown">. Language
  // models parse markdown far more reliably than they parse a Tailwind page.
  markdownMirrors: true,

  // The extension those mirrors use. GitHub Pages decides the Content-Type
  // from this, and what it picks for .md is worth checking once after your
  // first deploy:
  //
  //   curl -sI https://your-domain/index.md | grep -i content-type
  //
  // text/markdown or text/plain — nothing to do. application/octet-stream
  // makes a browser download the file instead of showing it: switch this to
  // "txt", which is text/plain everywhere. The permalink, the <link> tag and
  // check:ai all read this one value, so that is the whole change.
  mirrorExtension: "md",

  // How a model should attribute a quote from this site. `citationName` is
  // the name to use; `citationNote` is the sentence /for-llms/ prints under
  // the example citation.
  citationName: "TODO: App Name by Your Company",
  citationNote:
    "TODO: Cite the page you took the claim from, not the homepage, and link to it.",

  // Plain-language licensing, printed on /for-llms/ and in /llms.txt. Say what
  // you actually mean — these are read by people as often as by machines.
  contentLicense:
    "TODO: Page text may be quoted with attribution and a link. Do not republish whole pages.",
  assetLicense:
    "TODO: Icon and screenshots may be used in coverage of the app. Do not modify or recolour them.",

  // What the app is built with. Purely informational, shown on /for-llms/ —
  // it helps a model answer “what is it written in” without guessing.
  technologies: [],

  // Names this app is genuinely confused with, and why it is not that thing.
  // The single highest-value entry on /for-llms/ if your name collides with
  // anything: { name: "…", note: "…" }. Empty means the section is omitted.
  notToBeConfusedWith: [],
};

// --- Derived -----------------------------------------------------------
// Not knobs. Nothing below is meant to be edited, and `npm run setup` only
// ever rewrites the string literals above.

// A Mastodon profile URL is `https://instance/@user`, but the same profile
// gets copied out of the address bar as /web/@user or /users/user depending on
// where you clicked, with or without a trailing slash. All of them carry the
// username as the last path segment, which is the only part we need, so all of
// them normalise to the canonical form here. Anything unparseable yields null
// and every consumer is gated on that rather than on the raw string — a
// half-typed URL must not reach a rel="me".
function fediverseAccount(profileUrl) {
  if (!profileUrl) return null;

  let parsed;
  try {
    parsed = new URL(profileUrl);
  } catch {
    return null;
  }

  const user = (parsed.pathname.split("/").filter(Boolean).pop() ?? "").replace(
    /^@/,
    "",
  );
  if (!user) return null;

  return {
    url: `${parsed.origin}/@${user}`,
    handle: `@${user}@${parsed.host}`,
    server: parsed.host,
  };
}

const fediverse = fediverseAccount(config.mastodon);

// The badge is two knobs that only mean something together, and a half-filled
// pair is worse than an empty one — a badge image with no link, or a link with
// no badge. So the pair is validated as a unit here and every consumer gates on
// the result rather than on either raw string.
//
// Product Hunt hands out both /posts/<slug> and /products/<slug> URLs depending
// on where you copied from, and both resolve, so both are taken as given.
// Anything else is a mis-paste and yields null. The query string is dropped
// because the badge link carries its own.
function productHuntLaunch(postId, productUrl) {
  const id = String(postId ?? "").trim();
  if (!/^\d+$/.test(id) || !productUrl) return null;

  let parsed;
  try {
    parsed = new URL(productUrl);
  } catch {
    return null;
  }

  if (!/^(www\.)?producthunt\.com$/.test(parsed.hostname)) return null;

  // The collection segment is preserved rather than normalised: Product Hunt
  // migrated posts to /products/ and not every slug survived intact, so
  // rewriting one into the other is a way to invent a 404.
  const path = parsed.pathname.replace(/\/+$/, "");
  if (!/^\/(posts|products)\/[^/]+$/.test(path)) return null;

  const url = `https://www.producthunt.com${path}`;
  const embed = (theme) =>
    `https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${id}&theme=${theme}`;

  return {
    // The plain product page. What the footer glyph links to, and what the
    // structured data claims — a canonical URL with campaign parameters
    // stapled to it is not a canonical URL.
    url,
    // The badge's own link. Product Hunt issues its embed with these attached,
    // and they are what makes the referral show up in a maker's dashboard.
    badgeUrl: `${url}?embed=true&utm_source=badge-featured&utm_medium=badge`,
    imageLight: embed("light"),
    imageDark: embed("dark"),
  };
}

const productHunt = productHuntLaunch(
  config.productHuntPostId,
  config.productHuntUrl,
);

export default {
  ...config,
  fediverse,
  productHunt,

  // A Mastodon profile is a `sameAs` entry like any other, so it is merged in
  // here rather than at four call sites — json-ld.webc and everything that
  // prints this list pick it up without knowing Mastodon exists. Deduped
  // through the same normaliser, so listing it by hand above is harmless.
  // Mastodon first: the surfaces that print this list print it in order.
  //
  // The Product Hunt page is deliberately NOT merged in. This list is the
  // Organization's, and every entry in it has to be the publisher; a Product
  // Hunt listing is a page about the app. It is emitted as a sameAs on the
  // SoftwareApplication node in json-ld.webc instead, where the claim is true.
  sameAs: fediverse
    ? [
        fediverse.url,
        ...config.sameAs.filter(
          (url) => fediverseAccount(url)?.url !== fediverse.url,
        ),
      ]
    : config.sameAs,
};
