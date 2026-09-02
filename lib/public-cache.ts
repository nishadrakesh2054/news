import { unstable_cache } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const CACHE_TAGS = {
  categories: "categories",
  tags: "tags",
  ads: "ads",
  breaking: "breaking",
} as const;

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
        slug: true,
        _count: {
          select: {
            articles: { where: { status: ArticleStatus.PUBLISHED } },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      articlesCount: tag._count.articles,
    }));
  },
  ["public-tags"],
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
      },
      orderBy: { createdAt: "desc" },
    }),
  ["public-active-ads"],
  { revalidate: 120, tags: [CACHE_TAGS.ads] }
);
