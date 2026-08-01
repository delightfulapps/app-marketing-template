// The single knob-board for a site built from this template.
// `npm run setup` rewrites this file interactively; you can also just edit it.
// Every TODO: below must be replaced before launch — `npm run check:todos` enforces it.

export default {
  // --- Identity --------------------------------------------------------
  name: "TODO: App Name",
  tagline: "TODO: one-line pitch, under 60 characters.",
  description:
    "TODO: one or two sentences describing what the app does and who it is for. Used as the default meta description and social card copy.",

  // No trailing slash. Also drives the CNAME file and every absolute URL.
  url: "https://TODO-example.com",
  locale: "en_US",

  // --- Contact ---------------------------------------------------------
  supportEmail: "TODO: support@example.com",
  pressEmail: "TODO: press@example.com",
  publisher: "TODO: Your Company Pty Ltd",

  // --- App Store -------------------------------------------------------
  // appStoreId powers the apple-itunes-app smart banner.
  // Leave either store URL empty to hide that badge — an iOS-only or
  // Mac-only site needs no other change.
  appStoreId: "TODO: 0000000000",
  appStoreUrl: "TODO: https://apps.apple.com/us/app/your-app/id0000000000",
  macAppStoreUrl: "TODO: https://apps.apple.com/us/app/your-app/id0000000000",

  // --- Presentation ----------------------------------------------------
  // The single source of truth for brand colour. site-head.webc emits these
  // as CSS custom properties, Tailwind's @theme maps its tokens onto them,
  // and site.webmanifest and the theme-color metas read them too. Nothing
  // else in the project should hardcode a brand colour.
  themeColor: "#1d4ed8", // TODO: your brand colour
  backgroundColor: "#fbfbfa", // TODO: light-mode page background
  backgroundColorDark: "#101014", // TODO: dark-mode page background

  // --- Social cards ----------------------------------------------------
  ogImage: "/assets/og/default.png",
  ogImageAlt: "TODO: describe the social card image for screen readers.",

  // --- Structured data -------------------------------------------------
  // See https://schema.org/softwareApplicationCategory for the vocabulary.
  appCategory: "TODO: ProductivityApplication",
  operatingSystems: "TODO: iOS 18, iPadOS 18, macOS 15",

  // Shown in the press kit fact sheet and the SoftwareApplication offer.
  price: "0",
  priceCurrency: "USD",
  pricingNote: "TODO: Free download with an optional Pro subscription.",
};
