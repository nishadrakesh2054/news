import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { Hash, ChevronRight } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagArchivePage({ params }: TagPageProps) {
  const { slug } = await params;

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { keywords: { contains: slug, mode: "insensitive" } },
        { title: { contains: slug, mode: "insensitive" } },
        { titleNp: { contains: slug, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      titleNp: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      createdAt: true,
      category: { select: { name: true, nameNp: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <main className="w-full bg-background pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Tag Header */}
        <div className="border-b-2 border-[#027081] pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <nav className="flex items-center space-x-2 text-xs text-muted-foreground pb-1">
              <Link href="/" className="hover:text-[#027081]">गृह</Link>
              <ChevronRight className="h-3 w-3" />
              <span>विषयगत ट्याग</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#027081] font-serif flex items-center gap-2">
              <Hash className="h-7 w-7" />
              <span>#{slug}</span>
            </h1>
          </div>

          <span className="bg-[#027081]/10 text-[#027081] text-xs font-bold px-3 py-1.5 rounded-lg font-mono">
            {articles.length} समाचार
          </span>
        </div>

        {/* Tag Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                {art.coverImage && (
                  <div className="h-48 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      {formatTimeAgoNp(art.createdAt)}
                    </span>

                    <h2 className="text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif">
                      <Link href={`/article/${art.slug}`}>
                        {art.titleNp || art.title}
                      </Link>
                    </h2>

                    {art.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/30 text-[11px] font-semibold text-[#027081] flex items-center gap-1">
                    <span>थप पढ्नुहोस्</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground rounded-2xl border border-dashed">
            यस ट्यागमा हाल कुनै समाचार उपलब्ध छैन।
          </div>
        )}
      </div>
    </main>
  );
}
