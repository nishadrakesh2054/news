import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, AdSlot, ArticleType, Prisma } from "@prisma/client";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { Flame, Eye, Newspaper, Star, TrendingUp } from "lucide-react";
import { resolveLanguageEdition, resolveArticleTitle, resolveCategoryName } from "@/lib/language";
import { TrendingHashtags } from "@/components/portal/TrendingHashtags";
import { ProvinceNewsWidget } from "@/components/portal/ProvinceNewsWidget";
import { OpinionSection } from "@/components/portal/OpinionSection";
import { CategoryGridSection } from "@/components/portal/CategoryGridSection";
import { PhotoVideoFeature } from "@/components/portal/PhotoVideoFeature";
import { NepaliUtilityWidget } from "@/components/portal/NepaliUtilityWidget";
import { OpinionPollWidget } from "@/components/portal/OpinionPollWidget";
import { AdUnit } from "@/components/portal/AdUnit";
import { getCachedActiveAds } from "@/lib/public-cache";

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
      orderBy: { publishedAt: "desc" },
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
      orderBy: { publishedAt: "desc" },
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
      orderBy: { publishedAt: "desc" },
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
      orderBy: { publishedAt: "desc" },
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
    // 6. Ads (cached)
    getCachedActiveAds(),
  ]);

  const sidebarAd = activeAds.find((a: { slot: string }) => a.slot === AdSlot.SIDEBAR_TOP);

  // Partition articles into Lead Story, Sub-featured, and Latest Stream
  const leadStory = (publishedArticles as HomeArticleItem[]).find((a) => a.isFeatured) || (publishedArticles as HomeArticleItem[])[0];
  const secondaryFeatured = (publishedArticles as HomeArticleItem[]).filter((a) => a.id !== leadStory?.id).slice(0, 4);
  const latestList = (publishedArticles as HomeArticleItem[]).filter((a) => a.id !== leadStory?.id).slice(4, 12);
  const trendingList = [...(publishedArticles as HomeArticleItem[])].sort((a, b) => b.views - a.views).slice(0, 5);
  const topStories = secondaryFeatured.slice(0, 4);
  const editorPick = (publishedArticles as HomeArticleItem[]).filter((a) => a.id !== leadStory?.id).slice(0, 3);
  const mostRead = [...(publishedArticles as HomeArticleItem[])].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <main className="w-full bg-background pb-16">
      {/* TRENDING HASHTAGS BAR */}
      <TrendingHashtags />

      {/* Top Editorial Highlights */}
      <section className="max-w-[1480px] mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border-t-2 border-amber-500 pt-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 font-serif uppercase tracking-wider">
                <Star className="h-4 w-4 text-amber-500" />
                <span>{isEnglish ? "Top Stories" : "शीर्ष समाचार"}</span>
              </h3>
            </div>

            <div className="mt-3 space-y-3">
              {topStories.map((art: HomeArticleItem) => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
                  className="group block border-b border-border/50 pb-2.5 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#027081]">
                      {resolveCategoryName(art.category, lang)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTimeAgoNp(art.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                    {resolveArticleTitle(art, lang)}
                  </h4>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-[#027081] pt-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 font-serif uppercase tracking-wider">
                <Newspaper className="h-4 w-4 text-[#027081]" />
                <span>{isEnglish ? "Editor’s Pick" : "सम्पादकको छनोट"}</span>
              </h3>
            </div>

            <div className="mt-3 space-y-3">
              {editorPick.map((art: HomeArticleItem) => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
                  className="group flex items-start gap-3 border-b border-border/50 pb-2.5 last:border-0"
                >
                  {art.coverImage && (
                    <div className="h-16 w-20 shrink-0 bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                      />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#027081]">
                      {resolveCategoryName(art.category, lang)}
                    </span>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                      {resolveArticleTitle(art, lang)}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-emerald-600 pt-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 font-serif uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{isEnglish ? "Most Read" : "सर्वाधिक पढिएको"}</span>
              </h3>
            </div>

            <div className="mt-3 space-y-3">
              {mostRead.map((art: HomeArticleItem, index: number) => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
                  className="group flex items-start gap-3 border-b border-border/50 pb-2.5 last:border-0"
                >
                  <span className="text-base font-black text-[#027081] font-mono shrink-0 w-6">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                      {resolveArticleTitle(art, lang)}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {art.views} {isEnglish ? "reads" : "पढिएको"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 1. HERO LEAD NEWS SECTION */}
      <section className="max-w-[1480px] mx-auto px-4 pt-6 pb-8 border-b border-border">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-2 border-l-4 border-rose-600 pl-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-serif uppercase">
              {isEnglish ? "Lead Stories" : "मुख्य समाचार (Lead Stories)"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Large Feature Card (Left 2 Columns) */}
          {leadStory ? (
            <Link
              href={`/article/${leadStory.slug}${isEnglish ? "?lang=en" : ""}`}
              className="lg:col-span-2 group relative overflow-hidden bg-slate-950 flex flex-col justify-end min-h-[380px] sm:min-h-[440px] rounded-none"
            >
              {leadStory.coverImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={leadStory.coverImage}
                  alt={leadStory.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-[#027081] text-white text-xs font-bold px-3 py-1 uppercase rounded-none">
                    {resolveCategoryName(leadStory.category, lang)}
                  </span>
                  <span className="text-white/80 text-xs font-mono">
                    {formatTimeAgoNp(leadStory.createdAt)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight group-hover:text-amber-300 transition-colors font-serif">
                  {resolveArticleTitle(leadStory, lang)}
                </h1>

                {leadStory.excerpt && (
                  <p className="text-sm text-white/85 line-clamp-2 leading-relaxed max-w-3xl font-sans">
                    {leadStory.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ) : (
            <div className="lg:col-span-2 border border-dashed p-12 text-center text-muted-foreground rounded-none">
              कुनै समाचार उपलब्ध छैन।
            </div>
          )}

          {/* 4 Side Secondary Featured Cards (Right 1 Column) */}
          <div className="grid grid-cols-1 gap-4">
            {secondaryFeatured.map((art: HomeArticleItem) => (
              <Link
                key={art.id}
                href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
                className="group flex space-x-3.5 p-3 border-b border-border/60 hover:bg-muted/40 transition-colors rounded-none"
              >
                {art.coverImage && (
                  <div className="h-20 w-24 overflow-hidden shrink-0 bg-muted rounded-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] font-bold text-[#027081] uppercase tracking-wider">
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

      {/* 2. OPINION & COLUMNISTS SHOWCASE */}
      <div className="max-w-[1480px] mx-auto px-4">
        <OpinionSection articles={opinionArticles} lang={lang} />
      </div>

      {/* 3. LATEST NEWS STREAM & TRENDING SIDEBAR */}
      <section className="max-w-[1480px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Stream: Latest Headlines (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#027081] pb-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2 font-serif uppercase tracking-wider">
                <Newspaper className="h-5 w-5 text-[#027081]" />
                <span>{isEnglish ? "Latest Headlines" : "ताजा तथा भर्खरका समाचार"}</span>
              </h3>
            </div>

            <div className="space-y-4">
              {latestList.map((art: HomeArticleItem) => (
                <article
                  key={art.id}
                  className="group flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 p-4 border-b border-border hover:bg-muted/30 transition-colors rounded-none"
                >
                  {art.coverImage && (
                    <div className="h-44 sm:h-32 sm:w-44 overflow-hidden shrink-0 bg-muted rounded-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider">
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
            {sidebarAd ? (
              <AdUnit
                ad={sidebarAd}
                path="/"
                className="w-full h-62.5 border border-border rounded-none"
              />
            ) : (
              <div className="w-full h-62.5 border border-dashed border-border/80 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground font-medium rounded-none">
                विज्ञापन स्थान (Sidebar Ad - 300x250)
              </div>
            )}

            {/* Trending News Block */}
            <div className="border-t-2 border-amber-500 pt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-base font-extrabold text-foreground flex items-center gap-2 font-serif uppercase tracking-wider">
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
                    <span className="text-xl font-extrabold text-[#027081] font-mono shrink-0 w-5">
                      0{index + 1}
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

            {/* Public Opinion Poll Widget */}
            <OpinionPollWidget />

            {/* Nepali Utility Notice Board Widget */}
            <NepaliUtilityWidget />
          </div>
        </div>
      </section>

      {/* 4. PROVINCE NEWS MAP & WIDGET */}
      <section className="max-w-[1480px] mx-auto px-4 py-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ProvinceNewsWidget articles={publishedArticles as any} />
      </section>

      {/* 5. ECONOMY & BUSINESS SECTION */}
      <div className="max-w-[1480px] mx-auto px-4">
        <CategoryGridSection
          title="Economy & Business"
          titleNp="अर्थतन्त्र र सेयर बजार (Economy)"
          categorySlug="economy"
          articles={economyArticles}
          lang={lang}
        />
      </div>

      {/* 6. SPORTS & ENTERTAINMENT SECTION */}
      <div className="max-w-[1480px] mx-auto px-4">
        <CategoryGridSection
          title="Sports & Entertainment"
          titleNp="खेलकुद र मनोरञ्जन (Sports & Lifestyle)"
          categorySlug="sports"
          articles={sportsArticles}
          lang={lang}
        />
      </div>

      {/* 7. MULTIMEDIA PHOTO & VIDEO FEATURE */}
      <div className="max-w-[1480px] mx-auto px-4">
        <PhotoVideoFeature articles={photoFeatureArticles} lang={lang} />
      </div>
    </main>
  );
}
