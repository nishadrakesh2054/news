export const SITE_CONFIG = {
  name: "Echo Manch",
  nameNp: "इको माञ्च",
  title: "Echo Manch | Nepali News, Breaking, Politics & More",
  description:
    "Echo Manch delivers breaking news, politics, economy, sports, culture, and in-depth reporting from Nepal.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://echomanchnews.com").replace(/\/$/, ""),
  englishUrl: (
    process.env.NEXT_PUBLIC_ENGLISH_SITE_URL || "https://en.echomanchnews.com"
  ).replace(/\/$/, ""),
  domain: "echomanchnews.com",
  englishDomain: "en.echomanchnews.com",
  email: "info@echomanchnews.com",
  twitter: "@echomanchnews",
} as const;

/** SEO suffix for page titles, e.g. "Category | Echo Manch" */
export const SITE_TITLE_SUFFIX = `| ${SITE_CONFIG.name}`;

/** Nepali SEO suffix */
export const SITE_TITLE_SUFFIX_NP = `| ${SITE_CONFIG.nameNp}`;
