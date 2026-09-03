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

function hostsMatch(a: string, b: string): boolean {
  try {
    return new URL(a).host === new URL(b).host;
  } catch {
    return a.replace(/\/$/, "") === b.replace(/\/$/, "");
  }
}

/** True when both editions share one host (e.g. echomanchnews.vercel.app). */
export function isSameHostEditions(): boolean {
  return hostsMatch(getSiteUrl(), getEnglishSiteUrl());
}

function withLangQuery(path: string, lang: LanguageEditionType): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (lang !== "en") return normalized;
  const [pathname, existing = ""] = normalized.split("?");
  const params = new URLSearchParams(existing);
  params.set("lang", "en");
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function absoluteUrl(path: string, lang: LanguageEditionType = "ne"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrlForLang(lang);
  const pathWithLang = isSameHostEditions() ? withLangQuery(path, lang) : path.startsWith("/") ? path : `/${path}`;
  const normalizedPath = pathWithLang.startsWith("/") ? pathWithLang : `/${pathWithLang}`;
  return `${base}${normalizedPath}`;
}

/**
 * Localhost / same-host Vercel → ?lang=
 * Separate hosts (echomanchs.com / en.echomanchs.com) → switch base URL
 */
export function editionHomeHref(lang: LanguageEditionType, hostname?: string | null): string {
  const host = hostname?.split(":")[0]?.toLowerCase() ?? "";
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  if (isLocal || isSameHostEditions()) {
    return lang === "en" ? "/?lang=en" : "/?lang=ne";
  }
  return getSiteUrlForLang(lang);
}
