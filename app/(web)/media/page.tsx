import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { ArrowLeft, Camera, PlayCircle } from "lucide-react";

export const revalidate = 60;

export default async function MediaGalleryPage() {
  const mediaStories = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      coverImage: { not: null },
    },
    select: {
      id: true,
      title: true,
      titleNp: true,
      slug: true,
      coverImage: true,
      excerpt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <main className="w-full bg-background pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#027081] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          गृहपृष्ठमा फर्कनुहोस्
        </Link>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 text-[#027081]">
            <Camera className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-extrabold text-foreground font-serif">मिडिया र फोटो ग्यालेरी</h1>
              <p className="text-xs text-muted-foreground">Nepal News multimedia coverage and visual stories</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaStories.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative h-60 overflow-hidden">
                {article.coverImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={article.coverImage}
                    alt={article.titleNp || article.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                  <PlayCircle className="h-3 w-3" />
                  Gallery
                </div>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {new Date(article.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <h2 className="text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                  {article.titleNp || article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
