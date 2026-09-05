import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdSlot, ArticleStatus } from "@prisma/client";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";
import {
  languageEditionWhere,
  resolveArticleTitle,
  resolveLanguageEdition,
} from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { NewsCard } from "@/components/portal/NewsCard";
import { ArticleAdSlot } from "@/components/portal/ArticleAdSlot";
import { PORTAL } from "@/constants/portal";
import { formatTimeAgo } from "@/lib/nepaliDate";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  return resolveLanguageEdition(searchParamsLang, requestHost(headerList));
}

export async function generateMetadata({ params, searchParams }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const tag = await prisma.tag.findUnique({ where: { slug } });
  const label =
    lang === "en"
      ? tag?.name || slug
      : tag?.nameNp || tag?.name || slug;
  const headline = `#${label}`;
  const description =
    lang === "en"
      ? `News tagged ${label} | ${SITE_CONFIG.name}`
      : `${label} ट्यागका समाचार | ${SITE_CONFIG.nameNp}`;

  return {
    title: pageTitle(headline, lang),
    description,
    alternates: editionAlternates(`/tag/${slug}`, lang),
    openGraph: {
      title: pageTitle(headline, lang),
      description,
      url: absoluteUrl(`/tag/${slug}`, lang),
      type: "website",
    },
  };
}

export const revalidate = 60;

export default async function TagArchivePage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const isEnglish = lang === "en";
  const langQuery = isEnglish ? "?lang=en" : "";
  const homeHref = isEnglish ? "/?lang=en" : "/";

  const [tag, sidebarAds, otherTags] = await Promise.all([
    prisma.tag.findUnique({
      where: { slug },
      select: { id: true, name: true, nameNp: true, slug: true },
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
        isActive: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.tag.findMany({
      where: { slug: { not: slug } },
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        _count: { select: { articles: true } },
      },
      orderBy: { name: "asc" },
      take: 12,
    }),
  ]);

  const tagLabel = tag
    ? isEnglish
      ? tag.name || tag.nameNp || slug.replace(/-/g, " ")
      : tag.nameNp || tag.name || slug.replace(/-/g, " ")
    : slug.replace(/-/g, " ");

  const articles = tag
    ? await prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          tags: { some: { id: tag.id } },
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
          category: { select: { name: true, nameNp: true, slug: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 36,
      })
    : await prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          ...languageEditionWhere(lang),
          OR: [
            { keywords: { contains: slug, mode: "insensitive" } },
            { keywordsNp: { contains: slug, mode: "insensitive" } },
            { title: { contains: slug, mode: "insensitive" } },
            { titleNp: { contains: slug, mode: "insensitive" } },
          ],
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
          category: { select: { name: true, nameNp: true, slug: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 36,
      });

  const lead = articles.find((a) => a.isFeatured) || articles[0] || null;
  const rest = articles.filter((a) => a.id !== lead?.id);
  const popular = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6);
  const adsTop = sidebarAds.filter((a) => a.slot === AdSlot.SIDEBAR_TOP);
  const adsBottom = sidebarAds.filter((a) => a.slot === AdSlot.SIDEBAR_BOTTOM);
  const pagePath = `/tag/${slug}`;

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
          <span className="text-gray-400">{isEnglish ? "Tag" : "ट्याग"}</span>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            #{tagLabel}
          </span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <h1
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ color: PORTAL.brand }}
          >
            #{tagLabel}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEnglish
              ? `Stories related to ${tagLabel}`
              : `${tagLabel} सँग सम्बन्धित समाचार`}
          </p>
        </header>

        {lead ? (
          <section className="mb-10">
            <NewsCard article={lead} lang={lang} variant="lead" badge={`#${tagLabel}`} />
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
                  ? "No published articles for this tag yet."
                  : "यस ट्यागमा हाल कुनै प्रकाशित समाचार उपलब्ध छैन।"}
              </p>
            ) : (
              <p className="py-6 text-sm text-gray-500">
                {isEnglish
                  ? "More stories will appear here soon."
                  : "थप समाचार चाँडै यहाँ आउनेछन्।"}
              </p>
            )}
          </section>

          <aside
            className="min-w-0 space-y-8 border-t pt-8 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0 lg:self-start"
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
                  {popular.map((art, index) => (
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
                            {resolveArticleTitle(art, lang)}
                          </h3>
                          <span className="mt-1 block text-[11px] text-gray-400">
                            {formatTimeAgo(art.createdAt, lang)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {otherTags.length > 0 ? (
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <h2
                    className="shrink-0 text-sm font-extrabold"
                    style={{ color: PORTAL.brand }}
                  >
                    {isEnglish ? "Other tags" : "अन्य ट्याग"}
                  </h2>
                  <div
                    className="h-px min-w-4 flex-1"
                    style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
                  />
                </div>
                <div className="flex flex-wrap gap-x-1 gap-y-1">
                  {otherTags.map((t) => {
                    const label = isEnglish ? t.name || t.nameNp : t.nameNp || t.name;
                    return (
                      <Link
                        key={t.id}
                        href={`/tag/${t.slug}${langQuery}`}
                        className="px-2 py-1 text-[13px] font-medium transition-colors hover:underline"
                        style={{ color: PORTAL.brand }}
                      >
                        #{label}
                      </Link>
                    );
                  })}
                </div>
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
  );
}
