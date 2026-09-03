"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

interface BreakingItem {
  id: string;
  title: string;
  slug: string;
}

/** Breaking news ticker — marquee text; rates/utilities live in the top bar. */
export function RatesBreakingBar() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";

  const [breaking, setBreaking] = useState<BreakingItem[]>([]);
  const [breakingIndex, setBreakingIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch(`/api/breaking${langQ}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBreaking(
            json.data.map(
              (item: {
                id: string;
                title: string;
                titleNp?: string;
                displayTitle?: string;
                slug: string;
              }) => ({
                id: item.id,
                title: item.displayTitle || item.titleNp || item.title,
                slug: item.slug,
              })
            )
          );
          setBreakingIndex(0);
        }
      })
      .catch(() => {});
  }, [langQ]);

  useEffect(() => {
    if (breaking.length <= 1 || paused) return;
    const id = setInterval(() => {
      setBreakingIndex((i) => (i + 1) % breaking.length);
    }, 8000);
    return () => clearInterval(id);
  }, [breaking.length, paused]);

  if (breaking.length === 0) return null;

  const current = breaking[breakingIndex];
  const marqueeItems = [...breaking, ...breaking];
  const durationSec = Math.max(36, breaking.length * 14);

  const goPrev = () => {
    setPaused(true);
    setBreakingIndex((i) => (i - 1 + breaking.length) % breaking.length);
  };

  const goNext = () => {
    setPaused(true);
    setBreakingIndex((i) => (i + 1) % breaking.length);
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white text-xs">
      <div className={`${PORTAL.container} flex items-center gap-2 py-1`}>
        {/* Fixed width so EN/NE labels don’t resize the badge; compact like a ticker chip */}
        <span
          className="inline-flex h-6 w-[6.25rem] shrink-0 items-center justify-center gap-1 px-2 text-[11px] font-bold leading-none text-white"
          style={{ backgroundColor: PORTAL.accent }}
        >
          <Zap className="h-3 w-3 shrink-0 fill-white" />
          {isEnglish ? "Breaking" : "ब्रेकिङ"}
        </span>

        <div
          className="relative h-6 min-w-0 flex-1 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="portal-breaking-marquee flex h-full w-max items-center gap-8 whitespace-nowrap"
            style={{
              ["--marquee-duration" as string]: `${durationSec}s`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {marqueeItems.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={`/article/${item.slug}${langQ}`}
                className={`inline-flex items-center text-xs font-medium leading-6 text-gray-800 hover:underline ${
                  item.id === current.id ? "text-gray-950" : "text-gray-700"
                }`}
              >
                <span
                  className="mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: PORTAL.accent }}
                />
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        {breaking.length > 1 ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-6 w-6 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label={isEnglish ? "Previous" : "अघिल्लो"}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-6 w-6 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label={isEnglish ? "Next" : "अर्को"}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
