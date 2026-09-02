"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

interface BreakingItem {
  id: string;
  title: string;
  slug: string;
}

interface RawBreakingItem {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
}

export function BreakingTicker() {
  const [breakingList, setBreakingList] = useState<BreakingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch("/api/breaking")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBreakingList(
            json.data.map((item: RawBreakingItem) => ({
              id: item.id,
              title: item.titleNp || item.title,
              slug: item.slug,
            }))
          );
        } else {
          // Fallback to breaking articles
          fetch("/api/articles?type=BREAKING&limit=5")
            .then((r) => r.json())
            .then((j) => {
              if (j.success && Array.isArray(j.data.articles)) {
                setBreakingList(
                  j.data.articles.map((art: RawBreakingItem) => ({
                    id: art.id,
                    title: art.titleNp || art.title,
                    slug: art.slug,
                  }))
                );
              }
            })
            .catch(() => { });
        }
      })
      .catch(() => { });
  }, []);

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
      <div className="max-w-7xl mx-auto flex items-center h-11 px-4 gap-3">
        <div className="flex items-center gap-1.5 bg-rose-950/30 px-2.5 py-1.5 rounded-md border border-white/10 text-white font-black uppercase shrink-0">
          <Zap className="h-3.5 w-3.5 fill-white animate-pulse" />
          <span>LIVE</span>
        </div>

        <div
          className="flex-1 overflow-hidden relative h-6 flex items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Link
            href={`/article/${currentStory.slug}`}
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
