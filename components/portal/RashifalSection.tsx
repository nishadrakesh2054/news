"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import {
  DEFAULT_DETAILED_RASHIFAL,
  RASHI_LETTERS,
  type DetailedRashi,
} from "@/lib/rashifal";
import { PORTAL } from "@/constants/portal";

type RashiCard = {
  name: string;
  enName?: string;
  slug: string;
  symbol: string;
  letters: string;
};

function normalizeRashiList(raw: unknown): RashiCard[] {
  const fallback = DEFAULT_DETAILED_RASHIFAL.map((r) => ({
    name: r.name,
    enName: r.enName,
    slug: r.slug,
    symbol: r.symbol,
    letters: RASHI_LETTERS[r.name] || "",
  }));

  if (!Array.isArray(raw) || raw.length === 0) return fallback;

  return fallback.map((base, index) => {
    const item = raw[index] as Partial<DetailedRashi> & {
      name?: string;
      symbol?: string;
      slug?: string;
    };
    const name = (item?.name || base.name).replace(/\s*\(.*\)\s*$/, "").trim();
    const shortName = name.split(" ")[0] || base.name;
    return {
      name: shortName,
      enName: item?.enName || base.enName,
      slug: item?.slug || base.slug,
      symbol: item?.symbol || base.symbol,
      letters: RASHI_LETTERS[shortName] || RASHI_LETTERS[base.name] || base.letters,
    };
  });
}

/** Homepage/footer राशिफल grid — 12 rashis from /api/utilities. */
export function RashifalSection() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";

  const [rashis, setRashis] = useState<RashiCard[]>(() => normalizeRashiList(null));
  const [dateLabel] = useState(() => getFormattedNepaliDate());

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.rashifal)) {
          setRashis(normalizeRashiList(json.data.rashifal));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      className="w-full border-t"
      style={{
        backgroundColor: "rgba(25, 87, 166, 0.06)",
        borderColor: "rgba(25, 87, 166, 0.12)",
      }}
    >
      <div className={`${PORTAL.container} py-8 sm:py-10`}>
        <div className="mb-2 flex items-center gap-3">
          <h2
            className="shrink-0 text-xl font-extrabold tracking-tight whitespace-nowrap sm:text-2xl"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Horoscope" : "राशिफल"}
          </h2>
          <div
            className="h-px min-w-4 flex-1"
            style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
          />
          <Link
            href={`/rashifal${langQ}`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold whitespace-nowrap hover:underline sm:text-sm"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Details" : "विस्तृत"}
            <span aria-hidden>↗</span>
          </Link>
        </div>
        <p className="mb-5 text-sm font-medium text-gray-600">{dateLabel}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
          {rashis.map((rashi) => (
            <Link
              key={rashi.slug || rashi.name}
              href={`/rashifal/${rashi.slug}${langQ}`}
              className="flex flex-col items-center border bg-white px-2 py-4 text-center transition-colors hover:bg-white/90 sm:px-3 sm:py-5"
              style={{ borderColor: "rgba(25, 87, 166, 0.18)" }}
            >
              <span
                className="mb-2 text-3xl leading-none sm:text-4xl"
                style={{ color: PORTAL.brand }}
                aria-hidden
              >
                {rashi.symbol}
              </span>
              <span className="text-sm font-bold sm:text-[15px]" style={{ color: PORTAL.brand }}>
                {isEnglish && rashi.enName ? rashi.enName : `${rashi.name} राशि`}
              </span>
              {rashi.letters ? (
                <span className="mt-2 line-clamp-2 text-[10px] leading-snug text-gray-500 sm:text-[11px]">
                  {rashi.letters}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
