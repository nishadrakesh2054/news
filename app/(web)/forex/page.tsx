"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, ChevronRight, ShieldCheck, Globe } from "lucide-react";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";

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
    <main className="w-full bg-background pb-16 select-none">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
          <Link href="/" className="hover:text-[#027081]">गृह</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#027081] font-bold">विदेशी विनिमय दर (Forex Rates)</span>
        </nav>

        <header className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#027081]">
              <Globe className="h-7 w-7 text-[#027081]" />
              <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
                नेपाल राष्ट्र बैंक - विदेशी विनिमय दर सूची
              </h1>
            </div>
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>NRB Official API Live</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            आज मिति {nepaliDateStr} का लागि नेपाल राष्ट्र बैंकद्वारा प्रकाशित सबै देशका मुद्रा खरीद तथा बिक्री विनिमय दररेट।
          </p>
        </header>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#027081]" />
            <p>विदेशी विनिमय दर अद्यावधिक हुँदैछ...</p>
          </div>
        ) : forexRates.length > 0 ? (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#027081] text-white uppercase text-[11px] font-bold font-mono">
                <tr>
                  <th className="p-4">क्र.सं.</th>
                  <th className="p-4">मुद्रा (Currency Name)</th>
                  <th className="p-4">इकाई (Unit)</th>
                  <th className="p-4">खरिद दर (Buying Rate NRs)</th>
                  <th className="p-4 text-right">बिक्री दर (Selling Rate NRs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {forexRates.map((rate, idx) => {
                  const flagEmoji = FLAG_MAP[rate.code] || "🌐";
                  return (
                    <tr key={rate.code ? `${rate.code}-${idx}` : `forex-${idx}`} className="hover:bg-muted/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="p-4 font-bold text-foreground flex items-center space-x-2.5">
                        <span className="text-xl shrink-0">{flagEmoji}</span>
                        <span>{rate.nameNp}</span>
                      </td>
                      <td className="p-4 font-mono font-bold">{rate.unit}</td>
                      <td className="p-4 font-extrabold text-[#027081]">रु. {rate.buy}</td>
                      <td className="p-4 font-bold text-right text-emerald-600 dark:text-emerald-400">
                        रु. {rate.sell}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
            विनिमय दर अद्यावधिक गरिँदैछ।
          </div>
        )}
      </div>
    </main>
  );
}
