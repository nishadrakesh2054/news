import { LanguageEdition, Prisma } from "@prisma/client";

export type LanguageEditionType = "ne" | "en";

const ENGLISH_HOST_PREFIXES = ["en.", "english."];

export function isEnglishHostname(hostname?: string | null): boolean {
  if (!hostname) return false;
  const host = hostname.toLowerCase().split(":")[0];
  return ENGLISH_HOST_PREFIXES.some((prefix) => host.startsWith(prefix));
}

export function parseLangParam(value?: string | null): LanguageEditionType | null {
  if (value === "en" || value === "english") return "en";
  if (value === "ne" || value === "np" || value === "nepali") return "ne";
  return null;
}

/**
 * Detects the active edition:
 * 1. `?lang=en|ne`
 * 2. Host (en.echomanchs.com / english.echomanchs.com)
 * 3. Path prefix `/en`
 * Default: Nepali
 */
export function resolveLanguageEdition(
  searchParamsLang?: string | null,
  hostname?: string | null,
  pathname?: string | null
): LanguageEditionType {
  const fromQuery = parseLangParam(searchParamsLang);
  if (fromQuery) return fromQuery;

  if (pathname?.startsWith("/en/") || pathname === "/en") return "en";

  if (isEnglishHostname(hostname)) return "en";

  return "ne";
}

export function resolveLanguageFromRequest(request: {
  nextUrl: { searchParams: URLSearchParams; pathname: string };
  headers: Headers;
}): LanguageEditionType {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");

  return resolveLanguageEdition(
    request.nextUrl.searchParams.get("lang"),
    host,
    request.nextUrl.pathname
  );
}

export function languageEditionsForLang(lang: LanguageEditionType): LanguageEdition[] {
  return lang === "en"
    ? [LanguageEdition.ENGLISH_ONLY, LanguageEdition.BOTH]
    : [LanguageEdition.NEPALI_ONLY, LanguageEdition.BOTH];
}

export function languageEditionWhere(
  lang: LanguageEditionType
): Prisma.ArticleWhereInput {
  return { languageEdition: { in: languageEditionsForLang(lang) } };
}

export function articleMatchesLang(
  edition: LanguageEdition | null | undefined,
  lang: LanguageEditionType
): boolean {
  if (!edition) return true;
  return languageEditionsForLang(lang).includes(edition);
}

export function languageEditionSql(lang: LanguageEditionType): Prisma.Sql {
  if (lang === "en") {
    return Prisma.sql`AND a."languageEdition" IN ('ENGLISH_ONLY'::"LanguageEdition", 'BOTH'::"LanguageEdition")`;
  }
  return Prisma.sql`AND a."languageEdition" IN ('NEPALI_ONLY'::"LanguageEdition", 'BOTH'::"LanguageEdition")`;
}

export function resolveArticleTitle(
  article: { title: string; titleNp?: string | null },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "en") {
    return article.title || article.titleNp || "";
  }
  return article.titleNp || article.title;
}

export function resolveArticleContent(
  article: { content: string; contentNp?: string | null },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "ne" && article.contentNp) {
    return article.contentNp;
  }
  return article.content;
}

export function resolveArticleExcerpt(
  article: {
    excerpt?: string | null;
    excerptNp?: string | null;
    title?: string;
    titleNp?: string | null;
  },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "en") {
    return (
      article.excerpt?.trim() ||
      article.excerptNp?.trim() ||
      resolveArticleTitle({ title: article.title || "", titleNp: article.titleNp }, lang)
    );
  }
  return (
    article.excerptNp?.trim() ||
    article.excerpt?.trim() ||
    resolveArticleTitle({ title: article.title || "", titleNp: article.titleNp }, lang)
  );
}

export function resolveMetaTitle(
  article: {
    metaTitle?: string | null;
    metaTitleNp?: string | null;
    title: string;
    titleNp?: string | null;
  },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "en") {
    return article.metaTitle?.trim() || article.metaTitleNp?.trim() || resolveArticleTitle(article, lang);
  }
  return article.metaTitleNp?.trim() || article.metaTitle?.trim() || resolveArticleTitle(article, lang);
}

export function resolveMetaDescription(
  article: {
    metaDescription?: string | null;
    metaDescriptionNp?: string | null;
    excerpt?: string | null;
    excerptNp?: string | null;
    title?: string;
    titleNp?: string | null;
  },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "en") {
    return (
      article.metaDescription?.trim() ||
      article.metaDescriptionNp?.trim() ||
      resolveArticleExcerpt(article, lang)
    );
  }
  return (
    article.metaDescriptionNp?.trim() ||
    article.metaDescription?.trim() ||
    resolveArticleExcerpt(article, lang)
  );
}

export function resolveKeywords(
  article: { keywords?: string | null; keywordsNp?: string | null },
  lang: LanguageEditionType = "ne"
): string | null {
  if (lang === "en") {
    return article.keywords?.trim() || article.keywordsNp?.trim() || null;
  }
  return article.keywordsNp?.trim() || article.keywords?.trim() || null;
}

export function resolveCategoryName(
  category?: { name: string; nameNp?: string | null } | null,
  lang: LanguageEditionType = "ne"
): string {
  if (!category) return lang === "en" ? "General" : "मुख्य";
  if (lang === "en") {
    return category.name || category.nameNp || "General";
  }
  return category.nameNp || category.name;
}

/** Category blurb by edition — never mix EN description under Nepali UI. */
export function resolveCategoryDescription(
  category?: {
    description?: string | null;
    descriptionNp?: string | null;
  } | null,
  lang: LanguageEditionType = "ne"
): string | null {
  if (!category) return null;
  if (lang === "en") {
    return category.description?.trim() || category.descriptionNp?.trim() || null;
  }
  return category.descriptionNp?.trim() || null;
}

export function htmlLang(lang: LanguageEditionType): string {
  return lang === "en" ? "en" : "ne";
}
