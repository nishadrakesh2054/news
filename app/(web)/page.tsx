import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, AdSlot, ArticleType, Prisma } from "@prisma/client";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { Flame, Eye, Newspaper } from "lucide-react";
import { resolveLanguageEdition, resolveArticleTitle, resolveCategoryName } from "@/lib/language";
import { TrendingHashtags } from "@/components/portal/TrendingHashtags";
import { ProvinceNewsWidget } from "@/components/portal/ProvinceNewsWidget";
import { OpinionSection } from "@/components/portal/OpinionSection";
import { CategoryGridSection } from "@/components/portal/CategoryGridSection";
import { PhotoVideoFeature } from "@/components/portal/PhotoVideoFeature";
import { NepaliUtilityWidget } from "@/components/portal/NepaliUtilityWidget";
import { OpinionPollWidget } from "@/components/portal/OpinionPollWidget";

interface HomeArticleItem {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  createdAt: Date;
  views: number;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    nameNp?: string | null;
    slug: string;
  };
}

interface WebHomeProps {
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function WebHome({ searchParams }: WebHomeProps) {
  const params = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host");

  const lang = resolveLanguageEdition(params.lang, host);
  const isEnglish = lang === "en";

  // Filter articles for current edition (BOTH or matching edition)
  const whereClause: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    languageEdition: isEnglish
      ? { in: ["BOTH", "ENGLISH_ONLY"] }
      : { in: ["BOTH", "NEPALI_ONLY"] },
  };

