"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LanguageEditionType } from "@/lib/language";
import { resolveArticleTitle } from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PORTAL } from "@/constants/portal";

export const PROVINCES = [
  { id: 1, name: "कोशी", nameEn: "Koshi", slug: "koshi" },
  { id: 2, name: "मधेश", nameEn: "Madhesh", slug: "madhesh" },
  { id: 3, name: "बागमती", nameEn: "Bagmati", slug: "bagmati" },
  { id: 4, name: "गण्डकी", nameEn: "Gandaki", slug: "gandaki" },
  { id: 5, name: "लुम्बिनी", nameEn: "Lumbini", slug: "lumbini" },
  { id: 6, name: "कर्णाली", nameEn: "Karnali", slug: "karnali" },
  { id: 7, name: "सुदूरपश्चिम", nameEn: "Sudurpashchim", slug: "sudurpashchim" },
] as const;

type ProvinceArticle = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  coverImage?: string | null;
  province?: number | null;
  district?: string | null;
  createdAt: Date | string;
};

type ProvinceNewsWidgetProps = {
  articles: ProvinceArticle[];
  lang?: LanguageEditionType;
};

export function ProvinceNewsWidget({ articles, lang = "ne" }: ProvinceNewsWidgetProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";
  const [activeProvince, setActiveProvince] = useState<number>(3);

  const filteredArticles = articles.filter((a) => a.province === activeProvince);
  const currentProv = PROVINCES.find((p) => p.id === activeProvince) || PROVINCES[2];
  const provLabel = isEnglish ? currentProv.nameEn : currentProv.name;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2
          className="shrink-0 text-xl font-extrabold tracking-tight whitespace-nowrap sm:text-2xl"
          style={{ color: PORTAL.brand }}
        >
          {isEnglish ? "Province News" : "प्रदेश समाचार"}
        </h2>
        <div
          className="h-px min-w-4 flex-1"
          style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
        />
        <Link
          href={`/province/${currentProv.slug}${langQ}`}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold whitespace-nowrap hover:underline"
          style={{ color: PORTAL.brand }}
        >
          {isEnglish ? "More news" : "थप समाचार"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PROVINCES.map((prov) => {
          const active = activeProvince === prov.id;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => setActiveProvince(prov.id)}
              className={`shrink-0 px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                active ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={active ? { backgroundColor: PORTAL.brand } : undefined}
            >
              {isEnglish ? prov.nameEn : prov.name}
            </button>
          );
        })}
      </div>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.slice(0, 6).map((art) => {
            const title = resolveArticleTitle(art, lang);
            const image = optimizeCloudinaryUrl(art.coverImage, "thumbnail") || art.coverImage;
            const when = formatTimeAgo(
              typeof art.createdAt === "string" ? new Date(art.createdAt) : art.createdAt,
              lang
            );

            return (
              <Link
                key={art.id}
                href={`/article/${art.slug}${langQ}`}
                className="group flex gap-3 border border-gray-200 p-3 hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden bg-gray-200">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  {art.district ? (
                    <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.accent }}>
                      {art.district}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.brand }}>
                      {provLabel}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:underline">
                    {title}
                  </h3>
                  <span className="block text-[10px] text-gray-500">{when}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 px-4 py-10 text-center text-xs text-gray-500">
          {isEnglish
            ? `No province news for ${currentProv.nameEn} yet.`
            : `${currentProv.name}मा हाल कुनै प्रदेश समाचार छैन।`}
        </div>
      )}
    </section>
  );
}
