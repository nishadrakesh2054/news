import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleType, Prisma } from "@prisma/client";
import {
  resolveLanguageEdition,
  resolveCategoryName,
  resolveCategoryDescription,
} from "@/lib/language";
import { SITE_CONFIG, SITE_TITLE_SUFFIX, SITE_TITLE_SUFFIX_NP } from "@/constants/site";
import { TrendingHashtags } from "@/components/portal/TrendingHashtags";
import { NewsCard } from "@/components/portal/NewsCard";
import { HomeSidebarTabs } from "@/components/portal/HomeSidebarTabs";
import { OpinionPollWidget } from "@/components/portal/OpinionPollWidget";
import { CategoryGridSection } from "@/components/portal/CategoryGridSection";
import { OpinionSection } from "@/components/portal/OpinionSection";
import { ProvinceNewsWidget } from "@/components/portal/ProvinceNewsWidget";
import { LatestNewsSection } from "@/components/portal/LatestNewsSection";
import { MediaShowcaseAboveFooter } from "@/components/portal/MediaShowcaseAboveFooter";
import { RashifalSection } from "@/components/portal/RashifalSection";
import { EpaperSection } from "@/components/portal/EpaperSection";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PORTAL } from "@/constants/portal";

interface WebHomeProps {
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ searchParams }: WebHomeProps): Promise<Metadata> {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, headerList.get("host"));
  const isEnglish = lang === "en";

  return {
    title: isEnglish ? `Home ${SITE_TITLE_SUFFIX}` : `गृहपृष्ठ ${SITE_TITLE_SUFFIX_NP}`,
    description: isEnglish
      ? SITE_CONFIG.description
      : "इको माञ्च — नेपालका ताजा समाचार, राजनीति, अर्थतन्त्र, खेलकुद र विचार।",
    alternates: {
      canonical: isEnglish ? "/?lang=en" : "/",
      languages: { "ne-NP": "/", en: "/?lang=en" },
    },
  };
}

const articleSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  excerpt: true,
  excerptNp: true,
  coverImage: true,
  isFeatured: true,
  views: true,
  province: true,
  district: true,
  createdAt: true,
  categoryId: true,
  category: {
    select: { id: true, name: true, nameNp: true, slug: true, description: true },
  },
  author: {
    select: { name: true, image: true },
  },
} satisfies Prisma.ArticleSelect;

