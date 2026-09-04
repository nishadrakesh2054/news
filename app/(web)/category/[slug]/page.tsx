import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdSlot, ArticleStatus } from "@prisma/client";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";
import {
  languageEditionWhere,
  resolveArticleTitle,
  resolveCategoryDescription,
  resolveCategoryName,
  resolveLanguageEdition,
} from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { NewsCard } from "@/components/portal/NewsCard";
import { ArticleAdSlot } from "@/components/portal/ArticleAdSlot";
import { PORTAL } from "@/constants/portal";
import { formatTimeAgoNp } from "@/lib/nepaliDate";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  return resolveLanguageEdition(searchParamsLang, requestHost(headerList));
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return {
      title: pageTitle(lang === "en" ? "Category not found" : "श्रेणी भेटिएन", lang),
    };
  }

  const name = resolveCategoryName(category, lang);
  const headline = lang === "en" ? `${name} news` : `${name} समाचार`;
  const description =
    resolveCategoryDescription(category, lang) ||
    (lang === "en"
      ? `${name} news and updates | ${SITE_CONFIG.name}`
      : `${name} श्रेणीका सबै समाचार | ${SITE_CONFIG.nameNp}`);

  return {
    title: pageTitle(headline, lang),
    description,
    alternates: editionAlternates(`/category/${category.slug}`, lang),
    openGraph: {
      title: pageTitle(headline, lang),
      description,
      url: absoluteUrl(`/category/${category.slug}`, lang),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle(headline, lang),
      description,
    },
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

  const [category, sidebarAds] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        description: true,
        descriptionNp: true,
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
            ...languageEditionWhere(lang),
          },
          select: {
            id: true,
            title: true,
            titleNp: true,
            slug: true,
            excerpt: true,
            excerptNp: true,
            coverImage: true,
            createdAt: true,
            views: true,
            isFeatured: true,
            author: { select: { name: true } },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 36,
        },
      },
    }),
    prisma.ad.findMany({
      where: {
        isActive: true,
        slot: { in: [AdSlot.SIDEBAR_TOP, AdSlot.SIDEBAR_BOTTOM] },
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
  ]);

  if (!category) {
    notFound();
  }

  const categoryName = resolveCategoryName(category, lang);
  const categoryDescription = resolveCategoryDescription(category, lang);
  const articles = category.articles;
  const lead =
    articles.find((a) => a.isFeatured) || articles[0] || null;
  const rest = articles.filter((a) => a.id !== lead?.id);
  const popular = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6);
  const adTop = sidebarAds.find((a) => a.slot === AdSlot.SIDEBAR_TOP) ?? null;
  const adBottom = sidebarAds.find((a) => a.slot === AdSlot.SIDEBAR_BOTTOM) ?? null;
  const pagePath = `/category/${category.slug}`;

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
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

              {rest.length > 0 ? (
                <div>
                  {rest.map((art) => (
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
            </section>

            <aside className="min-w-0 space-y-8 border-t pt-8 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0 lg:self-start" style={{ borderColor: PORTAL.rule }}>
              <ArticleAdSlot
                ad={adTop}
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
                                {formatTimeAgoNp(art.createdAt)}
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
                ad={adBottom}
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
