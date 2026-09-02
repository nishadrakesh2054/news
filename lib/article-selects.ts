import { Prisma } from "@prisma/client";
import { optimizeCloudinaryUrl, type ImagePreset } from "@/lib/cloudinary-url";

/** Lightweight fields for article lists, search, homepage sections. */
export const articleListSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  type: true,
  views: true,
  province: true,
  district: true,
  publishedAt: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, nameNp: true, slug: true },
  },
  author: {
    select: { name: true, image: true },
  },
  tags: {
    select: { id: true, name: true, slug: true },
  },
} satisfies Prisma.ArticleSelect;

/** Public article detail — excludes heavy relations not needed in API. */
export const articleDetailSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  content: true,
  contentNp: true,
  excerpt: true,
  coverImage: true,
  caption: true,
  type: true,
  languageEdition: true,
  views: true,
  metaTitle: true,
  metaDescription: true,
  keywords: true,
  ogImage: true,
  province: true,
  district: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true, nameNp: true, slug: true },
  },
  author: {
    select: { name: true, image: true },
  },
  tags: {
    select: { id: true, name: true, slug: true },
  },
  liveUpdates: {
    orderBy: { createdAt: "desc" as const },
    select: { id: true, title: true, content: true, createdAt: true },
  },
} satisfies Prisma.ArticleSelect;

type ListArticle = Prisma.ArticleGetPayload<{ select: typeof articleListSelect }>;

export function mapArticleListItem(article: ListArticle, imagePreset: ImagePreset = "card") {
  return {
    id: article.id,
    title: article.title,
    titleNp: article.titleNp,
    slug: article.slug,
    excerpt: article.excerpt,
    thumbnail: optimizeCloudinaryUrl(article.coverImage, imagePreset),
    type: article.type,
    views: article.views,
    province: article.province,
    district: article.district,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    category: article.category,
    author: article.author
      ? {
          name: article.author.name,
          image: optimizeCloudinaryUrl(article.author.image, "avatar"),
        }
      : null,
    tags: article.tags,
  };
}