export default async function WebHome({ searchParams }: WebHomeProps) {
  const params = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host");
  const lang = resolveLanguageEdition(params.lang, host);
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const whereClause: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    languageEdition: isEnglish
      ? { in: ["BOTH", "ENGLISH_ONLY"] }
      : { in: ["BOTH", "NEPALI_ONLY"] },
  };

  const [
    publishedArticles,
    categories,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
  ] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        select: articleSelect,
        orderBy: { publishedAt: "desc" },
        take: 24,
      }),
      prisma.category.findMany({
        orderBy: { order: "asc" },
        take: 6,
        select: {
          id: true,
          name: true,
          nameNp: true,
          slug: true,
          description: true,
          descriptionNp: true,
          articles: {
            where: whereClause,
            orderBy: { publishedAt: "desc" },
            take: 1,
            select: { coverImage: true },
          },
        },
      }),
      prisma.article.findMany({
        where: {
          ...whereClause,
          OR: [
            { category: { slug: { in: ["opinion", "vichar"] } } },
            { type: ArticleType.OPINION },
          ],
        },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          excerpt: true,
          excerptNp: true,
          createdAt: true,
          author: { select: { name: true, image: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.article.findMany({
        where: {
          ...whereClause,
          category: { slug: { in: ["economy", "arthatantra"] } },
        },
        select: articleSelect,
        orderBy: { publishedAt: "desc" },
        take: 4,
      }),
      prisma.article.findMany({
        where: {
          ...whereClause,
          category: { slug: { in: ["sports", "entertainment", "khelkud", "manoranjan"] } },
        },
        select: articleSelect,
        orderBy: { publishedAt: "desc" },
        take: 4,
      }),
      prisma.article.findMany({
        where: {
          ...whereClause,
          province: { not: null },
        },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          coverImage: true,
          province: true,
          district: true,
          createdAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 48,
      }),
    ]);

  const featured = publishedArticles.filter((a) => a.isFeatured);
  const mainStories = (
    featured.length >= 2
      ? featured
      : [...featured, ...publishedArticles.filter((a) => !a.isFeatured)]
  ).slice(0, 2);
  const mainIds = new Set(mainStories.map((a) => a.id));
  const rest = publishedArticles.filter((a) => !mainIds.has(a.id));
  const recentSidebar = rest.slice(0, 6);
  const popularSidebar = [...publishedArticles].sort((a, b) => b.views - a.views).slice(0, 6);
  const latestBelow = rest.slice(0, 6);

  const emptyLabel = isEnglish ? "No stories available yet." : "कुनै समाचार उपलब्ध छैन।";

  return (
    <main className="w-full bg-white text-gray-900">
      <Suspense fallback={<div className="h-10 border-b border-gray-200 bg-white" />}>
        <TrendingHashtags />
      </Suspense>

      {/* Hero: 2 main stories stacked (~70% / 9 cols) + sidebar (~30% / 3 cols) */}
      <PortalContainer className="py-4 sm:py-5">
        {mainStories.length === 0 ? (
          <div className="border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="flex flex-col gap-4 lg:col-span-9">
              {mainStories.map((art) => (
                <NewsCard
                  key={art.id}
                  article={art}
                  lang={lang}
                  variant="lead"
                  badge={isEnglish ? "Main News" : "मुख्य समाचार"}
                />
              ))}
            </div>

            <aside className="flex flex-col gap-4 lg:col-span-3">
              <HomeSidebarTabs recent={recentSidebar} popular={popularSidebar} lang={lang} />
              <Suspense fallback={null}>
                <OpinionPollWidget />
              </Suspense>
            </aside>
          </div>
        )}
      </PortalContainer>

      {/* News categories strip */}
      {categories.length > 0 ? (
        <section className="border-y border-gray-200 bg-white py-5">
          <PortalContainer>
            <div className="mb-4 flex items-center gap-2">
              <span
                className="px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white"
                style={{ backgroundColor: PORTAL.accent }}
              >
                {isEnglish ? "News Categories" : "समाचार श्रेणी"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => {
                const cover =
                  optimizeCloudinaryUrl(cat.articles[0]?.coverImage, "card") ||
                  cat.articles[0]?.coverImage;
                const name = resolveCategoryName(cat, lang);
                const description = resolveCategoryDescription(cat, lang);
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}${langQ}`}
                    className="group block space-y-2"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-200">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <h3 className="text-sm font-bold group-hover:underline" style={{ color: PORTAL.brand }}>
                      {name}
                    </h3>
                    {description ? (
                      <p className="line-clamp-2 text-[11px] leading-snug text-gray-500">{description}</p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </PortalContainer>
        </section>
      ) : null}

      {/* Latest news + sidebar ad */}
      {latestBelow.length > 0 ? (
        <PortalContainer className="py-6">
          <LatestNewsSection articles={latestBelow} lang={lang} />
        </PortalContainer>
      ) : null}

      {/* Province news tabs */}
      <PortalContainer className="py-6">
        <ProvinceNewsWidget articles={provinceArticles} lang={lang} />
      </PortalContainer>

      <PortalContainer className="py-6">
        <OpinionSection articles={opinionArticles} lang={lang} />
      </PortalContainer>

      <PortalContainer className="py-6">
        <CategoryGridSection
          title="Economy & Business"
          titleNp="अर्थतन्त्र"
          categorySlug="economy"
          articles={economyArticles}
          lang={lang}
        />
      </PortalContainer>

      <PortalContainer className="py-6">
        <CategoryGridSection
          title="Sports & Entertainment"
          titleNp="खेलकुद र मनोरञ्जन"
          categorySlug="sports"
          articles={sportsArticles}
          lang={lang}
        />
      </PortalContainer>

      <Suspense fallback={<div className="h-64 bg-white" />}>
        <MediaShowcaseAboveFooter />
      </Suspense>

      <Suspense fallback={<div className="h-56 bg-white" />}>
        <EpaperSection />
      </Suspense>

      <Suspense fallback={<div className="h-48" style={{ backgroundColor: "rgba(25, 87, 166, 0.06)" }} />}>
        <RashifalSection />
      </Suspense>
    </main>
  );
}
