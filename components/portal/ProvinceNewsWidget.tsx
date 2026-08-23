"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";

export const PROVINCES = [
  { id: 1, name: "कोशी प्रदेश", slug: "koshi" },
  { id: 2, name: "मधेश प्रदेश", slug: "madhesh" },
  { id: 3, name: "बागमती प्रदेश", slug: "bagmati" },
  { id: 4, name: "गण्डकी प्रदेश", slug: "gandaki" },
  { id: 5, name: "लुम्बिनी प्रदेश", slug: "lumbini" },
  { id: 6, name: "कर्णाली प्रदेश", slug: "karnali" },
  { id: 7, name: "सुदूरपश्चिम प्रदेश", slug: "sudurpashchim" },
];

interface ArticleItem {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  province?: number | null;
  district?: string | null;
  createdAt: string;
}

interface ProvinceNewsWidgetProps {
  articles: ArticleItem[];
}

export function ProvinceNewsWidget({ articles }: ProvinceNewsWidgetProps) {
  const [activeProvince, setActiveProvince] = useState<number>(3); // Default Bagmati

  const filteredArticles = articles.filter(
    (a) => a.province === activeProvince || (!a.province && activeProvince === 3)
  );

  const currentProv = PROVINCES.find((p) => p.id === activeProvince) || PROVINCES[2];

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-[#027081]" />
          <h2 className="text-xl font-extrabold text-foreground font-serif">
            प्रदेश विशेष समाचार (7 Provinces Regional Feed)
          </h2>
        </div>

        <Link
          href={`/province/${currentProv.slug}`}
          className="text-xs font-bold text-[#027081] hover:underline flex items-center gap-1"
        >
          <span>{currentProv.name}का सबै समाचार</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Province Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PROVINCES.map((prov) => {
          const isActive = activeProvince === prov.id;
          return (
            <button
              key={prov.id}
              onClick={() => setActiveProvince(prov.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#027081] text-white shadow-xs"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              {prov.name}
            </button>
          );
        })}
      </div>

      {/* Grid of Articles */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.slice(0, 6).map((art) => (
            <Link
              key={art.id}
              href={`/article/${art.slug}`}
              className="group flex space-x-3.5 p-3 rounded-xl border border-border/50 bg-background hover:border-[#027081]/40 transition-colors"
            >
              {art.coverImage && (
                <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                {art.district && (
                  <span className="text-[10px] font-bold text-[#027081] bg-[#027081]/10 px-2 py-0.5 rounded">
                    {art.district}
                  </span>
                )}
                <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-[#027081] transition-colors leading-snug font-serif">
                  {art.titleNp || art.title}
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {formatTimeAgoNp(art.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
          {currentProv.name}मा हाल कुनै विशेष समाचार दर्ता भएको छैन।
        </div>
      )}
    </section>
  );
}
