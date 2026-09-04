import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, AdSlot } from "@prisma/client";
import { formatTimeAgoNp, getFormattedNepaliDate } from "@/lib/nepaliDate";
import { ArticleBodyClient } from "@/components/web/ArticleBodyClient";
import { CommentsSection } from "@/components/web/CommentsSection";
import { ArticleViewTracker } from "@/components/portal/ArticleViewTracker";
import { ArticleAdSlot } from "@/components/portal/ArticleAdSlot";
import { ArticleSidebar } from "@/components/portal/ArticleSidebar";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG, SITE_TITLE_SUFFIX, SITE_TITLE_SUFFIX_NP } from "@/constants/site";
import {
  articleMatchesLang,
  languageEditionWhere,
  resolveArticleContent,
  resolveArticleExcerpt,
  resolveArticleTitle,
  resolveCategoryName,
  resolveKeywords,
  resolveLanguageEdition,
  resolveMetaDescription,
  resolveMetaTitle,
} from "@/lib/language";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  return resolveLanguageEdition(searchParamsLang, host);
}

export async function generateMetadata({ params, searchParams }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!article) {
    return {
      title:
        lang === "en"
          ? `Article not found ${SITE_TITLE_SUFFIX}`
          : `समाचार भेटिएन ${SITE_TITLE_SUFFIX_NP}`,
    };
  }

  const title = resolveMetaTitle(article, lang);
  const description = resolveMetaDescription(article, lang) || SITE_CONFIG.domain;
  const image = article.ogImage || article.coverImage || "/favicon.ico";
  const suffix = lang === "en" ? SITE_TITLE_SUFFIX : SITE_TITLE_SUFFIX_NP;
  const keywords = resolveKeywords(article, lang);

  return {
    title: `${title} ${suffix}`,
    description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: {
      languages: {
        "ne-NP": absoluteUrl(`/article/${article.slug}`, "ne"),
        en: absoluteUrl(`/article/${article.slug}`, "en"),
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/article/${article.slug}`, lang),
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

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    return notFound();
  }

  if (!articleMatchesLang(article.languageEdition, lang)) {
    return notFound();
  }

  const [articleAds, relatedArticles, latestArticles, trendingArticles] = await Promise.all([
    prisma.ad.findMany({
      where: {
        isActive: true,
        slot: {
          in: [AdSlot.IN_ARTICLE, AdSlot.SIDEBAR_TOP, AdSlot.SIDEBAR_BOTTOM],
        },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        targetUrl: true,
        scriptCode: true,
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    }),
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
      orderBy: { createdAt: "desc" },
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
      orderBy: { createdAt: "desc" },
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

  const inArticleAds = articleAds.filter((a) => a.slot === AdSlot.IN_ARTICLE);
  const inArticleAdTop = inArticleAds[0] ?? null;
  const inArticleAdMid = inArticleAds[1] ?? null;
  const sidebarAdTop =
    articleAds.find((a) => a.slot === AdSlot.SIDEBAR_TOP) ?? null;
  const sidebarAdBottom =
    articleAds.find((a) => a.slot === AdSlot.SIDEBAR_BOTTOM) ?? null;
  const articlePath = `/article/${article.slug}`;

  const articleTitle = resolveArticleTitle(article, lang);
  const articleBody = resolveArticleContent(article, lang);
  const articleExcerpt = resolveArticleExcerpt(article, lang);
  const categoryName = resolveCategoryName(article.category, lang);
  const shareUrl = absoluteUrl(`/article/${article.slug}`, lang);
  const homeHref = isEnglish ? "/?lang=en" : "/";
  const coverSrc =
    optimizeCloudinaryUrl(article.coverImage || undefined, "hero") || article.coverImage;
  const authorName = article.author.name || (isEnglish ? "Editorial desk" : "सम्पादकीय टोली");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: articleTitle,
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    description: articleExcerpt || article.metaDescription || "",
  };

  return (
    <>
      <ArticleViewTracker articleId={article.id} path={`/article/${article.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                <time dateTime={article.createdAt.toISOString()}>
                  {getFormattedNepaliDate(article.createdAt)}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt={articleTitle}
                  className="aspect-[16/10] w-full object-cover bg-gray-100"
                />
                {article.caption ? (
                  <figcaption className="mt-2.5 text-[13px] leading-relaxed text-gray-500">
                    {isEnglish ? "Photo: " : "तस्बिर: "}
                    {article.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            <ArticleAdSlot
              ad={inArticleAdTop}
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

            <ArticleAdSlot
              ad={inArticleAdMid}
              path={articlePath}
              isEnglish={isEnglish}
              className="mt-8"
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
                                alt=""
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
                              {formatTimeAgoNp(rel.createdAt)}
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
                adTop={sidebarAdTop}
                adBottom={sidebarAdBottom}
              />
            </div>
          </div>
        </PortalContainer>
      </main>
    </>
  );
}
