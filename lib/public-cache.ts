import { unstable_cache } from "next/cache";
import { ArticleStatus, ArticleType, AuRegion, PollStatus, Prisma } from "@prisma/client";
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

const HOME_OPINION_SLUGS = ["opinion", "vichar"];
const HOME_ECONOMY_SLUGS = ["economy-business", "economy", "arthatantra"];
const HOME_SPORTS_SLUGS = ["sports", "entertainment", "khelkud", "manoranjan"];

async function loadHomePayload(lang: LanguageEditionType) {
  const whereClause: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    ...languageEditionWhere(lang),
  };

  const sectionCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: [...HOME_OPINION_SLUGS, ...HOME_ECONOMY_SLUGS, ...HOME_SPORTS_SLUGS],
      },
    },
    select: { id: true, slug: true },
  });
  const idsFor = (slugs: string[]) =>
    sectionCategories.filter((c) => slugs.includes(c.slug)).map((c) => c.id);

  const opinionIds = idsFor(HOME_OPINION_SLUGS);
  const economyIds = idsFor(HOME_ECONOMY_SLUGS);
  const sportsIds = idsFor(HOME_SPORTS_SLUGS);

  const [
    publishedArticles,
    homeSpotlightArticles,
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
      take: 5,
    }),
    prisma.article.findMany({
      where: {
        ...whereClause,
        OR: [
          ...(opinionIds.length > 0 ? [{ categoryId: { in: opinionIds } }] : []),
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
        ...(economyIds.length > 0
          ? { categoryId: { in: economyIds } }
          : { category: { slug: { in: HOME_ECONOMY_SLUGS } } }),
      },
      select: homeArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.article.findMany({
      where: {
        ...whereClause,
        ...(sportsIds.length > 0
          ? { categoryId: { in: sportsIds } }
          : { category: { slug: { in: HOME_SPORTS_SLUGS } } }),
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
    [`public-home-payload-v2-${lang}`],
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
        showOnHome: true,
        showOnArticle: true,
        showOnCategory: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["public-active-ads-v3"],
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

const articleSidebarSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  coverImage: true,
  createdAt: true,
} satisfies Prisma.ArticleSelect;

const articleSidebarTrendingSelect = {
  ...articleSidebarSelect,
  views: true,
} satisfies Prisma.ArticleSelect;

/** Shared latest list for article sidebars (filter current id at call site). */
export function getCachedLatestArticles(lang: LanguageEditionType) {
  return unstable_cache(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          ...languageEditionWhere(lang),
        },
        select: articleSidebarSelect,
        orderBy: { publishedAt: "desc" },
        take: 8,
      }),
    [`public-article-latest-${lang}-v1`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

/** Shared trending list for article sidebars. */
export function getCachedTrendingArticles(lang: LanguageEditionType) {
  return unstable_cache(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          ...languageEditionWhere(lang),
        },
        select: articleSidebarTrendingSelect,
        orderBy: { views: "desc" },
        take: 8,
      }),
    [`public-article-trending-${lang}-v1`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

/** Related-by-category for article pages (exclude current id at call site). */
export function getCachedRelatedByCategory(
  lang: LanguageEditionType,
  categoryId: string
) {
  return unstable_cache(
    () =>
      prisma.article.findMany({
        where: {
          categoryId,
          status: ArticleStatus.PUBLISHED,
          ...languageEditionWhere(lang),
        },
        select: articleSidebarSelect,
        orderBy: { publishedAt: "desc" },
        take: 6,
      }),
    [`public-related-${lang}-${categoryId}-v1`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

const tagArchiveArticleSelect = {
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
} satisfies Prisma.ArticleSelect;

export function getCachedTagArchive(slug: string, lang: LanguageEditionType) {
  return unstable_cache(
    async () => {
      const [tag, otherTags] = await Promise.all([
        prisma.tag.findUnique({
          where: { slug },
          select: { id: true, name: true, nameNp: true, slug: true },
        }),
        prisma.tag.findMany({
          where: { slug: { not: slug } },
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
          take: 12,
        }),
      ]);

      const articles = tag
        ? await prisma.article.findMany({
            where: {
              status: ArticleStatus.PUBLISHED,
              tags: { some: { id: tag.id } },
              ...languageEditionWhere(lang),
            },
            select: tagArchiveArticleSelect,
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
            select: tagArchiveArticleSelect,
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 36,
          });

      return {
        tag,
        otherTags: otherTags.map((t) => ({
          id: t.id,
          name: t.name,
          nameNp: t.nameNp,
          slug: t.slug,
          articlesCount: t._count.articles,
        })),
        articles,
      };
    },
    [`public-tag-archive-v1-${slug}-${lang}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles, CACHE_TAGS.tags] }
  )();
}

export function getCachedProvinceArticles(provinceId: number) {
  return unstable_cache(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          province: provinceId,
        },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          district: true,
          createdAt: true,
          category: { select: { name: true, nameNp: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    [`public-province-articles-v1-${provinceId}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

export function getCachedAustraliaIndex(lang: LanguageEditionType) {
  return unstable_cache(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          auRegion: { not: null },
          ...languageEditionWhere(lang),
        },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          coverImage: true,
          auRegion: true,
          createdAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 40,
      }),
    [`public-australia-index-v1-${lang}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

export function getCachedAustraliaRegion(
  lang: LanguageEditionType,
  auRegion: AuRegion
) {
  return unstable_cache(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          auRegion,
          ...languageEditionWhere(lang),
        },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          coverImage: true,
          createdAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 30,
      }),
    [`public-australia-region-v1-${lang}-${auRegion}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

export function getCachedAuthorProfile(authorId: string, lang: LanguageEditionType) {
  return unstable_cache(
    () =>
      prisma.user.findUnique({
        where: { id: authorId },
        select: {
          id: true,
          name: true,
          image: true,
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
              category: {
                select: { name: true, nameNp: true, slug: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 24,
          },
        },
      }),
    [`public-author-v1-${authorId}-${lang}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
}

export const getCachedEpapersList = unstable_cache(
  async () =>
    prisma.ePaper.findMany({
      orderBy: { publishDate: "desc" },
      take: 40,
    }),
  ["public-epapers-list-v1"],
  { revalidate: 300, tags: [CACHE_TAGS.home] }
);

export const getCachedActivePoll = unstable_cache(
  async () => {
    const activePoll = await prisma.poll.findFirst({
      where: { status: PollStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      include: {
        options: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!activePoll) return null;

    if (activePoll.expiresAt && activePoll.expiresAt.getTime() <= Date.now()) {
      return {
        expired: true as const,
        id: activePoll.id,
      };
    }

    const totalVotes = activePoll.options.reduce((acc, opt) => acc + opt.votes, 0);

    return {
      expired: false as const,
      id: activePoll.id,
      question: activePoll.question,
      questionNp: activePoll.questionNp,
      expiresAt: activePoll.expiresAt,
      totalVotes,
      options: activePoll.options.map((opt) => ({
        id: opt.id,
        option: opt.option,
        optionNp: opt.optionNp,
        votes: opt.votes,
        percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
      })),
    };
  },
  ["public-active-poll-v1"],
  { revalidate: 30, tags: [CACHE_TAGS.home] }
);
