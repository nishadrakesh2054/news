import { unstable_cache } from "next/cache";
import { ArticleStatus, ArticleType, AuRegion, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LanguageEditionType } from "@/lib/language";
import { languageEditionWhere, resolveArticleTitle } from "@/lib/language";
import { AU_STATE_CODES, AU_TERRITORY_CODES } from "@/constants/australia-regions";

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
  showOnHome: true,
  homeDisplay: true,
  homeOrder: true,
  views: true,
  province: true,
  district: true,
  auRegion: true,
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
    homeSpotlightArticles,
    categories,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
    popularArticles,
    auStateArticles,
    auTerritoryArticles,
  ] = await Promise.all([
    prisma.article.findMany({
      where: whereClause,
      select: homeArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 24,
    }),
    prisma.article.findMany({
      where: {
        ...whereClause,
        showOnHome: true,
      },
      select: homeArticleSelect,
      orderBy: [{ homeOrder: "asc" }, { publishedAt: "desc" }],
      take: 8,
    }),
    prisma.category.findMany({
      where: { isActive: true },
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
        category: { slug: { in: ["economy-business", "economy", "arthatantra"] } },
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
    prisma.article.findMany({
      where: {
        ...whereClause,
        auRegion: { in: AU_STATE_CODES as AuRegion[] },
      },
      select: homeArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 24,
    }),
    prisma.article.findMany({
      where: {
        ...whereClause,
        auRegion: { in: AU_TERRITORY_CODES as AuRegion[] },
      },
      select: homeArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
  ]);

  return {
    publishedArticles,
    homeSpotlightArticles,
    categories,
    opinionArticles,
    economyArticles,
    sportsArticles,
    provinceArticles,
    popularArticles,
    auStateArticles,
    auTerritoryArticles,
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
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        description: true,
        order: true,
        isActive: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ["public-categories-active-v1"],
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

/** Category archive page size — keep payloads small for TTFB. */
export const CATEGORY_PAGE_SIZE = 12;

const categoryArchiveArticleSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  excerpt: true,
  excerptNp: true,
  coverImage: true,
  createdAt: true,
  publishedAt: true,
  views: true,
  isFeatured: true,
  author: { select: { name: true, image: true } },
} satisfies Prisma.ArticleSelect;

/**
 * Paginated category archive (category by slug → filter by categoryId for index use).
 * Cached per slug + lang + page.
 */
export function getCachedCategoryArchive(
  slug: string,
  lang: LanguageEditionType,
  page: number
) {
  const safePage = Math.max(1, page || 1);
  const limit = CATEGORY_PAGE_SIZE;

  return unstable_cache(
    async () => {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          nameNp: true,
          slug: true,
          description: true,
          descriptionNp: true,
        },
      });

      if (!category) return null;

      const where: Prisma.ArticleWhereInput = {
        status: ArticleStatus.PUBLISHED,
        categoryId: category.id,
        ...languageEditionWhere(lang),
      };

      const [total, articles, popular] = await Promise.all([
        prisma.article.count({ where }),
        prisma.article.findMany({
          where,
          select: categoryArchiveArticleSelect,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          skip: (safePage - 1) * limit,
          take: limit,
        }),
        prisma.article.findMany({
          where,
          select: {
            id: true,
            title: true,
            titleNp: true,
            slug: true,
            views: true,
            createdAt: true,
          },
          orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
          take: 6,
        }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

      return {
        category,
        articles,
        popular,
        pagination: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
      };
    },
    [`public-category-archive-v1-${slug}-${lang}-p${safePage}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles, CACHE_TAGS.categories] }
  )();
}
