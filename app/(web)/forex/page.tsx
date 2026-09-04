"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { PORTAL } from "@/constants/portal";

interface ForexCurrencyRate {
  code: string;
  nameNp: string;
  unit: number;
  buy: string;
  sell: string;
}

const FLAG_MAP: Record<string, string> = {
  USD: "🇺🇸",
  INR: "🇮🇳",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  JPY: "🇯🇵",
  QAR: "🇶🇦",
  AED: "🇦🇪",
  SAR: "🇸🇦",
  MYR: "🇲🇾",
  KRW: "🇰🇷",
  KWD: "🇰🇼",
  BHD: "🇧🇭",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  SGD: "🇸🇬",
};

export default function ForexPage() {
  const [forexRates, setForexRates] = useState<ForexCurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.allForexRates) {
          setForexRates(json.data.allForexRates);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="w-full bg-white pb-14 text-gray-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:underline" style={{ color: PORTAL.brand }}>
            गृह
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            विदेशी विनिमय दर
          </span>
        </nav>

        <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight sm:text-2xl"
              style={{ color: PORTAL.brand }}
            >
              विदेशी विनिमय दर
            </h1>
            <p className="mt-1 text-[13px] text-gray-600">
              नेपाल राष्ट्र बैंक · खरिद / बिक्री · {nepaliDateStr}
            </p>
          </div>
        </header>

        {loading ? (
          <p className="py-10 text-sm text-gray-400">दररेट लोड हुँदैछ…</p>
        ) : forexRates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${PORTAL.rule}` }}>
                  <th
                    className="w-8 py-2 pr-2 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: PORTAL.accent }}
                  >
                    #
                  </th>
                  <th
                    className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: PORTAL.accent }}
                  >
                    मुद्रा
                  </th>
                  <th
                    className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: PORTAL.accent }}
                  >
                    इकाई
                  </th>
                  <th
                    className="py-2 pr-3 text-right text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: PORTAL.accent }}
                  >
                    खरिद (रु.)
                  </th>
                  <th
                    className="py-2 text-right text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: PORTAL.accent }}
                  >
                    बिक्री (रु.)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forexRates.map((rate, idx) => (
                  <tr key={rate.code ? `${rate.code}-${idx}` : `forex-${idx}`}>
                    <td className="py-2 pr-2 tabular-nums text-gray-400">{idx + 1}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm leading-none" aria-hidden>
                          {FLAG_MAP[rate.code] || "🌐"}
                        </span>
                        <span className="font-bold" style={{ color: PORTAL.ink }}>
                          {rate.code}
                        </span>
                        <span className="truncate text-[12px] text-gray-500">
                          {rate.nameNp}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-gray-600">{rate.unit}</td>
                    <td
                      className="py-2 pr-3 text-right font-semibold tabular-nums"
                      style={{ color: PORTAL.brand }}
                    >
                      {rate.buy}
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums text-gray-800">
                      {rate.sell}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
            विनिमय दर अहिले उपलब्ध छैन।
          </p>
        )}

        <p className="mt-5 text-[12px] text-gray-400">
          स्रोत: नेपाल राष्ट्र बैंक। दररेट सन्दर्भका लागि मात्र।
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link
            href="/gold-rate"
            className="font-medium hover:underline"
            style={{ color: PORTAL.brand }}
          >
            सुन चाँदी दर →
          </Link>
          <Link
            href="/bs-date-converter"
            className="font-medium hover:underline"
            style={{ color: PORTAL.brand }}
          >
            मिति रूपान्तरण →
          </Link>
        </div>
      </div>
    </main>
  );
}
