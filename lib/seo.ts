import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";
import type { LanguageEditionType } from "@/lib/language";
import { absoluteUrl, getEnglishSiteUrl, getSiteUrl } from "@/lib/site-url";

/** Set by middleware so root layout can resolve `?lang=` without searchParams. */
export const SITE_LANG_HEADER = "x-site-lang";

/** Keys editable on Admin → Website → SEO */
export const ADMIN_SEO_KEYS = [
  "seo_default_title_ne",
  "seo_default_title_en",
  "seo_default_description_ne",
  "seo_default_description_en",
  "seo_keywords_ne",
  "seo_keywords_en",
  "seo_og_image",
  "seo_og_image_en",
  "seo_robots",
  "seo_twitter_handle",
] as const;

export function pageTitle(title: string, lang: LanguageEditionType): string {
  const brand = lang === "en" ? SITE_CONFIG.name : SITE_CONFIG.nameNp;
  const trimmed = title.trim();
  if (!trimmed) return brand;
  if (trimmed === brand || trimmed.endsWith(` | ${brand}`)) return trimmed;
  return `${trimmed} | ${brand}`;
}

export function defaultDescription(lang: LanguageEditionType): string {
  return lang === "en"
    ? SITE_CONFIG.description
    : "इको माञ्च — नेपालका ताजा समाचार, राजनीति, अर्थतन्त्र, खेलकुद र विचार।";
}

export function defaultSiteTitle(lang: LanguageEditionType): string {
  return lang === "en" ? SITE_CONFIG.title : `${SITE_CONFIG.nameNp} | नेपाली समाचार`;
}

export function ogLocale(lang: LanguageEditionType): string {
  return lang === "en" ? "en_US" : "ne_NP";
}

export function siteNameForLang(lang: LanguageEditionType): string {
  return lang === "en" ? SITE_CONFIG.name : SITE_CONFIG.nameNp;
}

/**
 * Self-referencing canonical + hreflang for both editions.
 * Pass `includeNe` / `includeEn` false for language-restricted content.
 */
export function editionAlternates(
  path: string,
  lang: LanguageEditionType,
  options?: { includeNe?: boolean; includeEn?: boolean }
): NonNullable<Metadata["alternates"]> {
  const includeNe = options?.includeNe !== false;
  const includeEn = options?.includeEn !== false;
  const languages: Record<string, string> = {};
  if (includeNe) languages["ne-NP"] = absoluteUrl(path, "ne");
  if (includeEn) languages.en = absoluteUrl(path, "en");
  languages["x-default"] = absoluteUrl(path, includeNe ? "ne" : "en");

  return {
    canonical: absoluteUrl(path, lang),
    languages,
  };
}

export function requestHost(headerList: Headers): string | null {
  return (
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerList.get("host") ||
    null
  );
}

export function organizationJsonLd(lang: LanguageEditionType = "ne") {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: siteNameForLang(lang),
    alternateName: lang === "en" ? SITE_CONFIG.nameNp : SITE_CONFIG.name,
    url: absoluteUrl("/", lang),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo/logo.png", lang),
    },
    sameAs: [
      "https://facebook.com",
      "https://twitter.com",
      "https://youtube.com",
    ],
  };
}