  // Parallel query execution for ultra-fast response times
  const [
    publishedArticles,
    opinionArticles,
    economyArticles,
    sportsArticles,
    photoFeatureArticles,
    activeAds,
  ] = await Promise.all([
    // 1. General Published Stream
    prisma.article.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        isFeatured: true,
        views: true,
        province: true,
        district: true,
        createdAt: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, nameNp: true, slug: true },
        },
        author: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    // 2. Opinion Articles ("opinion" category or OPINION type)
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
        createdAt: true,
        author: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    // 3. Economy Articles ("economy" or "arthatantra" category)
    prisma.article.findMany({
      where: {
        ...whereClause,
        category: { slug: { in: ["economy", "arthatantra"] } },
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        author: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    // 4. Sports & Entertainment Articles
    prisma.article.findMany({
      where: {
        ...whereClause,
        category: { slug: { in: ["sports", "entertainment", "khelkud", "manoranjan"] } },
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        author: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    // 5. Multimedia Photo Features
    prisma.article.findMany({
      where: {
        ...whereClause,
        coverImage: { not: null },
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        coverImage: true,
        createdAt: true,
        category: {
          select: { nameNp: true, name: true },
        },
      },
      orderBy: { views: "desc" },
      take: 4,
    }),
    // 6. Ads
    prisma.ad.findMany({
      where: { isActive: true },
      select: { id: true, title: true, slot: true, imageUrl: true, targetUrl: true },
    }),
  ]);

  const sidebarAd = activeAds.find((a: { slot: string }) => a.slot === AdSlot.SIDEBAR_TOP);

  // Partition articles into Lead Story, Sub-featured, and Latest Stream
  const leadStory = (publishedArticles as HomeArticleItem[]).find((a) => a.isFeatured) || (publishedArticles as HomeArticleItem[])[0];
  const secondaryFeatured = (publishedArticles as HomeArticleItem[]).filter((a) => a.id !== leadStory?.id).slice(0, 4);
  const latestList = (publishedArticles as HomeArticleItem[]).filter((a) => a.id !== leadStory?.id).slice(4, 12);
  const trendingList = [...(publishedArticles as HomeArticleItem[])].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <main className="w-full bg-background pb-16">
      {/* TRENDING HASHTAGS BAR */}
      <TrendingHashtags />

      {/* 1. HERO LEAD NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-6 pb-8 border-b border-border/40">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-2">
            <span className="h-3.5 w-3.5 rounded-full bg-rose-600 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-serif">
              {isEnglish ? "Lead Stories" : "मुख्य समाचार (Lead Stories)"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Large Feature Card (Left 2 Columns) */}
          {leadStory ? (
            <Link
              href={`/article/${leadStory.slug}${isEnglish ? "?lang=en" : ""}`}
              className="lg:col-span-2 group relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm flex flex-col justify-end min-h-[380px] sm:min-h-[440px]"
            >
              {leadStory.coverImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={leadStory.coverImage}
                  alt={leadStory.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-800" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-[#027081] text-white text-xs font-bold px-3 py-1 rounded-md">
                    {resolveCategoryName(leadStory.category, lang)}
                  </span>
                  <span className="text-white/70 text-xs font-mono">
                    {formatTimeAgoNp(leadStory.createdAt)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight group-hover:text-amber-300 transition-colors font-serif">
                  {resolveArticleTitle(leadStory, lang)}
                </h1>

                {leadStory.excerpt && (
                  <p className="text-sm text-white/80 line-clamp-2 leading-relaxed max-w-3xl">
                    {leadStory.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ) : (
            <div className="lg:col-span-2 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              कुनै समाचार उपलब्ध छैन।
            </div>
          )}

          {/* 4 Side Secondary Featured Cards (Right 1 Column) */}
          <div className="grid grid-cols-1 gap-4">
            {secondaryFeatured.map((art: HomeArticleItem) => (
              <Link
                key={art.id}
                href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
                className="group flex space-x-3.5 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-colors"
              >
                {art.coverImage && (
                  <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] font-bold text-[#027081]">
                    {resolveCategoryName(art.category, lang)}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-[#027081] transition-colors leading-snug font-serif">
                    {resolveArticleTitle(art, lang)}
                  </h3>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {formatTimeAgoNp(art.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. OPINION & COLUMNISTS SHOWCASE (Setopati / Ratopati Parity) */}
      <div className="max-w-7xl mx-auto px-4">
        <OpinionSection articles={opinionArticles} lang={lang} />
      </div>

      {/* 3. LATEST NEWS STREAM & TRENDING SIDEBAR */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Stream: Latest Headlines (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2 font-serif">
                <Newspaper className="h-5 w-5 text-[#027081]" />
                <span>{isEnglish ? "Latest Headlines" : "ताजा तथा भर्खरका समाचार"}</span>
              </h3>
            </div>

            <div className="space-y-4">
              {latestList.map((art: HomeArticleItem) => (
                <article
                  key={art.id}
                  className="group flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-colors"
                >
                  {art.coverImage && (
                    <div className="h-44 sm:h-32 sm:w-44 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-[11px] font-bold">
                        <span className="text-[#027081]">
                          {resolveCategoryName(art.category, lang)}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground font-mono">
                          {formatTimeAgoNp(art.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif">
                        <Link href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}>
                          {resolveArticleTitle(art, lang)}
                        </Link>
                      </h3>
                      {art.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>द्वारा: {"सम्पादकीय टोली"}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-[#027081]" />
                        <span>{art.views}</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Trending & Monetization Banner */}
          <div className="space-y-8">
            {/* Sidebar Ad Placement */}
            {sidebarAd && sidebarAd.imageUrl ? (
              <a
                href={sidebarAd.targetUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-full h-[250px] rounded-xl border border-border overflow-hidden block relative shadow-2xs group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sidebarAd.imageUrl}
                  alt={sidebarAd.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
                />
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  विज्ञापन
                </span>
              </a>
            ) : (
              <div className="w-full h-[250px] rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground font-medium">
                विज्ञापन स्थान (Sidebar Ad - 300x250)
              </div>
            )}

            {/* Trending News Block */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h4 className="text-base font-extrabold text-foreground flex items-center gap-2 font-serif">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>{isEnglish ? "Trending Stories" : "सर्वाधिक पढिएका समाचार"}</span>
                </h4>
              </div>

              <div className="space-y-3.5">
                {trendingList.map((art: HomeArticleItem, index: number) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
                    className="group flex items-start space-x-3 pb-3 border-b border-border/30 last:border-0 last:pb-0"
                  >
                    <span className="text-xl font-extrabold text-[#027081]/40 group-hover:text-[#027081] transition-colors font-mono shrink-0 w-5">
                      ०{index + 1}
                    </span>
                    <div className="space-y-1">
                      <h5 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug line-clamp-2 font-serif">
                        {resolveArticleTitle(art, lang)}
                      </h5>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {art.views} पटक पढिएको
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Public Opinion Poll Widget (जनमत / पोल) */}
            <OpinionPollWidget />

            {/* Nepali Utility Notice Board Widget (सूचनापाटी) */}
            <NepaliUtilityWidget />
          </div>
        </div>
      </section>

      {/* 4. PROVINCE NEWS MAP & WIDGET (७ वटा प्रदेश समाचार) */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ProvinceNewsWidget articles={publishedArticles as any} />
      </section>

      {/* 5. ECONOMY & BUSINESS SECTION (अर्थतन्त्र / सेयर बजार) */}
      <div className="max-w-7xl mx-auto px-4">
        <CategoryGridSection
          title="Economy & Business"
          titleNp="अर्थतन्त्र र सेयर बजार (Economy)"
          categorySlug="economy"
          articles={economyArticles}
          lang={lang}
        />
      </div>

      {/* 6. SPORTS & ENTERTAINMENT SECTION (खेलकुद र मनोरञ्जन) */}
      <div className="max-w-7xl mx-auto px-4">
        <CategoryGridSection
          title="Sports & Entertainment"
          titleNp="खेलकुद र मनोरञ्जन (Sports & Lifestyle)"
          categorySlug="sports"
          articles={sportsArticles}
          lang={lang}
        />
      </div>

      {/* 7. MULTIMEDIA PHOTO & VIDEO FEATURE (फोटो फिचर र भिडियो) */}
      <div className="max-w-7xl mx-auto px-4">
        <PhotoVideoFeature articles={photoFeatureArticles} lang={lang} />
      </div>
    </main>
  );
}
