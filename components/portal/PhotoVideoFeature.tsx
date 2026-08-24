"use client";

import Link from "next/link";
import { Camera, Image as ImageIcon } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";

interface FeatureArticle {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  coverImage?: string | null;
  createdAt: Date;
  category?: {
    nameNp?: string | null;
    name?: string | null;
  };
}

interface PhotoVideoFeatureProps {
  articles: FeatureArticle[];
  lang?: string;
}

export function PhotoVideoFeature({ articles, lang }: PhotoVideoFeatureProps) {
  if (!articles || articles.length === 0) return null;

  const isEnglish = lang === "en";

  return (
    <section className="w-full bg-slate-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 my-8 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight">
              {isEnglish ? "Multimedia & Photo Features" : "फोटो फिचर र भिडियो (Multimedia)"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEnglish ? "Captivating photos and visual stories across Nepal" : "तस्बिर र भिडियोमा प्रस्तुत मुख्य खबरहरू"}
            </p>
          </div>
        </div>

        <Link
          href="/media"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white/90 hover:border-rose-500 hover:text-rose-200 transition-colors"
        >
          {isEnglish ? "Explore Gallery" : "ग्यालेरी हेर्नुहोस्"}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {articles.slice(0, 4).map((art) => (
          <Link
            key={art.id}
            href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}
            className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md flex flex-col justify-end min-h-65"
          >
            {art.coverImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={art.coverImage}
                alt={art.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-800" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <span>फोटो फिचर</span>
            </div>

            <div className="relative z-10 p-4 space-y-1.5">
              <span className="text-[10px] text-white/70 font-mono block">
                {formatTimeAgoNp(art.createdAt)}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2 font-serif">
                {art.titleNp || art.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
