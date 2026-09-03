"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import {
  resolveArticleExcerpt,
  resolveArticleTitle,
  type LanguageEditionType,
} from "@/lib/language";
import { SectionHeader } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

type OpinionArticle = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptNp?: string | null;
  createdAt: Date | string;
  author?: {
    name?: string | null;
    image?: string | null;
  } | null;
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

  return (
    <section className="py-2">
      <SectionHeader
        title={isEnglish ? "Opinions & Views" : "विचार र दृष्टिकोण"}
        href={`/category/opinion${langQ}`}
        linkLabel={isEnglish ? "More opinions" : "थप विचार"}
      />

      <p className="-mt-2 mb-5 text-xs text-gray-500">
        {isEnglish
          ? "Analysis and commentary from our writers"
          : "विश्लेषण तथा स्तम्भकारका विचार"}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {articles.slice(0, 3).map((art) => {
          const title = resolveArticleTitle(art, edition);
          const excerpt = resolveArticleExcerpt(art, edition);
          const hasExcerpt = Boolean(excerpt?.trim());
          const authorName =
            art.author?.name?.trim() || (isEnglish ? "Editorial" : "सम्पादकीय");
          const when = formatTimeAgoNp(
            typeof art.createdAt === "string" ? new Date(art.createdAt) : art.createdAt
          );

          return (
            <Link
              key={art.id}
              href={`/article/${art.slug}${langQ}`}
              className="group relative flex flex-col justify-between overflow-hidden border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50/60"
            >
              <span
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: PORTAL.accent }}
                aria-hidden
              />

              <div className="space-y-3 pl-2">
                <span
                  className="block font-serif text-4xl leading-none select-none"
                  style={{ color: PORTAL.brand, opacity: 0.2 }}
                  aria-hidden
                >
                  “
                </span>

                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: PORTAL.brand }}
                >
                  {isEnglish ? "Opinion" : "विचार"}
                </span>

                <h3 className="line-clamp-3 text-base font-extrabold leading-snug text-gray-900 group-hover:underline sm:text-lg">
                  {title}
                </h3>

                {hasExcerpt ? (
                  <p className="line-clamp-3 text-xs italic leading-relaxed text-gray-600 sm:text-[13px]">
                    {excerpt}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4 pl-2">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-white"
                  style={{ backgroundColor: PORTAL.brand }}
                >
                  {art.author?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.author.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold" style={{ color: PORTAL.brand }}>
                    {authorName}
                  </span>
                  <span className="block text-[10px] text-gray-500">{when}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
