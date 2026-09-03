import { Prisma } from "@prisma/client";
import { optimizeCloudinaryUrl, type ImagePreset } from "@/lib/cloudinary-url";
import {
  resolveArticleContent,
  resolveArticleExcerpt,
  resolveArticleTitle,
  resolveCategoryName,
  resolveKeywords,
  resolveMetaDescription,
  resolveMetaTitle,
  type LanguageEditionType,
} from "@/lib/language";

/** Lightweight fields for article lists, search, homepage sections. */
export const articleListSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  excerpt: true,
  excerptNp: true,
  coverImage: true,
  type: true,
  languageEdition: true,
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
  excerptNp: true,
  coverImage: true,
  caption: true,
  type: true,
  languageEdition: true,
  views: true,
  metaTitle: true,
  metaTitleNp: true,
  metaDescription: true,
  metaDescriptionNp: true,
  keywords: true,
  keywordsNp: true,
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
type DetailArticle = Prisma.ArticleGetPayload<{ select: typeof articleDetailSelect }>;

export function mapArticleListItem(
  article: ListArticle,
  imagePreset: ImagePreset = "card",
  lang?: LanguageEditionType
) {
  const mapped = {
    id: article.id,
    title: article.title,
    titleNp: article.titleNp,
    slug: article.slug,
    excerpt: article.excerpt,
    excerptNp: article.excerptNp,
    thumbnail: optimizeCloudinaryUrl(article.coverImage, imagePreset),
    type: article.type,
    languageEdition: article.languageEdition,
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

  if (!lang) return mapped;

  return {
    ...mapped,
    lang,
    displayTitle: resolveArticleTitle(article, lang),
    displayExcerpt: resolveArticleExcerpt(article, lang),
    displayCategory: resolveCategoryName(article.category, lang),
  };
}

export function mapArticleDetail(article: DetailArticle, lang: LanguageEditionType) {
  return {
    ...article,
    lang,
    displayTitle: resolveArticleTitle(article, lang),
    displayContent: resolveArticleContent(article, lang),
    displayExcerpt: resolveArticleExcerpt(article, lang),
    displayMetaTitle: resolveMetaTitle(article, lang),
    displayMetaDescription: resolveMetaDescription(article, lang),
    displayKeywords: resolveKeywords(article, lang),
    displayCategory: resolveCategoryName(article.category, lang),
    coverImage: optimizeCloudinaryUrl(article.coverImage, "hero"),
    ogImage: optimizeCloudinaryUrl(article.ogImage, "og"),
    author: article.author
      ? {
          ...article.author,
          image: optimizeCloudinaryUrl(article.author.image, "avatar"),
        }
      : null,
  };
}
