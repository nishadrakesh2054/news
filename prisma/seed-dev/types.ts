import type { ArticleStatus, ArticleType, AuRegion, LanguageEdition } from "@prisma/client";

export const SEED_SLUG_PREFIX = "dev-seed-";

export type CategorySeedDef = {
  name: string;
  nameNp: string;
  slug: string;
  order: number;
  description: string;
  descriptionNp: string;
};

export type TagSeedDef = {
  name: string;
  nameNp: string;
  slug: string;
};

export type ArticleBlueprint = {
  /** Deterministic unique slug — never clashes with manual content. */
  slug: string;
  categorySlug: string;
  title: string;
  titleNp: string;
  excerpt: string;
  excerptNp: string;
  content: string;
  contentNp: string;
  status: ArticleStatus;
  type: ArticleType;
  languageEdition: LanguageEdition;
  isFeatured: boolean;
  isBreaking: boolean;
  showOnHome: boolean;
  homeDisplay: "TITLE_ONLY" | "TITLE_MEDIA";
  views: number;
  province?: number | null;
  district?: string | null;
  auRegion?: AuRegion | null;
  tagSlugs: string[];
  imageQuery: string;
  metaTitle: string;
  metaTitleNp: string;
  metaDescription: string;
  metaDescriptionNp: string;
  keywords: string;
  keywordsNp: string;
  caption: string;
  /** Hours before now for publishedAt / createdAt distribution. */
  hoursAgo: number;
};

export type SeedRunSummary = {
  categoriesCreated: number;
  categoriesSkipped: number;
  tagsCreated: number;
  tagsSkipped: number;
  authorsUsed: string[];
  articlesCreated: number;
  articlesSkipped: number;
  mediaCreated: number;
  errors: string[];
};
