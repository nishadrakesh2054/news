import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import {
  resolveLanguageEdition,
} from "@/lib/language";
import { SITE_CONFIG } from "@/constants/site";
import {
  editionAlternates,
  organizationJsonLd,
  requestHost,
  resolveSiteSeoDefaults,
  websiteJsonLd,
} from "@/lib/seo";
import { TrendingHashtags } from "@/components/portal/TrendingHashtags";
import { NewsCard } from "@/components/portal/NewsCard";
import { HomeSidebarTabs } from "@/components/portal/HomeSidebarTabs";
import { CategoryGridSection } from "@/components/portal/CategoryGridSection";
import { OpinionSection } from "@/components/portal/OpinionSection";
import { LatestNewsSection } from "@/components/portal/LatestNewsSection";
import { HomeSpotlightSection } from "@/components/portal/HomeSpotlightSection";
import { PortalContainer, SectionHeader } from "@/components/portal/SectionHeader";
import {
  getCachedActiveAds,
  getCachedEpapers,
  getCachedGalleriesHome,
  getCachedHomePayload,
  getCachedReels,
  getCachedTags,
} from "@/lib/public-cache";
import { adMatchesSurface } from "@/lib/ad-surfaces";

const OpinionPollWidget = dynamic(
  () =>
    import("@/components/portal/OpinionPollWidget").then((m) => m.OpinionPollWidget),
  { loading: () => null }
);

const AustraliaNewsSection = dynamic(
  () =>
    import("@/components/portal/AustraliaNewsSection").then(
      (m) => m.AustraliaNewsSection
    ),
  {
    loading: () => (
      <div className="h-48 animate-pulse bg-gray-50" aria-hidden />
    ),
  }
);

const ProvinceNewsWidget = dynamic(
  () =>
    import("@/components/portal/ProvinceNewsWidget").then(
      (m) => m.ProvinceNewsWidget
    ),
  {
    loading: () => (
      <div className="h-56 animate-pulse bg-gray-50" aria-hidden />
    ),
  }
);

const MediaShowcaseAboveFooter = dynamic(
  () =>
    import("@/components/portal/MediaShowcaseAboveFooter").then(
      (m) => m.MediaShowcaseAboveFooter
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-gray-50" aria-hidden />
    ),
  }
);

const EpaperSection = dynamic(
  () =>
    import("@/components/portal/EpaperSection").then((m) => m.EpaperSection),
  {
    loading: () => (
      <div className="h-40 animate-pulse bg-gray-50" aria-hidden />
    ),
  }
);

const RashifalSection = dynamic(
  () =>
    import("@/components/portal/RashifalSection").then((m) => m.RashifalSection),
  {
    loading: () => (
      <div
        className="h-48"
        style={{ backgroundColor: "rgba(25, 87, 166, 0.06)" }}
        aria-hidden
      />
    ),
  }
);

interface WebHomeProps {
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ searchParams }: WebHomeProps): Promise<Metadata> {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const seo = await resolveSiteSeoDefaults(lang);
  const title = seo.title;
  const ogImage = seo.ogImage || SITE_CONFIG.ogImagePath;
  const brand = isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp;

  return {
    title,
    description: seo.description,
    ...(seo.keywords
      ? { keywords: seo.keywords.split(",").map((k) => k.trim()).filter(Boolean) }
      : {}),
    alternates: editionAlternates("/", lang),
    openGraph: {
      title,
      description: seo.description,
      url: editionAlternates("/", lang).canonical as string,
      siteName: brand,
      locale: isEnglish ? "en_US" : "ne_NP",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seo.description,
      images: [ogImage],
    },
  };
}

export default async function WebHome({ searchParams }: WebHomeProps) {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, requestHost(headerList));
  const isEnglish = lang === "en";

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
    homeSpotlightArticles,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
    popularArticles,
    auStateArticles,
    auTerritoryArticles,
  } = home;

  const sidebarAdsTop = activeAds
    .filter((a) => a.slot === "SIDEBAR_TOP" && a.isActive !== false && adMatchesSurface(a, "home"))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const sidebarAdsBottom = activeAds
    .filter((a) => a.slot === "SIDEBAR_BOTTOM" && a.isActive !== false && adMatchesSurface(a, "home"))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const homeSpotlightAds = activeAds
    .filter((a) => a.slot === "HOME_SPOTLIGHT" && a.isActive !== false && adMatchesSurface(a, "home"))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const featured = publishedArticles.filter((a) => a.isFeatured);
  const mainStories = (
    featured.length >= 2
      ? featured
      : [...featured, ...publishedArticles.filter((a) => !a.isFeatured)]
  ).slice(0, 2);
  const mainIds = new Set(mainStories.map((a) => a.id));
  const rest = publishedArticles.filter((a) => !mainIds.has(a.id));
  const popularSidebar = popularArticles.slice(0, 5);
  const latestBelow = rest.slice(0, 6);

  // One LCP candidate: spotlight wins when present; otherwise first main story.
  const spotlightOwnsLcp = homeSpotlightArticles.length > 0;
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
        {isEnglish ? SITE_CONFIG.title : SITE_CONFIG.titleNp}
      </h1>

      <Suspense fallback={<div className="h-10 border-b border-gray-200 bg-white" />}>
        <TrendingHashtags tags={trendingTags} />
      </Suspense>

      {homeSpotlightArticles.length > 0 ? (
        <PortalContainer className="py-4 sm:py-5">
          <HomeSpotlightSection
            articles={homeSpotlightArticles}
            lang={lang}
            spotlightAds={homeSpotlightAds}
          />
        </PortalContainer>
      ) : null}

      {latestBelow.length > 0 ? (
        <PortalContainer className="py-4 sm:py-5">
          <LatestNewsSection
            articles={latestBelow}
            lang={lang}
            adsTop={sidebarAdsTop}
            adsBottom={sidebarAdsBottom}
          />
        </PortalContainer>
      ) : null}

      <PortalContainer className="py-6">
        {mainStories.length === 0 ? (
          <div className="border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          <>
            <SectionHeader
              title={isEnglish ? "Main News" : "मुख्य समाचार"}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
              <div className="flex flex-col gap-4 lg:col-span-9">
                {mainStories.map((art, index) => (
                  <NewsCard
                    key={art.id}
                    article={art}
                    lang={lang}
                    variant="lead"
                    priority={!spotlightOwnsLcp && index === 0}
                    badge={isEnglish ? "Main News" : "मुख्य समाचार"}
                  />
                ))}
              </div>

              <aside className="flex flex-col gap-4 lg:col-span-3">
                <HomeSidebarTabs popular={popularSidebar} lang={lang} />
                <Suspense fallback={null}>
                  <OpinionPollWidget />
                </Suspense>
              </aside>
            </div>
          </>
        )}
      </PortalContainer>

      {auStateArticles.length > 0 || auTerritoryArticles.length > 0 ? (
        <PortalContainer className="py-5">
          <AustraliaNewsSection
            stateArticles={auStateArticles}
            territoryArticles={auTerritoryArticles}
            lang={lang}
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
          titleNp="अर्थ–व्यापार"
          categorySlug="economy-business"
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

      <Suspense
        fallback={
          <div
            className="h-48"
            style={{ backgroundColor: "rgba(25, 87, 166, 0.06)" }}
          />
        }
      >
        <RashifalSection />
      </Suspense>
    </main>
  );
}
