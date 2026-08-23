"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";

interface CategoryArticle {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  createdAt: Date;
  author?: {
    name: string;
  };
}

interface CategoryGridSectionProps {
  title: string;
  titleNp: string;
  categorySlug: string;
  articles: CategoryArticle[];
  lang?: string;
  accentColor?: string;
}

export function CategoryGridSection({
  title,
  titleNp,
  categorySlug,
  articles,
  lang,
}: CategoryGridSectionProps) {
  if (!articles || articles.length === 0) return null;

  const isEnglish = lang === "en";
  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);

  return (
    <section className="space-y-4 my-8">
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-b-2 border-[#027081] pb-2">
        <h3 className="text-lg sm:text-xl font-extrabold text-foreground font-serif tracking-tight">
          {isEnglish ? title : titleNp || title}
        </h3>

        <Link
          href={`/category/${categorySlug}${isEnglish ? "?lang=en" : ""}`}
          className="text-xs font-bold text-[#027081] hover:underline flex items-center gap-0.5"
        >
          <span>{isEnglish ? "View All" : "सबै हेर्नुहोस्"}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Main 1 Large Left Card + 3 Right Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Feature Card (Left 2 Columns) */}
        {mainArticle && (
          <Link
            href={`/article/${mainArticle.slug}${isEnglish ? "?lang=en" : ""}`}
            className="lg:col-span-2 group rounded-xl border border-border bg-card hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row"
          >
            {mainArticle.coverImage && (
              <div className="sm:w-1/2 h-56 sm:h-auto overflow-hidden bg-muted relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainArticle.coverImage}
                  alt={mainArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-5 sm:w-1/2 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#027081] uppercase font-mono">
                  {formatTimeAgoNp(mainArticle.createdAt)}
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-[#027081] transition-colors leading-tight font-serif">
                  {mainArticle.titleNp || mainArticle.title}
                </h4>
                {mainArticle.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {mainArticle.excerpt}
                  </p>
                )}
              </div>

              {mainArticle.author?.name && (
                <span className="text-xs text-muted-foreground font-semibold">
                  द्वारा: {mainArticle.author.name}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* 3 Secondary Stacked List Cards (Right 1 Column) */}
        <div className="space-y-3">
          {secondaryArticles.map((art) => (
            <Link
              key={art.id}
              href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
              className="group flex space-x-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-colors"
            >
              {art.coverImage && (
                <div className="h-16 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <h5 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-[#027081] transition-colors leading-snug font-serif">
                  {art.titleNp || art.title}
                </h5>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {formatTimeAgoNp(art.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
