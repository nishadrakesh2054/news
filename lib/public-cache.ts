import { unstable_cache } from "next/cache";
import { ArticleStatus, ArticleType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LanguageEditionType } from "@/lib/language";
import { languageEditionWhere, resolveArticleTitle } from "@/lib/language";

export const CACHE_TAGS = {
  categories: "categories",
  tags: "tags",
  ads: "ads",
  breaking: "breaking",
  settings: "settings",
  home: "home",
  articles: "articles",
} as const;

const homeArticleSelect = {
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

async function loadHomePayload(lang: LanguageEditionType) {
  const whereClause: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    ...languageEditionWhere(lang),
  };

  const [
    publishedArticles,
    categories,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
    popularArticles,
  ] = await Promise.all([
    prisma.article.findMany({
      where: whereClause,
      select: homeArticleSelect,
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
      take: 4,
    }),
    prisma.article.findMany({
      where: {
        ...whereClause,
        category: { slug: { in: ["economy", "arthatantra"] } },
      },
      select: homeArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.article.findMany({
      where: {
        ...whereClause,
        category: { slug: { in: ["sports", "entertainment", "khelkud", "manoranjan"] } },
      },
      select: homeArticleSelect,
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
      take: 18,
    }),
    prisma.article.findMany({
      where: whereClause,
      select: homeArticleSelect,
      orderBy: { views: "desc" },
      take: 5,
    }),
  ]);

  return {
    publishedArticles,
    categories,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
    popularArticles,
  };
}

/** Cached homepage article sections (revalidate 60s). */
export function getCachedHomePayload(lang: LanguageEditionType) {
  return unstable_cache(
    () => loadHomePayload(lang),
    [`public-home-payload-${lang}`],
    { revalidate: 60, tags: [CACHE_TAGS.home, CACHE_TAGS.articles] }
  )();
}

export const getCachedCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        description: true,
        order: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ["public-categories"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export const getCachedTags = unstable_cache(
  async () => {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        _count: {
          select: {
            articles: { where: { status: ArticleStatus.PUBLISHED } },
          },
        },
      },
      orderBy: { name: "asc" },
      take: 40,
    });
    return tags
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        nameNp: tag.nameNp,
        slug: tag.slug,
        articlesCount: tag._count.articles,
      }))
      .sort((a, b) => b.articlesCount - a.articlesCount);
  },
  ["public-tags-v3"],
  { revalidate: 300, tags: [CACHE_TAGS.tags] }
);

export const getCachedActiveAds = unstable_cache(
  async () =>
    prisma.ad.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slot: true,
        imageUrl: true,
        targetUrl: true,
        scriptCode: true,
        isActive: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["public-active-ads-v2"],
  { revalidate: 120, tags: [CACHE_TAGS.ads] }
);

export function getCachedBreaking(lang: LanguageEditionType) {
  return unstable_cache(
    async () => {
      const rows = await prisma.article.findMany({
        where: {
          isBreaking: true,
          status: ArticleStatus.PUBLISHED,
          ...languageEditionWhere(lang),
        },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });

      return rows
        .map((item) => {
          const en = item.title?.trim() || "";
          const np = item.titleNp?.trim() || "";

          // English edition: only show a real English headline (skip Nepali-only copies).
          if (lang === "en") {
            if (!en || (np && en === np)) return null;
            return { id: item.id, title: en, slug: item.slug };
          }

          return {
            id: item.id,
            title: resolveArticleTitle(item, lang),
            slug: item.slug,
          };
        })
        .filter((item): item is { id: string; title: string; slug: string } => item != null);
    },
    [`public-breaking-${lang}-v2`],
    { revalidate: 60, tags: [CACHE_TAGS.breaking] }
  )();
}

export const getCachedEpapers = unstable_cache(
  async () =>
    prisma.ePaper.findMany({
      select: {
        id: true,
        title: true,
        pdfUrl: true,
        coverImage: true,
      },
      orderBy: { publishDate: "desc" },
      take: 5,
    }),
  ["public-epapers"],
  { revalidate: 300, tags: [CACHE_TAGS.home] }
);

export const getCachedGalleriesHome = unstable_cache(
  async () =>
    prisma.gallery.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        description: true,
        coverUrl: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ["public-galleries-home"],
  { revalidate: 180, tags: [CACHE_TAGS.home] }
);

export const getCachedReels = unstable_cache(
  async () => {
    const items = await prisma.media.findMany({
      where: {
        OR: [
          { folder: "reels" },
          { mimeType: "video/youtube", folder: "videos" },
        ],
      },
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        altText: true,
        caption: true,
        folder: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    if (items.length > 0) return items;
    return prisma.media.findMany({
      where: { mimeType: { startsWith: "video/" } },
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        altText: true,
        caption: true,
        folder: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  },
  ["public-reels"],
  { revalidate: 180, tags: [CACHE_TAGS.home] }
);
