import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { articleListSelect } from "@/lib/article-selects";
import { buildArticleSearchOr } from "@/lib/search";
import { languageEditionSql, languageEditionWhere } from "@/lib/language";

export type ArticleSearchFilters = {
  query: string;
  categorySlug?: string;
  tagSlug?: string;
  province?: string;
  district?: string;
  deep?: boolean;
  sort: "recent" | "views";
  page: number;
  limit: number;
  lang?: "ne" | "en";
};

export type ArticleSearchResult = {
  articles: Prisma.ArticleGetPayload<{ select: typeof articleListSelect }>[];
  total: number;
  engine: "trgm" | "prisma";
};

let trgmAvailable: boolean | null = null;

export async function isPgTrgmAvailable(): Promise<boolean> {
  if (trgmAvailable !== null) return trgmAvailable;
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
      ) AS exists
    `;
    trgmAvailable = Boolean(rows[0]?.exists);
  } catch {
    trgmAvailable = false;
  }
  return trgmAvailable;
}

function buildPrismaWhere(filters: ArticleSearchFilters): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = { status: ArticleStatus.PUBLISHED };

  if (filters.lang) {
    Object.assign(where, languageEditionWhere(filters.lang));
  }

  if (filters.query.trim()) {
    where.OR = buildArticleSearchOr(filters.query, filters.deep);
  }
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.tagSlug) {
    where.tags = { some: { slug: filters.tagSlug } };
  }
  if (filters.province) {
    const provinceNum = Number(filters.province);
    if (!Number.isNaN(provinceNum)) where.province = provinceNum;
  }
  if (filters.district?.trim()) {
    where.district = { contains: filters.district.trim(), mode: "insensitive" };
  }

  return where;
}

async function searchWithPrisma(filters: ArticleSearchFilters): Promise<ArticleSearchResult> {
  const where = buildPrismaWhere(filters);
  const orderBy: Prisma.ArticleOrderByWithRelationInput =
    filters.sort === "views" ? { views: "desc" } : { publishedAt: "desc" };

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: articleListSelect,
    }),
  ]);

  return { articles, total, engine: "prisma" };
}

async function searchWithTrgm(filters: ArticleSearchFilters): Promise<ArticleSearchResult> {
  const q = filters.query.trim();
  const pattern = `%${q}%`;
  const offset = (filters.page - 1) * filters.limit;

  const categoryFilter = filters.categorySlug
    ? Prisma.sql`AND c.slug = ${filters.categorySlug}`
    : Prisma.empty;
  const tagFilter = filters.tagSlug
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "_ArticleToTag" att
        INNER JOIN "Tag" t ON t.id = att."B"
        WHERE att."A" = a.id AND t.slug = ${filters.tagSlug}
      )`
    : Prisma.empty;
  const provinceFilter =
    filters.province && !Number.isNaN(Number(filters.province))
      ? Prisma.sql`AND a.province = ${Number(filters.province)}`
      : Prisma.empty;
  const districtFilter = filters.district?.trim()
    ? Prisma.sql`AND a.district ILIKE ${`%${filters.district.trim()}%`}`
    : Prisma.empty;
  const langFilter = filters.lang ? languageEditionSql(filters.lang) : Prisma.empty;

  const textMatch = Prisma.sql`(
    a.title ILIKE ${pattern}
    OR a."titleNp" ILIKE ${pattern}
    OR a.excerpt ILIKE ${pattern}
    OR COALESCE(a."excerptNp", '') ILIKE ${pattern}
    OR a.keywords ILIKE ${pattern}
    OR COALESCE(a."keywordsNp", '') ILIKE ${pattern}
    OR a.title % ${q}
    OR COALESCE(a."titleNp", '') % ${q}
    OR COALESCE(a.excerpt, '') % ${q}
    OR COALESCE(a."excerptNp", '') % ${q}
  )`;

  const countRows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "Article" a
    LEFT JOIN "Category" c ON c.id = a."categoryId"
    WHERE a.status = ${ArticleStatus.PUBLISHED}::"ArticleStatus"
      ${categoryFilter}
      ${tagFilter}
      ${provinceFilter}
      ${districtFilter}
      ${langFilter}
      AND ${textMatch}
  `;

  const rankExpr = Prisma.sql`GREATEST(
    similarity(a.title, ${q}),
    similarity(COALESCE(a."titleNp", ''), ${q}),
    similarity(COALESCE(a.excerpt, ''), ${q}),
    similarity(COALESCE(a."excerptNp", ''), ${q})
  )`;

  const idRows =
    filters.sort === "views"
      ? await prisma.$queryRaw<{ id: string }[]>`
          SELECT a.id
          FROM "Article" a
          LEFT JOIN "Category" c ON c.id = a."categoryId"
          WHERE a.status = ${ArticleStatus.PUBLISHED}::"ArticleStatus"
            ${categoryFilter}
            ${tagFilter}
            ${provinceFilter}
            ${districtFilter}
            ${langFilter}
            AND ${textMatch}
          ORDER BY a.views DESC, ${rankExpr} DESC
          LIMIT ${filters.limit}
          OFFSET ${offset}
        `
      : await prisma.$queryRaw<{ id: string }[]>`
          SELECT a.id
          FROM "Article" a
          LEFT JOIN "Category" c ON c.id = a."categoryId"
          WHERE a.status = ${ArticleStatus.PUBLISHED}::"ArticleStatus"
            ${categoryFilter}
            ${tagFilter}
            ${provinceFilter}
            ${districtFilter}
            ${langFilter}
            AND ${textMatch}
          ORDER BY a."publishedAt" DESC NULLS LAST, ${rankExpr} DESC
          LIMIT ${filters.limit}
          OFFSET ${offset}
        `;

  const ids = idRows.map((row) => row.id);
  if (ids.length === 0) {
    return { articles: [], total: Number(countRows[0]?.count ?? 0), engine: "trgm" };
  }

  const articles = await prisma.article.findMany({
    where: { id: { in: ids } },
    select: articleListSelect,
  });

  const byId = new Map(articles.map((a) => [a.id, a]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as typeof articles;

  return {
    articles: ordered,
    total: Number(countRows[0]?.count ?? 0),
    engine: "trgm",
  };
}

export async function searchPublishedArticles(
  filters: ArticleSearchFilters
): Promise<ArticleSearchResult> {
  const hasQuery = Boolean(filters.query.trim());

  if (hasQuery && (await isPgTrgmAvailable())) {
    try {
      return await searchWithTrgm(filters);
    } catch (error) {
      const { logger } = await import("@/lib/logger");
      logger.warn("pg_trgm search failed, falling back to Prisma", { error });
    }
  }

  return searchWithPrisma(filters);
}
