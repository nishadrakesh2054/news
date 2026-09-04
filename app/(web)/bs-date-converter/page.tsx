"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BS_MONTHS_NP,
  BS_START_YEAR,
  BS_END_YEAR,
  daysInBsMonth,
  formatLocalDateInput,
  getBikramSambatDate,
  getBikramSambatFromBs,
  parseLocalDateInput,
  toNepaliDigits,
} from "@/lib/bs-calendar";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

type Mode = "ad-to-bs" | "bs-to-ad";

export default function BSDateConverterPage() {
  const today = useMemo(() => new Date(), []);
  const todayBs = useMemo(() => getBikramSambatDate(today), [today]);

  const [mode, setMode] = useState<Mode>("ad-to-bs");
  const [adInput, setAdInput] = useState(() => formatLocalDateInput(today));
  const [bsYear, setBsYear] = useState(todayBs.year);
  const [bsMonth, setBsMonth] = useState(todayBs.month);
  const [bsDay, setBsDay] = useState(todayBs.day);
  const conversion = useMemo(() => {
    try {
      if (mode === "ad-to-bs") {
        const date = parseLocalDateInput(adInput);
        if (!date) {
          return { error: "अमान्य अंग्रेजी मिति", result: null as null };
        }
        const info = getBikramSambatDate(date);
        return { error: null as string | null, result: { info, adLabel: info.formattedAd } };
      }
      const day = Math.min(bsDay, daysInBsMonth(bsYear, bsMonth));
      const info = getBikramSambatFromBs(bsYear, bsMonth, day);
      return { error: null as string | null, result: { info, adLabel: info.formattedAd } };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "रूपान्तरण असफल",
        result: null as null,
      };
    }
  }, [mode, adInput, bsYear, bsMonth, bsDay]);

  const result = conversion.result;
  const error = conversion.error;

  const maxBsDay = daysInBsMonth(bsYear, bsMonth);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = BS_END_YEAR; y >= BS_START_YEAR; y--) list.push(y);
    return list;
  }, []);

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:underline" style={{ color: PORTAL.brand }}>
            गृह
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            मिति रूपान्तरण
          </span>
        </nav>

        <header className="mb-8 max-w-2xl">
          <h1
            className="text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: PORTAL.brand }}
          >
            मिति रूपान्तरण
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            अंग्रेजी मिति (A.D.) र नेपाली बि.सं. (B.S.) बीच रूपान्तरण —{" "}
            {toNepaliDigits(BS_START_YEAR)}–{toNepaliDigits(BS_END_YEAR)} बि.सं.
          </p>
        </header>

        <div className="mb-6 flex gap-1" role="tablist" aria-label="Conversion direction">
          {(
            [
              { key: "ad-to-bs" as const, label: "A.D. → बि.सं." },
              { key: "bs-to-ad" as const, label: "बि.सं. → A.D." },
            ] as const
          ).map((tab) => {
            const active = mode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(tab.key)}
                className="border-b-2 px-3 py-2.5 text-sm transition-colors"
                style={{
                  color: active ? PORTAL.brand : PORTAL.muted,
                  fontWeight: active ? 700 : 500,
                  borderBottomColor: active ? PORTAL.accent : "transparent",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-2">
          <section>
            <h2
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: PORTAL.accent }}
            >
              {mode === "ad-to-bs" ? "English date (A.D.)" : "नेपाली मिति (बि.सं.)"}
            </h2>

            {mode === "ad-to-bs" ? (
              <input
                type="date"
                value={adInput}
                min="1943-04-14"
                max="2034-04-13"
                onChange={(e) => setAdInput(e.target.value)}
                className="w-full border-0 border-b bg-transparent py-2.5 text-base outline-none"
                style={{ borderColor: PORTAL.rule, color: PORTAL.ink }}
              />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] text-gray-400">वर्ष</span>
                  <select
                    value={bsYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setBsYear(y);
                      const max = daysInBsMonth(y, bsMonth);
                      if (bsDay > max) setBsDay(max);
                    }}
                    className="w-full border-0 border-b bg-transparent py-2 text-sm outline-none"
                    style={{ borderColor: PORTAL.rule }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y} ({toNepaliDigits(y)})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-gray-400">महिना</span>
                  <select
                    value={bsMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setBsMonth(m);
                      const max = daysInBsMonth(bsYear, m);
                      if (bsDay > max) setBsDay(max);
                    }}
                    className="w-full border-0 border-b bg-transparent py-2 text-sm outline-none"
                    style={{ borderColor: PORTAL.rule }}
                  >
                    {BS_MONTHS_NP.map((name, i) => (
                      <option key={name} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-gray-400">गते</span>
                  <select
                    value={Math.min(bsDay, maxBsDay)}
                    onChange={(e) => setBsDay(Number(e.target.value))}
                    className="w-full border-0 border-b bg-transparent py-2 text-sm outline-none"
                    style={{ borderColor: PORTAL.rule }}
                  >
                    {Array.from({ length: maxBsDay }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {toNepaliDigits(d)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {error ? (
              <p className="mt-3 text-[13px]" style={{ color: PORTAL.accent }}>
                {error}
              </p>
            ) : null}
          </section>

          <section>
            <h2
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: PORTAL.accent }}
            >
              नतिजा
            </h2>
            {result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-gray-400">बि.सं.</p>
                  <p
                    className="mt-1 text-xl font-extrabold sm:text-2xl"
                    style={{ color: PORTAL.brand }}
                  >
                    {result.info.formattedBs}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {result.info.monthEn} {result.info.day}, {result.info.year}
                  </p>
                </div>
                <div style={{ borderTop: `1px solid ${PORTAL.rule}` }} className="pt-4">
                  <p className="text-[11px] text-gray-400">A.D.</p>
                  <p className="mt-1 text-base font-semibold" style={{ color: PORTAL.ink }}>
                    {result.adLabel}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-3 pt-1 text-sm">
                  <div>
                    <dt className="text-[11px] text-gray-400">बार</dt>
                    <dd className="font-medium">{result.info.dayOfWeekNp}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-gray-400">Weekday</dt>
                    <dd className="font-medium">{result.info.dayOfWeekEn}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-gray-400">मिति छान्नुहोस्</p>
            )}
          </section>
        </div>

        <div className="mt-10 max-w-2xl">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: PORTAL.accent }}
          >
            आजको मिति
          </p>
          <p className="mt-1 text-base font-extrabold sm:text-lg" style={{ color: PORTAL.brand }}>
            {todayBs.formattedBs}
          </p>
          <p className="mt-0.5 text-sm text-gray-600">{todayBs.formattedAd}</p>
        </div>
      </PortalContainer>
    </main>
  );
}
