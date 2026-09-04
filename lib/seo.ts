import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";
import type { LanguageEditionType } from "@/lib/language";
import { absoluteUrl, getEnglishSiteUrl, getSiteUrl } from "@/lib/site-url";

/** Set by middleware so root layout can resolve `?lang=` without searchParams. */
export const SITE_LANG_HEADER = "x-site-lang";

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

const ADMIN_SEO_KEYS = [
  "seo_default_title",
  "seo_default_description",
  "seo_canonical_url",
  "seo_og_image",
  "seo_robots",
  "seo_twitter_handle",
] as const;

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

/**
 * Merge non-empty admin Website → SEO settings into root metadata.
 * Empty values leave SITE_CONFIG defaults intact.
 */
export async function getAdminSeoMetadataOverrides(): Promise<Partial<Metadata>> {
  try {
    const { getSettings } = await import("@/lib/settings-store");
    const data = await getSettings([...ADMIN_SEO_KEYS]);
    const overrides: Partial<Metadata> = {};

    const title = data.seo_default_title?.trim();
    const description = data.seo_default_description?.trim();
    const canonical = data.seo_canonical_url?.trim();
    const ogImage = data.seo_og_image?.trim();
    const twitter = data.seo_twitter_handle?.trim();
    const robotsRaw = data.seo_robots?.trim();

    if (title) {
      overrides.title = { default: title, template: "%s" };
      overrides.openGraph = { ...(overrides.openGraph || {}), title };
      overrides.twitter = { ...(overrides.twitter as object), title } as Metadata["twitter"];
    }
    if (description) {
      overrides.description = description;
      overrides.openGraph = { ...(overrides.openGraph || {}), description };
      overrides.twitter = {
        ...(overrides.twitter as object),
        description,
      } as Metadata["twitter"];
    }
    if (canonical) {
      overrides.alternates = {
        ...(overrides.alternates || {}),
        canonical,
      };
      overrides.openGraph = { ...(overrides.openGraph || {}), url: canonical };
    }
    if (ogImage) {
      overrides.openGraph = {
        ...(overrides.openGraph || {}),
        images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_CONFIG.name }],
      };
      overrides.twitter = {
        ...(overrides.twitter as object),
        images: [ogImage],
      } as Metadata["twitter"];
    }
    if (twitter) {
      const handle = twitter.startsWith("@") ? twitter : `@${twitter}`;
      overrides.twitter = {
        ...(overrides.twitter as object),
        site: handle,
        creator: handle,
      } as Metadata["twitter"];
    }
    if (robotsRaw && robotsRaw !== "index,follow") {
      const robots = parseRobotsDirective(robotsRaw);
      if (robots) overrides.robots = robots;
    }

    return overrides;
  } catch {
    return {};
  }
}
