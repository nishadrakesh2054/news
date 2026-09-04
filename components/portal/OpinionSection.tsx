"use client";

import Link from "next/link";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import {
  resolveArticleExcerpt,
  resolveArticleTitle,
  type LanguageEditionType,
} from "@/lib/language";
import { SectionHeader } from "@/components/portal/SectionHeader";

type OpinionArticle = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptNp?: string | null;
  createdAt: Date | string;
};

type OpinionSectionProps = {
  articles: OpinionArticle[];
  lang?: LanguageEditionType | string;
};

export function OpinionSection({ articles, lang = "ne" }: OpinionSectionProps) {
  if (!articles || articles.length === 0) return null;

  const isEnglish = lang === "en";
  const edition: LanguageEditionType = isEnglish ? "en" : "ne";
  const langQ = isEnglish ? "?lang=en" : "";
  const items = articles.slice(0, 4);

  return (
    <section>
      <SectionHeader
        title={isEnglish ? "Opinions & Views" : "विचार र दृष्टिकोण"}
        href={`/category/opinion${langQ}`}
        linkLabel={isEnglish ? "More opinions" : "थप विचार"}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5">
        {items.map((art) => {
          const title = resolveArticleTitle(art, edition);
          const excerpt = resolveArticleExcerpt(art, edition);
          const when = formatTimeAgoNp(
            typeof art.createdAt === "string" ? new Date(art.createdAt) : art.createdAt
          );

          return (
            <Link key={art.id} href={`/article/${art.slug}${langQ}`} className="group block space-y-0.5">
              <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 group-hover:underline sm:text-base">
                {title}
              </h3>
              {excerpt?.trim() ? (
                <p className="line-clamp-2 text-xs leading-snug text-gray-500 sm:text-[13px]">
                  {excerpt}
                </p>
              ) : null}
              <time className="block pt-0.5 text-[10px] leading-none text-gray-400">{when}</time>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
