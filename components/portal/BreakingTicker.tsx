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

  useEffect(() => {
    fetch("/api/admin/breaking")
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
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (breakingList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [breakingList]);

  if (breakingList.length === 0) return null;

  const currentStory = breakingList[currentIndex];

  return (
    <div className="w-full bg-rose-600 text-white text-xs font-semibold select-none border-b border-rose-700">
      <div className="max-w-7xl mx-auto flex items-center h-10 px-4">
        {/* Red Breaking Badge */}
        <div className="flex items-center space-x-1.5 bg-rose-800 px-3 py-1.5 rounded-md text-white font-bold uppercase shrink-0 mr-3 shadow-xs">
          <Zap className="h-3.5 w-3.5 fill-white animate-pulse" />
          <span>ताजा खबर</span>
        </div>

        {/* Dynamic Story Title */}
        <div className="flex-1 overflow-hidden relative h-5 flex items-center">
          <Link
            href={`/article/${currentStory.slug}`}
            className="truncate hover:underline text-white/95 font-medium transition-all duration-300"
          >
            {currentStory.title}
          </Link>
        </div>

        {/* Counter Indicator */}
        <div className="hidden sm:flex items-center space-x-1 text-rose-200 font-mono text-[11px] shrink-0 ml-3">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{breakingList.length}</span>
        </div>
      </div>
    </div>
  );
}
