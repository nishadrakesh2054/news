"use client";

import { useMemo, useState } from "react";
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

type RatesBreakingBarProps = {
  items?: BreakingItem[];
};

/** Breaking ticker: marquee scroll; arrows restart from prev/next story. */
export function RatesBreakingBar({ items = [] }: RatesBreakingBarProps) {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";

  const [breaking] = useState<BreakingItem[]>(items);
  const [startIndex, setStartIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** Bumps so arrow clicks remount the marquee even if index wraps. */
  const [tickKey, setTickKey] = useState(0);

  const ordered = useMemo(() => {
    if (breaking.length === 0) return [];
    return [...breaking.slice(startIndex), ...breaking.slice(0, startIndex)];
  }, [breaking, startIndex]);

  const durationSec = Math.max(18, ordered.length * 8);

  const goPrev = () => {
    if (breaking.length <= 1) return;
    setStartIndex((i) => (i - 1 + breaking.length) % breaking.length);
    setTickKey((k) => k + 1);
  };

  const goNext = () => {
    if (breaking.length <= 1) return;
    setStartIndex((i) => (i + 1) % breaking.length);
    setTickKey((k) => k + 1);
  };

  if (breaking.length === 0) return null;

  const linkClass =
    "inline-flex items-center whitespace-nowrap px-4 py-0.5 text-xs font-medium leading-normal text-gray-900 hover:underline";

  const track = (
    <>
      {ordered.map((item) => (
        <Link key={`${tickKey}-${item.id}-a`} href={`/article/${item.slug}${langQ}`} className={linkClass}>
          {item.title}
        </Link>
      ))}
      {ordered.map((item) => (
        <Link
          key={`${tickKey}-${item.id}-b`}
          href={`/article/${item.slug}${langQ}`}
          className={linkClass}
          aria-hidden
          tabIndex={-1}
        >
          {item.title}
        </Link>
      ))}
    </>
  );

  return (
    <div className="w-full border-b border-gray-200 bg-white text-xs">
      <div className={`${PORTAL.container} flex items-center gap-2 py-1.5`}>
        <span
          className="inline-flex h-7 shrink-0 items-center gap-1 text-[11px] font-bold leading-none"
          style={{ color: PORTAL.accent }}
        >
          <Zap className="h-3 w-3 shrink-0" style={{ color: PORTAL.accent }} fill="currentColor" />
          {isEnglish ? "Breaking" : "ब्रेकिङ"}
        </span>

        <div
          className="relative min-h-7 min-w-0 flex-1 overflow-x-hidden overflow-y-visible py-0.5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {breaking.length === 1 ? (
            <Link
              href={`/article/${breaking[0].slug}${langQ}`}
              className="block truncate py-0.5 text-xs font-medium leading-normal text-gray-900 hover:underline"
              title={breaking[0].title}
            >
              {breaking[0].title}
            </Link>
          ) : (
            <div
              key={tickKey}
              className="portal-breaking-marquee flex w-max items-center"
              style={{
                ["--marquee-duration" as string]: `${durationSec}s`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {track}
            </div>
          )}
        </div>

        {breaking.length > 1 ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label={isEnglish ? "Previous" : "अघिल्लो"}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900"
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
