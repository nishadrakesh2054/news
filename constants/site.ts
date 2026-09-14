function trimOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, "");
}

/** Prefer configured public URL; on Vercel fall back to the deployment host until custom domain is wired. */
function resolveSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return trimOrigin(configured);

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return trimOrigin(`https://${host}`);
  }

  return "https://echomanch.com";
}

function resolveEnglishOrigin(siteOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_ENGLISH_SITE_URL?.trim();
  if (configured) return trimOrigin(configured);
  // Same-host until en. subdomain is live (Vercel / single-domain preview).
  return siteOrigin;
}

const siteOrigin = resolveSiteOrigin();
const englishOrigin = resolveEnglishOrigin(siteOrigin);

function hostOf(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin.replace(/^https?:\/\//, "").split("/")[0] || origin;
  }
}

/** Public brand / social / SEO defaults (URLs resolve from env so Vercel → custom domain is seamless). */
export const SITE_CONFIG = {
  name: "Echo Manch",
  nameNp: "इको माञ्च",
  title: "Echo Manch | Nepali News, Breaking, Politics & More",
  titleNp: "इको माञ्च | नेपाली समाचार, राजनीति र ताजा खबर",
  description:
    "Echo Manch delivers breaking news, politics, economy, sports, culture, and in-depth reporting from Nepal.",
  descriptionNp:
    "इको माञ्च — नेपालका ताजा समाचार, राजनीति, अर्थतन्त्र, खेलकुद, संस्कृति र गहन रिपोर्टिङ।",
  url: siteOrigin,
  englishUrl: englishOrigin,
  domain: hostOf(siteOrigin),
  englishDomain: hostOf(englishOrigin),
  email: "info@echomanch.com",
  twitter: "@echomanch",
  /** Official profiles — omit empties from JSON-LD sameAs. */
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || "",
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || "https://x.com/echomanch",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() || "",
  },
  /** Canonical logo path used for OG, JSON-LD, header, footer. */
  logoPath: "/logo/logo.png",
  /** Default Open Graph image (1200×630-capable asset). */
  ogImagePath: "/logo/logo.png",
} as const;

/** SEO suffix for page titles, e.g. "Category | Echo Manch" */
export const SITE_TITLE_SUFFIX = `| ${SITE_CONFIG.name}`;

/** Nepali SEO suffix */
export const SITE_TITLE_SUFFIX_NP = `| ${SITE_CONFIG.nameNp}`;
