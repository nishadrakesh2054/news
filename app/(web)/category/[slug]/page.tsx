import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@prisma/client";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";
import {
  resolveArticleTitle,
  resolveCategoryDescription,
  resolveCategoryName,
  resolveLanguageEdition,
} from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { NewsCard } from "@/components/portal/NewsCard";
import { PortalPagination } from "@/components/portal/PortalPagination";
import {
  CATEGORY_PAGE_SIZE,
  getCachedActiveAds,
  getCachedCategoryArchive,
} from "@/lib/public-cache";
import { ArticleAdSlot } from "@/components/portal/ArticleAdSlot";
import { PORTAL } from "@/constants/portal";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { adMatchesSurface } from "@/lib/ad-surfaces";
import { safeJsonLd } from "@/lib/json-ld";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; page?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  return resolveLanguageEdition(searchParamsLang, requestHost(headerList));
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      nameNp: true,
      description: true,
      descriptionNp: true,
      slug: true,
      isActive: true,
    },
  });

  if (!category) {
    return {
      title: pageTitle(lang === "en" ? "Category not found" : "श्रेणी भेटिएन", lang),
    };
  }

  const name = resolveCategoryName(category, lang);
  const headline =
    page > 1
      ? lang === "en"
        ? `${name} news — page ${page}`
        : `${name} समाचार — पृष्ठ ${page}`
      : lang === "en"
        ? `${name} news`
        : `${name} समाचार`;
  const description =
    resolveCategoryDescription(category, lang) ||
    (lang === "en"
      ? `${name} news and updates | ${SITE_CONFIG.name}`
      : `${name} श्रेणीका सबै समाचार | ${SITE_CONFIG.nameNp}`);

  const shouldNoIndex = page > 1 || category.isActive === false;

  return {
    title: pageTitle(headline, lang),
    description,
    alternates: editionAlternates(`/category/${category.slug}`, lang),
    openGraph: {
      title: pageTitle(headline, lang),
      description,
      url: absoluteUrl(`/category/${category.slug}`, lang),
      type: "website",
      images: [{ url: SITE_CONFIG.ogImagePath, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle(headline, lang),
      description,
      images: [SITE_CONFIG.ogImagePath],
    },
    ...(shouldNoIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export const revalidate = 60;

export default async function CategoryArchivePage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const isEnglish = lang === "en";
  const langQuery = isEnglish ? "?lang=en" : "";
  const homeHref = isEnglish ? "/?lang=en" : "/";
  const requestedPage = Math.max(1, parseInt(query.page || "1", 10) || 1);

  const [archive, allAds] = await Promise.all([
    getCachedCategoryArchive(slug, lang, requestedPage),
    getCachedActiveAds(),
  ]);

  if (!archive) {
    notFound();
  }

  const { category, articles, popular, pagination } = archive;
  const categoryName = resolveCategoryName(category, lang);
  const categoryDescription = resolveCategoryDescription(category, lang);
  const currentPage = pagination.page;

  const lead =
    currentPage === 1
      ? articles.find((a) => a.isFeatured) || articles[0] || null
      : null;
  const listArticles =
    lead != null ? articles.filter((a) => a.id !== lead.id) : articles;

  const sidebarAds = allAds.filter(
    (a) =>
      (a.slot === AdSlot.SIDEBAR_TOP || a.slot === AdSlot.SIDEBAR_BOTTOM) &&
      adMatchesSurface(a, "category")
  );
  const adsTop = sidebarAds.filter((a) => a.slot === AdSlot.SIDEBAR_TOP);
  const adsBottom = sidebarAds.filter((a) => a.slot === AdSlot.SIDEBAR_BOTTOM);
  const pagePath = `/category/${category.slug}`;

  const buildPageHref = (page: number) => {
    const qs = new URLSearchParams();
    if (isEnglish) qs.set("lang", "en");
    if (page > 1) qs.set("page", String(page));
    const s = qs.toString();
    return s ? `${pagePath}?${s}` : pagePath;
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEnglish ? "Home" : "गृहपृष्ठ",
        item: absoluteUrl("/", lang),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: absoluteUrl(`/category/${category.slug}`, lang),
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isEnglish ? `${categoryName} news` : `${categoryName} समाचार`,
    description:
      categoryDescription ||
      (isEnglish
        ? `${categoryName} news and updates | ${SITE_CONFIG.name}`
        : `${categoryName} श्रेणीका सबै समाचार | ${SITE_CONFIG.nameNp}`),
    url: absoluteUrl(`/category/${category.slug}`, lang),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: absoluteUrl("/", lang),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
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
            <span className="font-medium" style={{ color: PORTAL.ink }}>
              {categoryName}
            </span>
            {currentPage > 1 ? (
              <>
                <span aria-hidden className="text-gray-300">
                  /
                </span>
                <span className="text-gray-500">
                  {isEnglish ? `Page ${currentPage}` : `पृष्ठ ${currentPage}`}
                </span>
              </>
            ) : null}
          </nav>

          <header className="mb-8 max-w-3xl">
            <h1
              className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={{ color: PORTAL.brand }}
            >
              {categoryName}
            </h1>
            {categoryDescription ? (
              <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                {categoryDescription}
              </p>
            ) : null}
            {pagination.total > 0 ? (
              <p className="mt-2 text-xs text-gray-500">
                {pagination.total.toLocaleString()}{" "}
                {isEnglish
                  ? pagination.total === 1
                    ? "story"
                    : "stories"
                  : "समाचार"}
                {pagination.totalPages > 1
                  ? isEnglish
                    ? ` · page ${currentPage} of ${pagination.totalPages}`
                    : ` · पृष्ठ ${currentPage} / ${pagination.totalPages}`
                  : ""}
              </p>
            ) : null}
          </header>

          {lead ? (
            <section className="mb-10">
              <NewsCard article={lead} lang={lang} variant="lead" badge={categoryName} />
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-12">
            <section className="min-w-0">
              <div className="mb-4 flex items-center gap-3">
                <h2
                  className="shrink-0 text-sm font-extrabold sm:text-base"
                  style={{ color: PORTAL.brand }}
                >
                  {isEnglish ? "Latest" : "ताजा समाचार"}
                </h2>
                <div
                  className="h-px min-w-4 flex-1"
                  style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
                />
              </div>

              {listArticles.length > 0 ? (
                <div>
                  {listArticles.map((art) => (
                    <NewsCard
                      key={art.id}
                      article={art}
                      lang={lang}
                      variant="list"
                      showAuthor
                      showExcerpt
                    />
                  ))}
                </div>
              ) : !lead ? (
                <p className="border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
                  {isEnglish
                    ? "No published articles in this category yet."
                    : "यस श्रेणीमा हाल कुनै प्रकाशित समाचार उपलब्ध छैन।"}
                </p>
              ) : (
                <p className="py-6 text-sm text-gray-500">
                  {isEnglish
                    ? "More stories will appear here soon."
                    : "थप समाचार चाँडै यहाँ आउनेछन्।"}
                </p>
              )}

              <PortalPagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                buildHref={buildPageHref}
                isEnglish={isEnglish}
                totalItems={pagination.total}
                pageSize={CATEGORY_PAGE_SIZE}
              />
            </section>

            <aside
              className="min-w-0 space-y-8 border-t pt-8 lg:sticky lg:top-24 lg:self-start lg:border-t-0 lg:pt-0"
              style={{ borderColor: PORTAL.rule }}
            >
              <ArticleAdSlot
                ads={adsTop}
                path={pagePath}
                isEnglish={isEnglish}
                variant="sidebar"
              />

              {popular.length > 0 ? (
                <section>
                  <div className="mb-2 flex items-center gap-2">
                    <h2
                      className="shrink-0 text-sm font-extrabold"
                      style={{ color: PORTAL.brand }}
                    >
                      {isEnglish ? "Popular" : "पढिएको"}
                    </h2>
                    <div
                      className="h-px min-w-4 flex-1"
                      style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
                    />
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {popular.map((art, index) => {
                      const title = resolveArticleTitle(art, lang);
                      return (
                        <li key={art.id}>
                          <Link
                            href={`/article/${art.slug}${langQuery}`}
                            className="group flex gap-3 py-3"
                          >
                            <span
                              className="w-5 shrink-0 pt-0.5 text-sm font-extrabold tabular-nums"
                              style={{
                                color: index < 3 ? PORTAL.accent : PORTAL.muted,
                              }}
                            >
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3
                                className="line-clamp-3 text-[13px] font-bold leading-snug group-hover:underline"
                                style={{ color: PORTAL.ink }}
                              >
                                {title}
                              </h3>
                              <span className="mt-1 block text-[11px] text-gray-400">
                                {art.views?.toLocaleString() || 0}{" "}
                                {isEnglish ? "views" : "पढिएको"}
                                {" · "}
                                {formatTimeAgo(art.createdAt, lang)}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              <ArticleAdSlot
                ads={adsBottom}
                path={pagePath}
                isEnglish={isEnglish}
                variant="sidebar"
              />
            </aside>
          </div>
        </PortalContainer>
      </main>
    </>
  );
}
