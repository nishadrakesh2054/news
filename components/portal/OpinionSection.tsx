"use client";

import Link from "next/link";
import { User, Quote, ChevronRight } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { resolveArticleExcerpt, resolveArticleTitle } from "@/lib/language";

interface OpinionArticle {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptNp?: string | null;
  createdAt: Date;
  author: {
    name: string;
    image?: string | null;
  };
}

interface OpinionSectionProps {
  articles: OpinionArticle[];
  lang?: string;
}

export function OpinionSection({ articles, lang }: OpinionSectionProps) {
  if (!articles || articles.length === 0) return null;

  const isEnglish = lang === "en";
  const edition = isEnglish ? "en" : "ne";

  return (
    <section className="w-full bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 space-y-6 my-8 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-[#027081] flex items-center justify-center text-white">
            <Quote className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight">
              {isEnglish ? "Opinions & Columnists" : "विचार र दृष्टिकोण (Opinion)"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEnglish
                ? "Thoughtful insights and perspectives from leading thinkers"
                : "नेपालका प्रबुद्ध विश्लेषक तथा स्तम्भकारहरूका गहन विचारहरू"}
            </p>
          </div>
        </div>

        <Link
          href={`/category/vichar${isEnglish ? "?lang=en" : ""}`}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          <span>{isEnglish ? "View All" : "सबै हेर्नुहोस्"}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((art) => {
          const excerpt = resolveArticleExcerpt(art, edition);
          const hasExcerpt = Boolean(art.excerpt?.trim() || art.excerptNp?.trim());
          return (
            <Link
              key={art.id}
              href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
              className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug font-serif line-clamp-3">
                  {resolveArticleTitle(art, edition)}
                </h4>
                {hasExcerpt && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic">
                    &ldquo;{excerpt}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-700/50">
                <div className="h-10 w-10 rounded-full bg-[#027081] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-amber-400/40">
                  {art.author.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={art.author.image}
                      alt={art.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-amber-300 block truncate">
                    {art.author.name || "सम्पादकीय स्तम्भ"}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {formatTimeAgoNp(art.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
