"use client";

import Link from "next/link";
import type { LanguageEditionType } from "@/lib/language";
import { resolveArticleTitle, resolveCategoryName } from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PORTAL } from "@/constants/portal";
import type { PortalArticleCard } from "@/components/portal/NewsCard";
import { Clock } from "lucide-react";

type HomeSidebarTabsProps = {
  popular: PortalArticleCard[];
  lang: LanguageEditionType;
};

export function HomeSidebarTabs({ popular, lang }: HomeSidebarTabsProps) {
  const isEnglish = lang === "en";
  const items = popular;

  return (
    <div className="border border-gray-200 bg-white">
      <div
        className="px-3 py-2.5 text-center text-xs font-bold text-white sm:text-sm"
        style={{ backgroundColor: PORTAL.accent }}
      >
        {isEnglish ? "Popular" : "लोकप्रिय"}
      </div>

      <ul className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <li className="px-3 py-8 text-center text-xs text-gray-500">
            {isEnglish ? "No articles yet." : "समाचार उपलब्ध छैन।"}
          </li>
        ) : (
          items.slice(0, 5).map((art) => {
            const title = resolveArticleTitle(art, lang);
            const category = art.category ? resolveCategoryName(art.category, lang) : null;
            const href = lang === "en" ? `/article/${art.slug}?lang=en` : `/article/${art.slug}`;
            const image = optimizeCloudinaryUrl(art.coverImage, "thumbnail") || art.coverImage;
            const when = formatTimeAgo(
              typeof art.createdAt === "string" ? new Date(art.createdAt) : art.createdAt,
              lang
            );

            return (
              <li key={art.id}>
                <Link href={href} className="flex gap-3 p-3 hover:bg-gray-50">
                  <div className="h-16 w-16 shrink-0 overflow-hidden bg-gray-200">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={title} className="h-full w-full object-cover" />
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
