"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

type TagItem = {
  id: string;
  name: string;
  nameNp?: string | null;
  slug: string;
  articlesCount?: number;
};

type TrendingHashtagsProps = {
  tags?: TagItem[];
};

export function TrendingHashtags({ tags = [] }: TrendingHashtagsProps) {
  const searchParams = useSearchParams();
  const isEnglish =
    searchParams.get("lang") === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";
  const shown = tags.slice(0, 10);

  if (shown.length === 0) return null;

  return (
    <div className="hidden w-full border-b border-gray-200 bg-white py-2.5 md:block">
      <div className={`${PORTAL.container} flex items-center gap-3 overflow-x-auto scrollbar-none text-xs`}>
        <span className="shrink-0 font-extrabold" style={{ color: PORTAL.brand }}>
          {isEnglish ? "Trending Topics:" : "ट्रेन्डिङ विषय:"}
        </span>
        <div className="flex items-center gap-2 whitespace-nowrap">
          {shown.map((tag) => {
            const label = (isEnglish ? tag.name || tag.nameNp : tag.nameNp || tag.name) || tag.slug;
            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}${langQ}`}
                className="rounded border border-[#1957A6]/15 px-2.5 py-1 font-medium text-[#1957A6]/80 hover:border-[#1957A6]/35 hover:bg-[#1957A6]/5 hover:text-[#1957A6]"
              >
                #{label.replace(/^#/, "")}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
