import { SITE_CONFIG } from "@/constants/site";
import type { LanguageEditionType } from "@/lib/language";

/** Canonical Nepali public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_CONFIG.url;
  return raw.replace(/\/$/, "");
}

/** Canonical English public site URL (no trailing slash). */
export function getEnglishSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_ENGLISH_SITE_URL?.trim() || SITE_CONFIG.englishUrl;
  return raw.replace(/\/$/, "");
}

export function getSiteUrlForLang(lang: LanguageEditionType): string {
  return lang === "en" ? getEnglishSiteUrl() : getSiteUrl();
}

export function absoluteUrl(path: string, lang: LanguageEditionType = "ne"): string {
  const base = getSiteUrlForLang(lang);
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Localhost keeps ?lang=; production switches hosts. */
export function editionHomeHref(lang: LanguageEditionType, hostname?: string | null): string {
  const host = hostname?.split(":")[0]?.toLowerCase() ?? "";
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  if (isLocal) {
    return lang === "en" ? "/?lang=en" : "/?lang=ne";
  }
  return getSiteUrlForLang(lang);
}
