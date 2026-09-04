"use client";

import { useEffect, useState } from "react";
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

export function TrendingHashtags() {
  const searchParams = useSearchParams();
  const isEnglish =
    searchParams.get("lang") === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";
  const [tags, setTags] = useState<TagItem[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTags(json.data.slice(0, 10));
        }
      })
      .catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="w-full border-b border-gray-200 bg-white py-2.5">
      <div className={`${PORTAL.container} flex items-center gap-3 overflow-x-auto scrollbar-none text-xs`}>
        <span className="shrink-0 font-extrabold" style={{ color: PORTAL.brand }}>
          {isEnglish ? "Trending Topics:" : "ट्रेन्डिङ विषय:"}
        </span>
        <div className="flex items-center gap-2 whitespace-nowrap">
          {tags.map((tag) => {
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
