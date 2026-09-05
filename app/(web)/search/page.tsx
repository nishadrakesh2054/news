import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Search as SearchIcon } from "lucide-react";
import { getCachedCategories } from "@/lib/public-cache";
import { searchPublishedArticles } from "@/lib/article-search";
import {
  resolveAuthorName,
  resolveCategoryName,
  resolveLanguageEdition,
} from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { NewsCard } from "@/components/portal/NewsCard";
import { PORTAL } from "@/constants/portal";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    sort?: string;
    lang?: string;
  }>;
}

export const revalidate = 30;

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, requestHost(headerList));
  return {
    title: pageTitle(lang === "en" ? "Search" : "खोज", lang),
    robots: { index: false, follow: true },
    alternates: editionAlternates("/search", lang),
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const homeHref = isEnglish ? "/?lang=en" : "/";

  const query = (params.q || "").trim();
  const categorySlug = params.category || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const sort = params.sort === "views" ? "views" : "recent";
  const limit = 12;

  const [searchResult, categories] = await Promise.all([
    searchPublishedArticles({
      query,
      categorySlug,
      sort,
      page: currentPage,
      limit,
      lang,
    }),
    getCachedCategories(),
  ]);

  const { articles, total } = searchResult;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasQuery = Boolean(query);

  const buildPageHref = (page: number) => {
    const qs = new URLSearchParams();
    if (query) qs.set("q", query);
    if (categorySlug) qs.set("category", categorySlug);
    if (sort !== "recent") qs.set("sort", sort);
    if (isEnglish) qs.set("lang", "en");
    if (page > 1) qs.set("page", String(page));
    const s = qs.toString();
    return s ? `/search?${s}` : "/search";
  };

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link
            href={homeHref}
            className="transition-colors hover:underline"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            {isEnglish ? "Search" : "खोज"}
          </span>
          {hasQuery ? (
            <>
              <span aria-hidden className="text-gray-300">
                /
              </span>
              <span className="line-clamp-1 font-medium text-gray-500">
                {query}
              </span>
            </>
          ) : null}
        </nav>

        <header className="mb-8 max-w-3xl">
          <h1
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Search news" : "समाचार खोज"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            {hasQuery
              ? isEnglish
                ? `${total} result${total === 1 ? "" : "s"} for “${query}”`
                : `“${query}” का लागि ${total} नतिजा`
              : isEnglish
                ? "Search headlines, topics, or keywords."
                : "शीर्षक, विषय वा शब्दबाट समाचार खोज्नुहोस्।"}
          </p>
        </header>

        <form
          action="/search"
          method="GET"
          className="mb-10 border-y py-4"
          style={{ borderColor: PORTAL.rule }}
        >
          {isEnglish ? <input type="hidden" name="lang" value="en" /> : null}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{isEnglish ? "Search query" : "खोज शब्द"}</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={
                  isEnglish
                    ? "Search headlines, topics, or keywords…"
                    : "समाचार शीर्षक, विषय वा शब्द…"
                }
                className="h-11 w-full border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-gray-400"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                name="category"
                defaultValue={categorySlug}
                className="h-11 border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                aria-label={isEnglish ? "Category" : "विधा"}
              >
                <option value="">{isEnglish ? "All categories" : "सबै विधा"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {resolveCategoryName(cat, lang)}
                  </option>
                ))}
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="h-11 border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                aria-label={isEnglish ? "Sort" : "क्रम"}
              >
                <option value="recent">{isEnglish ? "Newest" : "नयाँ समाचार"}</option>
                <option value="views">{isEnglish ? "Most read" : "लोकप्रिय"}</option>
              </select>

              <button
                type="submit"
                className="h-11 shrink-0 px-6 text-sm font-bold text-white"
                style={{ backgroundColor: PORTAL.brand }}
              >
                {isEnglish ? "Search" : "खोज्नुहोस्"}
              </button>
            </div>
          </div>
        </form>

        <div className="mb-4 flex items-center gap-3">
          <h2
            className="shrink-0 text-sm font-extrabold sm:text-base"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Results" : "नतिजा"}
          </h2>
          <div
            className="h-px min-w-4 flex-1"
            style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
          />
          <span className="shrink-0 text-xs font-semibold text-gray-500">
            {isEnglish ? `${total} articles` : `${total} समाचार`}
          </span>
        </div>

        {articles.length > 0 ? (
          <div>
            {articles.map((art) => (
              <NewsCard
                key={art.id}
                article={{
                  ...art,
                  author: art.author
                    ? { name: resolveAuthorName(art.author.name, lang) }
                    : art.author,
                }}
                lang={lang}
                variant="list"
                showAuthor
                showExcerpt
              />
            ))}
          </div>
        ) : (
          <div
            className="border border-dashed px-4 py-14 text-center"
            style={{ borderColor: PORTAL.rule }}
          >
            <SearchIcon className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-base font-bold" style={{ color: PORTAL.ink }}>
              {isEnglish ? "No results found" : "कुनै नतिजा भेटिएन"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {hasQuery
                ? isEnglish
                  ? `No articles matched “${query}”. Try another keyword or category.`
                  : `“${query}” सँग मिल्दो समाचार भेटिएन। अर्को शब्द वा विधा प्रयास गर्नुहोस्।`
                : isEnglish
                  ? "Enter a keyword above to search the archive."
                  : "माथिको बाकसमा शब्द लेखेर खोज्नुहोस्।"}
            </p>
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t pt-6"
            style={{ borderColor: PORTAL.rule }}
            aria-label={isEnglish ? "Pagination" : "पृष्ठहरू"}
          >
            {currentPage > 1 ? (
              <Link
                href={buildPageHref(currentPage - 1)}
                className="inline-flex h-10 items-center px-3 text-sm font-bold hover:underline"
                style={{ color: PORTAL.brand }}
              >
                {isEnglish ? "Previous" : "अघिल्लो"}
              </Link>
            ) : null}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                return (
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
                );
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev != null && p - prev > 1;
                const isCurrent = p === currentPage;
                return (
                  <span key={p} className="inline-flex items-center gap-2">
                    {showEllipsis ? (
                      <span className="px-1 text-gray-400" aria-hidden>
                        …
                      </span>
                    ) : null}
                    <Link
                      href={buildPageHref(p)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm font-bold ${
                        isCurrent ? "text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      style={isCurrent ? { backgroundColor: PORTAL.brand } : undefined}
                    >
                      {p}
                    </Link>
                  </span>
                );
              })}

            {currentPage < totalPages ? (
              <Link
                href={buildPageHref(currentPage + 1)}
                className="inline-flex h-10 items-center px-3 text-sm font-bold hover:underline"
                style={{ color: PORTAL.brand }}
              >
                {isEnglish ? "Next" : "अर्को"}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </PortalContainer>
    </main>
  );
}
