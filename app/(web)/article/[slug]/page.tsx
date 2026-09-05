import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, AdSlot, LanguageEdition } from "@prisma/client";
import { formatTimeAgo, getFormattedNepaliDate } from "@/lib/nepaliDate";
import { ArticleBodyClient } from "@/components/web/ArticleBodyClient";
import { CommentsSection } from "@/components/web/CommentsSection";
import { ArticleViewTracker } from "@/components/portal/ArticleViewTracker";
import { ArticleAdSlot } from "@/components/portal/ArticleAdSlot";
import { ArticleSidebar } from "@/components/portal/ArticleSidebar";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";
import {
  articleMatchesLang,
  languageEditionWhere,
  resolveArticleContent,
  resolveArticleExcerpt,
  resolveArticleTitle,
  resolveAuthorName,
  resolveCategoryName,
  resolveKeywords,
  resolveLanguageEdition,
  resolveMetaDescription,
  resolveMetaTitle,
} from "@/lib/language";
import {
  breadcrumbJsonLd,
  editionAlternates,
  newsArticleJsonLd,
  pageTitle,
  requestHost,
} from "@/lib/seo";
import { getArticleBySlug } from "@/lib/article-page";
import { getCachedActiveAds } from "@/lib/public-cache";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PortalImage } from "@/components/portal/PortalImage";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  return resolveLanguageEdition(searchParamsLang, requestHost(headerList));
}

function editionAllows(edition: LanguageEdition | null | undefined, which: "ne" | "en") {
  if (!edition || edition === LanguageEdition.BOTH) return true;
  if (which === "en") return edition === LanguageEdition.ENGLISH_ONLY;
  return edition === LanguageEdition.NEPALI_ONLY;
}

