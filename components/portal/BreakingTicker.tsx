"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";

interface BreakingItem {
  id: string;
  title: string;
  slug: string;
}

interface RawBreakingItem {
  id: string;
  title: string;
  titleNp?: string | null;
  displayTitle?: string;
  slug: string;
}

export function BreakingTicker() {
  const [breakingList, setBreakingList] = useState<BreakingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const searchParams = useSearchParams();

  const langParam = searchParams.get("lang");
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isEnglish = langParam === "en" || isEnglishHostname(hostname);
  const langQuery = isEnglish ? "?lang=en" : "";
  const langQs = isEnglish ? "?lang=en" : "";

  useEffect(() => {
    const mapItems = (items: RawBreakingItem[]) =>
      items.map((item) => ({
        id: item.id,
        title: item.displayTitle || item.titleNp || item.title,
        slug: item.slug,
      }));

    fetch(`/api/breaking${langQs}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBreakingList(mapItems(json.data));
        } else {
          fetch(`/api/articles?type=BREAKING&limit=5${isEnglish ? "&lang=en" : ""}`)
            .then((r) => r.json())
            .then((j) => {
              if (j.success && Array.isArray(j.data.articles)) {
                setBreakingList(mapItems(j.data.articles));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [isEnglish, langQs]);

  useEffect(() => {
    if (breakingList.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [breakingList, isPaused]);

  if (breakingList.length === 0) return null;

  const currentStory = breakingList[currentIndex];

  return (
    <div className="w-full bg-linear-to-r from-rose-700 via-rose-600 to-red-500 text-white text-xs font-semibold select-none border-b border-rose-800 shadow-[0_2px_12px_rgba(225,29,72,0.18)]">
      <div className="mx-auto flex h-11 max-w-[1280px] items-center gap-3 px-4 sm:px-5">
        <div className="flex shrink-0 items-center gap-1.5 border border-white/15 bg-black/20 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
          <Zap className="h-3.5 w-3.5 fill-white animate-pulse" />
          <span>{isEnglish ? "Breaking" : "ब्रेकिङ"}</span>
        </div>

        <div
          className="flex-1 overflow-hidden relative h-6 flex items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Link
            href={`/article/${currentStory.slug}${langQuery}`}
            className="truncate hover:underline text-white/95 font-medium transition-all duration-300"
          >
            {currentStory.title}
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-100 shrink-0">
          <span className="rounded-full bg-white/10 px-1.5 py-0.5">{currentIndex + 1}</span>
          <span>/</span>
          <span>{breakingList.length}</span>
        </div>
      </div>
    </div>
  );
}
