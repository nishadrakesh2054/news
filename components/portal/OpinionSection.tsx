"use client";

import Link from "next/link";
import { User, Quote, ChevronRight } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { resolveArticleExcerpt, resolveArticleTitle } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

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
    <section className="my-8 space-y-5 border border-slate-800 bg-slate-950 p-5 text-slate-100 sm:p-7">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center text-white" style={{ backgroundColor: PORTAL.brand }}>
            <Quote className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              {isEnglish ? "Opinions & Columnists" : "विचार र दृष्टिकोण"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEnglish
                ? "Analysis and commentary from our writers"
                : "विश्लेषण तथा स्तम्भकारका विचार"}
            </p>
          </div>
        </div>

        <Link
          href={`/category/vichar${isEnglish ? "?lang=en" : ""}`}
          className="flex items-center gap-1 text-xs font-bold text-sky-400 transition-colors hover:text-sky-300"
        >
          <span>{isEnglish ? "View All" : "सबै"}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {articles.slice(0, 3).map((art) => {
          const excerpt = resolveArticleExcerpt(art, edition);
          const hasExcerpt = Boolean(art.excerpt?.trim() || art.excerptNp?.trim());
          return (
            <Link
              key={art.id}
              href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
              className="group flex flex-col justify-between space-y-4 border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-600"
            >
              <div className="space-y-3">
                <h4 className="line-clamp-3 font-serif text-base font-bold leading-snug text-white group-hover:text-amber-300 sm:text-lg">
                  {resolveArticleTitle(art, edition)}
                </h4>
                {hasExcerpt && (
                  <p className="line-clamp-2 text-xs italic leading-relaxed text-slate-300">
                    &ldquo;{excerpt}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-slate-800 pt-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-amber-400/30 text-sm font-bold text-white"
                  style={{ backgroundColor: PORTAL.brand }}
                >
                  {art.author.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={art.author.image}
                      alt={art.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-amber-300">
                    {art.author.name || (isEnglish ? "Editorial" : "सम्पादकीय")}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-400">
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