export function websiteJsonLd(lang: LanguageEditionType = "ne") {
  const home = absoluteUrl("/", lang);
  const searchBase = absoluteUrl("/search", lang);
  const searchTemplate = searchBase.includes("?")
    ? `${searchBase}&q={search_term_string}`
    : `${searchBase}?q={search_term_string}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteNameForLang(lang),
    url: home,
    inLanguage: lang === "en" ? "en" : "ne",
    publisher: {
      "@type": "Organization",
      name: siteNameForLang(lang),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo/logo.png", lang),
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[], lang: LanguageEditionType) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, lang),
    })),
  };
}

type NewsArticleLdInput = {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished: Date | string;
  dateModified?: Date | string | null;
  authorName: string;
  authorUrl?: string | null;
  lang: LanguageEditionType;
};

export function newsArticleJsonLd(input: NewsArticleLdInput) {
  const published =
    typeof input.datePublished === "string"
      ? input.datePublished
      : input.datePublished.toISOString();
  const modified = input.dateModified
    ? typeof input.dateModified === "string"
      ? input.dateModified
      : input.dateModified.toISOString()
    : published;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    image: input.image ? [input.image] : [],
    datePublished: published,
    dateModified: modified,
    inLanguage: input.lang === "en" ? "en" : "ne",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    url: input.url,
    author: {
      "@type": "Person",
      name: input.authorName,
      ...(input.authorUrl ? { url: input.authorUrl } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo/logo.png", input.lang),
      },
    },
  };
}

/** Build dual-edition sitemap entries for a path. */
export function sitemapEditionUrls(
  path: string,
  meta: {
    lastModified?: Date | string;
    changeFrequency?: MetadataRouteChangeFrequency;
    priority?: number;
  } = {}
): Array<{
  url: string;
  lastModified?: Date | string;
  changeFrequency?: MetadataRouteChangeFrequency;
  priority?: number;
  alternates?: { languages: Record<string, string> };
}> {
  const ne = absoluteUrl(path, "ne");
  const en = absoluteUrl(path, "en");
  const languages = { "ne-NP": ne, en };
  return [
    {
      url: ne,
      ...meta,
      alternates: { languages },
    },
    {
      url: en,
      ...meta,
      alternates: { languages },
    },
  ];
}

type MetadataRouteChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export function robotsSitemapList(): string[] {
  const ne = getSiteUrl();
  const en = getEnglishSiteUrl();
  const list = [`${ne}/sitemap.xml`, `${ne}/news-sitemap.xml`];
  if (ne !== en) {
    list.push(`${en}/sitemap.xml`, `${en}/news-sitemap.xml`);
  }
  return list;
}

function parseRobotsDirective(value: string): Metadata["robots"] | undefined {
  const normalized = value.replace(/\s+/g, "").toLowerCase();
  if (!normalized) return undefined;
  const parts = new Set(normalized.split(",").filter(Boolean));
  const index = !parts.has("noindex");
  const follow = !parts.has("nofollow");
  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };
}

export type SiteSeoDefaults = {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  twitterHandle?: string;
  robots?: Metadata["robots"];
};

/**
 * Resolve bilingual site SEO defaults from admin settings + hardcoded fallbacks.
 */
export async function resolveSiteSeoDefaults(
  lang: LanguageEditionType
): Promise<SiteSeoDefaults> {
  try {
    const { getSettings } = await import("@/lib/settings-store");
    const data = await getSettings([
      "seo_default_title_ne",
      "seo_default_title_en",
      "seo_default_description_ne",
      "seo_default_description_en",
      "seo_keywords_ne",
      "seo_keywords_en",
      "seo_og_image",
      "seo_og_image_en",
      "seo_robots",
      "seo_twitter_handle",
      "seo_default_title",
      "seo_default_description",
    ]);

    const title =
      (lang === "en"
        ? data.seo_default_title_en?.trim() || data.seo_default_title?.trim()
        : data.seo_default_title_ne?.trim() || data.seo_default_title?.trim()) ||
      defaultSiteTitle(lang);

    const description =
      (lang === "en"
        ? data.seo_default_description_en?.trim() ||
          data.seo_default_description?.trim()
        : data.seo_default_description_ne?.trim() ||
          data.seo_default_description?.trim()) || defaultDescription(lang);

    const keywords =
      (lang === "en"
        ? data.seo_keywords_en?.trim()
        : data.seo_keywords_ne?.trim()) || undefined;

    const ogImage =
      (lang === "en"
        ? data.seo_og_image_en?.trim() || data.seo_og_image?.trim()
        : data.seo_og_image?.trim() || data.seo_og_image_en?.trim()) || undefined;

    const twitterHandle = data.seo_twitter_handle?.trim() || undefined;
    const robotsRaw = data.seo_robots?.trim();
    const robots =
      robotsRaw && robotsRaw !== "index,follow"
        ? parseRobotsDirective(robotsRaw)
        : undefined;

    return { title, description, keywords, ogImage, twitterHandle, robots };
  } catch {
    return {
      title: defaultSiteTitle(lang),
      description: defaultDescription(lang),
    };
  }
}

/**
 * Merge admin Website → SEO settings into root metadata for the active edition.
 * Does not override per-page editionAlternates / hreflang (those stay automatic).
 */
export async function getAdminSeoMetadataOverrides(
  lang: LanguageEditionType = "ne"
): Promise<Partial<Metadata>> {
  try {
    const defaults = await resolveSiteSeoDefaults(lang);
    const overrides: Partial<Metadata> = {};
    const brand = siteNameForLang(lang);

    overrides.title = { default: defaults.title, template: "%s" };
    overrides.description = defaults.description;
    overrides.openGraph = {
      title: defaults.title,
      description: defaults.description,
      siteName: brand,
      locale: ogLocale(lang),
      alternateLocale: lang === "en" ? ["ne_NP"] : ["en_US"],
    };
    overrides.twitter = {
      card: "summary_large_image",
      title: defaults.title,
      description: defaults.description,
    };

    if (defaults.keywords) {
      overrides.keywords = defaults.keywords.split(",").map((k) => k.trim()).filter(Boolean);
    }

    if (defaults.ogImage) {
      overrides.openGraph = {
        ...overrides.openGraph,
        images: [{ url: defaults.ogImage, width: 1200, height: 630, alt: brand }],
      };
      overrides.twitter = {
        ...(overrides.twitter as object),
        images: [defaults.ogImage],
      } as Metadata["twitter"];
    }

    if (defaults.twitterHandle) {
      const handle = defaults.twitterHandle.startsWith("@")
        ? defaults.twitterHandle
        : `@${defaults.twitterHandle}`;
      overrides.twitter = {
        ...(overrides.twitter as object),
        site: handle,
        creator: handle,
      } as Metadata["twitter"];
    }

    if (defaults.robots) {
      overrides.robots = defaults.robots;
    }

    // Keep dual-edition alternates from SITE_CONFIG — do not apply a single canonical override.
    return overrides;
  } catch {
    return {};
  }
}