export async function generateMetadata({ params, searchParams }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: pageTitle(lang === "en" ? "Article not found" : "समाचार भेटिएन", lang),
    };
  }

  const title = resolveMetaTitle(article, lang);
  const description = resolveMetaDescription(article, lang) || SITE_CONFIG.domain;
  const image = article.ogImage || article.coverImage || "/logo/logo.png";
  const keywords = resolveKeywords(article, lang);
  const path = `/article/${article.slug}`;

  return {
    title: pageTitle(title, lang),
    description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: editionAlternates(path, lang, {
      includeNe: editionAllows(article.languageEdition, "ne"),
      includeEn: editionAllows(article.languageEdition, "en"),
    }),
    openGraph: {
      title,
      description,
      url: absoluteUrl(path, lang),
      siteName: SITE_CONFIG.name,
      locale: lang === "en" ? "en_US" : "ne_NP",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({ params, searchParams }: ArticlePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const isEnglish = lang === "en";
  const langQuery = isEnglish ? "?lang=en" : "";

  const article = await getArticleBySlug(slug);

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    return notFound();
  }

  if (!articleMatchesLang(article.languageEdition, lang)) {
    return notFound();
  }

  const [allAds, relatedArticles, latestArticles, trendingArticles] = await Promise.all([
    getCachedActiveAds(),
    prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        ...languageEditionWhere(lang),
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        coverImage: true,
        createdAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        ...languageEditionWhere(lang),
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        coverImage: true,
        createdAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        ...languageEditionWhere(lang),
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        coverImage: true,
        createdAt: true,
        views: true,
      },
      orderBy: { views: "desc" },
      take: 5,
    }),
  ]);

  const articleAds = allAds.filter(
    (a) =>
      a.slot === AdSlot.IN_ARTICLE ||
      a.slot === AdSlot.SIDEBAR_TOP ||
      a.slot === AdSlot.SIDEBAR_BOTTOM
  );

  const inArticleAds = articleAds
    .filter((a) => a.slot === AdSlot.IN_ARTICLE)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const sidebarAdsTop = articleAds
    .filter((a) => a.slot === AdSlot.SIDEBAR_TOP)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const sidebarAdsBottom = articleAds
    .filter((a) => a.slot === AdSlot.SIDEBAR_BOTTOM)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const articlePath = `/article/${article.slug}`;

  const articleTitle = resolveArticleTitle(article, lang);
  const articleBody = resolveArticleContent(article, lang);
  const articleExcerpt = resolveArticleExcerpt(article, lang);
  const categoryName = resolveCategoryName(article.category, lang);
  const shareUrl = absoluteUrl(`/article/${article.slug}`, lang);
  const homeHref = isEnglish ? "/?lang=en" : "/";
  const coverSrc =
    optimizeCloudinaryUrl(article.coverImage || undefined, "hero") || article.coverImage;
  const authorName = resolveAuthorName(article.author.name, lang);
  const publishedAt = article.publishedAt || article.createdAt;
  const authorUrl = absoluteUrl(`/author/${article.author.id}`, lang);

  const jsonLd = newsArticleJsonLd({
    title: articleTitle,
    description: articleExcerpt || resolveMetaDescription(article, lang) || "",
    url: shareUrl,
    image: article.coverImage,
    datePublished: publishedAt,
    dateModified: article.updatedAt,
    authorName,
    authorUrl,
    lang,
  });

  const breadcrumbLd = breadcrumbJsonLd(
    [
      { name: isEnglish ? "Home" : "गृह", path: "/" },
      { name: categoryName, path: `/category/${article.category.slug}` },
      { name: articleTitle, path: `/article/${article.slug}` },
    ],
    lang
  );

  return (
    <>
      <ArticleViewTracker articleId={article.id} path={`/article/${article.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

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
            <Link
              href={`/category/${article.category.slug}${langQuery}`}
              className="transition-colors hover:underline"
              style={{ color: PORTAL.brand }}
            >
              {categoryName}
            </Link>
            <span aria-hidden className="text-gray-300">
              /
            </span>
            <span className="line-clamp-1 font-medium" style={{ color: PORTAL.ink }}>
              {articleTitle}
            </span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-12">
            <article className="min-w-0">
            <header className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <Link
                  href={`/category/${article.category.slug}${langQuery}`}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] hover:underline"
                  style={{ color: PORTAL.accent }}
                >
                  {categoryName}
                </Link>
                <div
                  className="h-px min-w-4 flex-1 max-w-[3.5rem]"
                  style={{ backgroundColor: PORTAL.accent, opacity: 0.45 }}
                />
              </div>

              <h1
                className="text-[1.75rem] font-extrabold leading-[1.25] tracking-tight sm:text-4xl sm:leading-[1.2]"
                style={{ color: PORTAL.brand }}
              >
                {articleTitle}
              </h1>

              {articleExcerpt ? (
                <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                  {articleExcerpt}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
                <Link
                  href={`/author/${article.author.id}${langQuery}`}
                  className="font-semibold hover:underline"
                  style={{ color: PORTAL.brand }}
                >
                  {authorName}
                </Link>
                <span className="text-gray-300" aria-hidden>
                  ·
                </span>
                <time dateTime={publishedAt.toISOString()}>
                  {isEnglish
                    ? publishedAt.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : getFormattedNepaliDate(publishedAt)}
                </time>
                <span className="text-gray-300" aria-hidden>
                  ·
                </span>
                <span>
                  {article.views.toLocaleString()}{" "}
                  {isEnglish ? "views" : "पढिएको"}
                </span>
              </div>
            </header>

            {coverSrc ? (
              <figure className="mb-8">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <PortalImage
                    src={coverSrc}
                    alt={articleTitle}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover"
                  />
                </div>
                {article.caption ? (
                  <figcaption className="mt-2.5 text-[13px] leading-relaxed text-gray-500">
                    {isEnglish ? "Photo: " : "तस्बिर: "}
                    {article.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            <ArticleAdSlot
              ads={inArticleAds}
              path={articlePath}
              isEnglish={isEnglish}
              className="mb-8"
            />

            <ArticleBodyClient
              title={articleTitle}
              content={articleBody}
              shareUrl={shareUrl}
              isEnglish={isEnglish}
            />

            {relatedArticles.length > 0 ? (
              <section
                className="mt-12 border-t pt-8"
                style={{ borderColor: PORTAL.rule }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <h2
                    className="shrink-0 text-sm font-extrabold sm:text-base"
                    style={{ color: PORTAL.brand }}
                  >
                    {isEnglish ? "More in this category" : "यस श्रेणीका थप समाचार"}
                  </h2>
                  <div
                    className="h-px min-w-4 flex-1"
                    style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
                  />
                </div>

                <ul className="divide-y divide-gray-100">
                  {relatedArticles.map((rel) => {
                    const relTitle = resolveArticleTitle(rel, lang);
                    const thumb =
                      optimizeCloudinaryUrl(rel.coverImage || undefined, "thumbnail") ||
                      rel.coverImage;
                    return (
                      <li key={rel.id}>
                        <Link
                          href={`/article/${rel.slug}${langQuery}`}
                          className="group flex gap-4 py-4"
                        >
                          {thumb ? (
                            <div className="h-16 w-24 shrink-0 overflow-hidden bg-gray-100 sm:h-[4.5rem] sm:w-28">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumb}
                                alt={relTitle}
                                className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                              />
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <h3
                              className="text-sm font-bold leading-snug transition-colors group-hover:underline sm:text-[15px]"
                              style={{ color: PORTAL.ink }}
                            >
                              {relTitle}
                            </h3>
                            <span className="mt-1.5 block text-[12px] text-gray-400">
                              {formatTimeAgo(rel.createdAt, lang)}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <CommentsSection articleId={article.id} isEnglish={isEnglish} />
            </article>

            <div className="min-w-0 border-t pt-8 lg:border-t-0 lg:pt-0" style={{ borderColor: PORTAL.rule }}>
              <ArticleSidebar
                latest={latestArticles}
                trending={trendingArticles}
                lang={lang}
                langQuery={langQuery}
                path={articlePath}
                adsTop={sidebarAdsTop}
                adsBottom={sidebarAdsBottom}
              />
            </div>
          </div>
        </PortalContainer>
      </main>
    </>
  );
}
