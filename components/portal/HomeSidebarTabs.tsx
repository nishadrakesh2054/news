"use client";

import { useState } from "react";
import Link from "next/link";
import type { LanguageEditionType } from "@/lib/language";
import { resolveArticleTitle, resolveCategoryName } from "@/lib/language";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PORTAL } from "@/constants/portal";
import type { PortalArticleCard } from "@/components/portal/NewsCard";
import { Clock } from "lucide-react";

type TabKey = "recent" | "popular";

type HomeSidebarTabsProps = {
  recent: PortalArticleCard[];
  popular: PortalArticleCard[];
  lang: LanguageEditionType;
};

export function HomeSidebarTabs({ recent, popular, lang }: HomeSidebarTabsProps) {
  const [tab, setTab] = useState<TabKey>("recent");
  const isEnglish = lang === "en";
  const items = tab === "recent" ? recent : popular;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "recent", label: isEnglish ? "Recent" : "भर्खरै" },
    { key: "popular", label: isEnglish ? "Popular" : "लोकप्रिय" },
  ];

  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex border-b border-gray-200">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 px-2 py-2.5 text-xs font-bold sm:text-sm ${
                active ? "text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              style={active ? { backgroundColor: PORTAL.accent } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <ul className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <li className="px-3 py-8 text-center text-xs text-gray-500">
            {isEnglish ? "No articles yet." : "समाचार उपलब्ध छैन।"}
          </li>
        ) : (
          items.slice(0, 6).map((art) => {
            const title = resolveArticleTitle(art, lang);
            const category = art.category ? resolveCategoryName(art.category, lang) : null;
            const href = lang === "en" ? `/article/${art.slug}?lang=en` : `/article/${art.slug}`;
            const image = optimizeCloudinaryUrl(art.coverImage, "thumbnail") || art.coverImage;
            const when = formatTimeAgoNp(
              typeof art.createdAt === "string" ? new Date(art.createdAt) : art.createdAt
            );

            return (
              <li key={art.id}>
                <Link href={href} className="flex gap-3 p-3 hover:bg-gray-50">
                  <div className="h-16 w-16 shrink-0 overflow-hidden bg-gray-200">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    {category ? (
                      <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.accent }}>
                        {category}
                      </span>
                    ) : null}
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">{title}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                      <Clock className="h-3 w-3" />
                      {when}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
