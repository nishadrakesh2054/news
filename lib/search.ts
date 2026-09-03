import { Prisma } from "@prisma/client";

/**
 * Build search OR clauses. By default skips full `content` fields to avoid
 * sequential scans on large text columns; pass deep=true to include body search.
 */
export function buildArticleSearchOr(
  query: string,
  deep = false
): Prisma.ArticleWhereInput[] {
  const q = query.trim();
  const clauses: Prisma.ArticleWhereInput[] = [
    { title: { contains: q, mode: "insensitive" } },
    { titleNp: { contains: q, mode: "insensitive" } },
    { excerpt: { contains: q, mode: "insensitive" } },
    { excerptNp: { contains: q, mode: "insensitive" } },
    { keywords: { contains: q, mode: "insensitive" } },
    { keywordsNp: { contains: q, mode: "insensitive" } },
    { district: { contains: q, mode: "insensitive" } },
    { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
  ];

  if (deep) {
    clauses.push(
      { content: { contains: q, mode: "insensitive" } },
      { contentNp: { contains: q, mode: "insensitive" } }
    );
  }

  return clauses;
}

export function parseSearchPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12), 50);
  const deep = searchParams.get("deep") === "true";
  const sort: "recent" | "views" = searchParams.get("sort") === "views" ? "views" : "recent";
  return { page, limit, deep, sort };
}
