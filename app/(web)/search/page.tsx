import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, Prisma } from "@prisma/client";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { Search as SearchIcon, Newspaper, ArrowLeft } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const currentPage = parseInt(params.page || "1");
  const sort = params.sort || "recent";
  const limit = 12;

  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
  };

  if (query.trim()) {
    const q = query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { titleNp: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { keywords: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  const total = await prisma.article.count({ where });
  const totalPages = Math.ceil(total / limit);

  const orderBy: Prisma.ArticleOrderByWithRelationInput = sort === "views" ? { views: "desc" } : { publishedAt: "desc" };

  const articles = await prisma.article.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * limit,
    take: limit,
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <main className="w-full bg-background min-h-screen pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Search Header Form */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-xs font-semibold text-[#027081] hover:underline mb-2 gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>गृहपृष्ठमा फर्कनुहोस्</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif tracking-tight flex items-center gap-2.5">
                <SearchIcon className="h-7 w-7 text-[#027081]" />
                <span>समाचार खोजि (Search Portal)</span>
              </h1>
            </div>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-full">
              कुल नतिजा: {total} समाचार
            </span>
          </div>

          <form action="/search" method="GET" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="समाचार शीर्षक, विषयवस्तु वा शब्द खोज्नुहोस्..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-[#027081]"
                />
                <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex gap-2">
                <select
                  name="category"
                  defaultValue={categorySlug}
                  className="h-12 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-[#027081]"
                >
                  <option value="">सबै विधा (All Categories)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.nameNp || cat.name}
                    </option>
                  ))}
                </select>

                <select
                  name="sort"
                  defaultValue={sort}
                  className="h-12 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-[#027081]"
                >
                  <option value="recent">नयाँ समाचार</option>
                  <option value="views">लोकप्रिय (Most Read)</option>
                </select>

                <button
                  type="submit"
                  className="h-12 px-6 bg-[#027081] text-white font-bold rounded-xl hover:bg-[#025a68] transition-colors shrink-0"
                >
                  खोज्नुहोस्
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Stream */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                {art.coverImage && (
                  <div className="h-48 w-full overflow-hidden bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-[#027081] text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                      {art.category?.nameNp || art.category?.name}
                    </span>
                  </div>
                )}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] text-muted-foreground font-mono block">
                      {formatTimeAgoNp(art.createdAt)}
                    </span>
                    <h2 className="text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                      <Link href={`/article/${art.slug}`}>
                        {art.titleNp || art.title}
                      </Link>
                    </h2>
                    {art.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>लेखक: {art.author?.name || "सम्पादकीय"}</span>
                    <Link
                      href={`/article/${art.slug}`}
                      className="font-bold text-[#027081] hover:underline"
                    >
                      थप पढ्नुहोस् →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-card">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold text-foreground">कुनै नतिजा भेटिएन</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              तपाईंले खोज्नुभएको शब्द &quot;{query}&quot; सँग मिल्दो समाचार भेटिएन। कृपया अर्को शब्द वा विधा प्रयोग गरी पुनः प्रयास गर्नुहोस्।
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const queryParams = new URLSearchParams();
              if (query) queryParams.set("q", query);
              if (categorySlug) queryParams.set("category", categorySlug);
              if (sort) queryParams.set("sort", sort);
              queryParams.set("page", p.toString());

              const isCurrent = p === currentPage;
              return (
                <Link
                  key={p}
                  href={`/search?${queryParams.toString()}`}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl font-mono text-sm font-bold transition-colors ${
                    isCurrent
                      ? "bg-[#027081] text-white"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
