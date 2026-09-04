"use client";

import { useState } from "react";
import {
  RASHIFAL_PERIODS,
  getPeriodForecast,
  type DetailedRashi,
  type RashifalPeriodKey,
} from "@/lib/rashifal";
import { PORTAL } from "@/constants/portal";

const ASPECTS: {
  key: "overview" | "health" | "business" | "love" | "remedy";
  labelNp: string;
  labelEn: string;
}[] = [
  { key: "overview", labelNp: "समग्र फल", labelEn: "Overview" },
  { key: "health", labelNp: "स्वास्थ्य", labelEn: "Health" },
  { key: "business", labelNp: "व्यापार / अर्थ", labelEn: "Business" },
  { key: "love", labelNp: "प्रेम / सम्बन्ध", labelEn: "Love" },
  { key: "remedy", labelNp: "ज्योतिषीय उपाय", labelEn: "Remedy" },
];

type Props = {
  rashi: DetailedRashi;
  isEnglish: boolean;
};

export function RashiPeriodTabs({ rashi, isEnglish }: Props) {
  const [period, setPeriod] = useState<RashifalPeriodKey>("today");
  const forecast = getPeriodForecast(rashi, period);

  return (
    <div>
      <div
        className="-mx-1 flex gap-1 overflow-x-auto"
        style={{ borderBottom: `1px solid ${PORTAL.rule}` }}
        role="tablist"
        aria-label={isEnglish ? "Horoscope period" : "राशिफल अवधि"}
      >
        {RASHIFAL_PERIODS.map((p) => {
          const active = period === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPeriod(p.key)}
              className="shrink-0 border-b-2 px-3 py-3 text-[13px] tracking-wide transition-colors sm:px-4 sm:text-sm"
              style={{
                color: active ? PORTAL.brand : PORTAL.muted,
                fontWeight: active ? 700 : 500,
                borderBottomColor: active ? PORTAL.accent : "transparent",
                marginBottom: "-1px",
              }}
            >
              {isEnglish ? p.labelEn : p.labelNp}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-7">
        {ASPECTS.map((aspect) => {
          const text = forecast[aspect.key];
          if (!text) return null;
          const isRemedy = aspect.key === "remedy";
          return (
            <article key={aspect.key}>
              <h3
                className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: isRemedy ? PORTAL.accent : PORTAL.brand }}
              >
                {isEnglish ? aspect.labelEn : aspect.labelNp}
              </h3>
              <p className="max-w-2xl text-[15px] leading-[1.75] text-gray-700 sm:text-base">
                {text}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
