import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import {
  resolveLanguageEdition,
  resolveCategoryName,
  resolveCategoryDescription,
} from "@/lib/language";
import { SITE_CONFIG } from "@/constants/site";
import {
  defaultDescription,
  editionAlternates,
  organizationJsonLd,
  pageTitle,
  requestHost,
  websiteJsonLd,
} from "@/lib/seo";
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
import {
  getCachedActiveAds,
  getCachedEpapers,
  getCachedGalleriesHome,
  getCachedHomePayload,
  getCachedReels,
  getCachedTags,
} from "@/lib/public-cache";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PORTAL } from "@/constants/portal";

interface WebHomeProps {
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ searchParams }: WebHomeProps): Promise<Metadata> {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const description = defaultDescription(lang);

  return {
    title: pageTitle(isEnglish ? "Home" : "गृहपृष्ठ", lang),
    description,
    alternates: editionAlternates("/", lang),
    openGraph: {
      title: pageTitle(isEnglish ? "Home" : "गृहपृष्ठ", lang),
      description,
      url: editionAlternates("/", lang).canonical as string,
      siteName: SITE_CONFIG.name,
      locale: isEnglish ? "en_US" : "ne_NP",
      type: "website",
    },
  };
}

export default async function WebHome({ searchParams }: WebHomeProps) {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const [
    home,
    trendingTags,
    epapers,
    galleriesHome,
    reels,
    activeAds,
  ] = await Promise.all([
    getCachedHomePayload(lang),
    getCachedTags(),
    getCachedEpapers(),
    getCachedGalleriesHome(),
    getCachedReels(),
    getCachedActiveAds(),
  ]);

  const {
    publishedArticles,
    categories,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
    popularArticles,
  } = home;

  const sidebarAdsTop = activeAds
    .filter((a) => a.slot === "SIDEBAR_TOP" && a.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const sidebarAdsBottom = activeAds
    .filter((a) => a.slot === "SIDEBAR_BOTTOM" && a.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const featured = publishedArticles.filter((a) => a.isFeatured);
  const mainStories = (
    featured.length >= 2
      ? featured
      : [...featured, ...publishedArticles.filter((a) => !a.isFeatured)]
  ).slice(0, 2);
  const mainIds = new Set(mainStories.map((a) => a.id));
  const rest = publishedArticles.filter((a) => !mainIds.has(a.id));
  const recentSidebar = rest.slice(0, 5);
  const popularSidebar = popularArticles.slice(0, 5);
  const latestBelow = rest.slice(0, 6);

  const emptyLabel = isEnglish ? "No stories available yet." : "कुनै समाचार उपलब्ध छैन।";

  return (
    <main className="w-full bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(lang)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(lang)) }}
      />

      <h1 className="sr-only">
        {isEnglish
          ? `${SITE_CONFIG.name} — Latest news from Nepal`
          : `${SITE_CONFIG.nameNp} — नेपालका ताजा समाचार`}
      </h1>

      <Suspense fallback={<div className="h-10 border-b border-gray-200 bg-white" />}>
        <TrendingHashtags tags={trendingTags} />
      </Suspense>

      <PortalContainer className="py-4 sm:py-5">
        {mainStories.length === 0 ? (
          <div className="border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="flex flex-col gap-4 lg:col-span-9">
              {mainStories.map((art, index) => (
                <NewsCard
                  key={art.id}
                  article={art}
                  lang={lang}
                  variant="lead"
                  priority={index === 0}
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
                        <img src={cover} alt={name} className="h-full w-full object-cover" />
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

      {latestBelow.length > 0 ? (
        <PortalContainer className="py-6">
          <LatestNewsSection
            articles={latestBelow}
            lang={lang}
            adsTop={sidebarAdsTop}
            adsBottom={sidebarAdsBottom}
          />
        </PortalContainer>
      ) : null}

      <PortalContainer className="py-6">
        <ProvinceNewsWidget articles={provinceArticles} lang={lang} />
      </PortalContainer>

      <PortalContainer className="py-6">
        <OpinionSection articles={opinionArticles} lang={lang} />
      </PortalContainer>

      <PortalContainer className="space-y-6 py-4 sm:py-5">
        <CategoryGridSection
          title="Economy & Business"
          titleNp="अर्थतन्त्र"
          categorySlug="economy"
          articles={economyArticles}
          lang={lang}
        />
        <CategoryGridSection
          title="Sports & Entertainment"
          titleNp="खेलकुद र मनोरञ्जन"
          categorySlug="sports"
          articles={sportsArticles}
          lang={lang}
        />
      </PortalContainer>

      <MediaShowcaseAboveFooter
        lang={lang}
        galleries={galleriesHome.map((g) => ({
          id: g.id,
          title: g.title,
          titleNp: g.titleNp,
          slug: g.slug,
          description: g.description,
          coverUrl: g.coverUrl,
          createdAt: g.createdAt,
          itemCount: g._count.items,
        }))}
        videos={reels}
      />

      <EpaperSection editions={epapers} />

      <Suspense fallback={<div className="h-48" style={{ backgroundColor: "rgba(25, 87, 166, 0.06)" }} />}>
        <RashifalSection />
      </Suspense>
    </main>
  );
}
