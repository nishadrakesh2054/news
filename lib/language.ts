export type LanguageEditionType = "ne" | "en";

/**
 * Detects the active Language Edition ("ne" for Nepali, "en" for English)
 * Checks:
 * 1. searchParams `lang` (e.g. ?lang=en or ?lang=ne)
 * 2. Host header / domain name (e.g. english.nepalkhabar.com or en.nepalkhabar.com)
 * 3. Path prefix (e.g. /en/...)
 */
export function resolveLanguageEdition(
  searchParamsLang?: string | null,
  hostname?: string | null,
  pathname?: string | null
): LanguageEditionType {
  if (searchParamsLang === "en") return "en";
  if (searchParamsLang === "ne") return "ne";

  if (pathname?.startsWith("/en")) return "en";

  if (hostname) {
    const host = hostname.toLowerCase();
    if (host.startsWith("english.") || host.startsWith("en.")) {
      return "en";
    }
  }

  return "ne"; // Default edition is Nepali
}

/**
 * Resolves headline for an article depending on active edition
 */
export function resolveArticleTitle(
  article: { title: string; titleNp?: string | null },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "en") {
    return article.title || article.titleNp || "";
  }
  return article.titleNp || article.title;
}

/**
 * Resolves body content for an article depending on active edition
 */
export function resolveArticleContent(
  article: { content: string; contentNp?: string | null },
  lang: LanguageEditionType = "ne"
): string {
  if (lang === "ne" && article.contentNp) {
    return article.contentNp;
  }
  return article.content;
}

/**
 * Resolves category name depending on active edition
 */
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
