"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Coins,
  DollarSign,
  Sparkles,
  CalendarRange,
  ChevronDown,
  X,
} from "lucide-react";
import { PORTAL } from "@/constants/portal";

interface RashiItem {
  name: string;
  symbol: string;
  prediction: string;
}

const DEFAULT_RASHIFAL: RashiItem[] = [
  { name: "मेष (Aries)", symbol: "♈", prediction: "आजको दिन कार्यक्षेत्रमा सफलता मिल्नेछ।" },
  { name: "वृष (Taurus)", symbol: "♉", prediction: "सामाजिक प्रतिष्ठा वृद्धि हुनेछ।" },
  { name: "मिथुन (Gemini)", symbol: "♊", prediction: "यात्राको अवसर प्राप्त हुनसक्छ।" },
  { name: "कर्कट (Cancer)", symbol: "♋", prediction: "अधुरा कामहरू पूरा हुनेछन्।" },
  { name: "सिंह (Leo)", symbol: "♌", prediction: "आत्मविश्वासमा वृद्धि हुनेछ।" },
  { name: "कन्या (Virgo)", symbol: "♍", prediction: "बौद्धिक कार्यमा सफलता मिल्नेछ।" },
  { name: "तुला (Libra)", symbol: "♎", prediction: "व्यापार व्यवसायमा प्रगति हुनेछ।" },
  { name: "वृश्चिक (Scorpio)", symbol: "♏", prediction: "पारिवारिक सुख प्राप्त हुनेछ।" },
  { name: "धनु (Sagittarius)", symbol: "♐", prediction: "काममा उत्साह रहनेछ।" },
  { name: "मकर (Capricorn)", symbol: "♑", prediction: "सकारात्मक विचारले अघि बढ्नुहोला।" },
  { name: "कुम्भ (Aquarius)", symbol: "♒", prediction: "रोकिएका कामहरू बन्नेछन्।" },
  { name: "मीन (Pisces)", symbol: "♓", prediction: "पढाइ र रचनात्मक काममा राम्रो नतिजा।" },
];

type TopbarUtilitiesMenuProps = {
  isEnglish: boolean;
};

/** Compact top-bar utilities: gold/silver/forex/rashifal/date converter. */
export function TopbarUtilitiesMenu({ isEnglish }: TopbarUtilitiesMenuProps) {
  const [open, setOpen] = useState(false);
  const [goldPrice, setGoldPrice] = useState("—");
  const [silverPrice, setSilverPrice] = useState("—");
  const [usdRate, setUsdRate] = useState("—");
  const [inrRate, setInrRate] = useState("—");
  const [rashifalData, setRashifalData] = useState<RashiItem[]>(DEFAULT_RASHIFAL);
  const [showRashifal, setShowRashifal] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState<RashiItem | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const langQ = isEnglish ? "?lang=en" : "";

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !json.data) return;
        const { forex, gold, rashifal } = json.data;
        if (gold?.fine) setGoldPrice(gold.fine);
        if (gold?.silver) setSilverPrice(gold.silver);
        if (forex?.usd) setUsdRate(forex.usd);
        if (forex?.inr) setInrRate(forex.inr);
        if (Array.isArray(rashifal) && rashifal.length) setRashifalData(rashifal);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/25"
          aria-expanded={open}
          title={isEnglish ? "Rates & utilities" : "दर तथा उपयोगी सेवा"}
        >
          <Coins className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isEnglish ? "Rates" : "दर / राशि"}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div className="absolute right-0 top-full z-50 mt-1.5 w-[min(92vw,20rem)] border border-gray-200 bg-white text-gray-900 shadow-lg">
            <div className="border-b border-gray-100 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
              {isEnglish ? "Market & utilities" : "बजार र उपयोगी सेवा"}
            </div>

            <ul className="divide-y divide-gray-100 text-xs">
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                  <Coins className="h-3.5 w-3.5" style={{ color: PORTAL.brand }} />
                  {isEnglish ? "Gold" : "सुन"}
                </span>
                <span className="font-mono font-bold text-gray-900">रु. {goldPrice}</span>
              </li>
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                  <Coins className="h-3.5 w-3.5 text-amber-600" />
                  {isEnglish ? "Silver" : "चाँदी"}
                </span>
                <span className="font-mono font-bold text-gray-900">रु. {silverPrice}</span>
              </li>
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  USD
                </span>
                <span className="font-mono font-bold text-gray-900">रु. {usdRate}</span>
              </li>
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  INR (१००)
                </span>
                <span className="font-mono font-bold text-gray-900">रु. {inrRate}</span>
              </li>
            </ul>

            <div className="space-y-1 border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowRashifal(true);
                }}
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-bold hover:bg-gray-50"
                style={{ color: PORTAL.brand }}
              >
                <Sparkles className="h-4 w-4" />
                {isEnglish ? "Today's Horoscope" : "आजको राशिफल"}
              </button>
              <Link
                href={`/forex${langQ}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-2 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
              >
                <DollarSign className="h-4 w-4" style={{ color: PORTAL.brand }} />
                {isEnglish ? "Forex / money rates" : "मुद्रा दर (Forex)"}
              </Link>
              <Link
                href={`/gold-rate${langQ}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-2 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
              >
                <Coins className="h-4 w-4" style={{ color: PORTAL.brand }} />
                {isEnglish ? "Gold & silver page" : "सुन–चाँदी पृष्ठ"}
              </Link>
              <Link
                href={`/bs-date-converter${langQ}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-2 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
              >
                <CalendarRange className="h-4 w-4" style={{ color: PORTAL.brand }} />
                {isEnglish ? "BS date converter" : "मिति रूपान्तरण"}
              </Link>
              <Link
                href={`/rashifal${langQ}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-2 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
              >
                <Sparkles className="h-4 w-4" style={{ color: PORTAL.accent }} />
                {isEnglish ? "Full horoscope page" : "पूर्ण राशिफल"}
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {showRashifal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-gray-200 bg-white p-5 text-gray-900">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-extrabold" style={{ color: PORTAL.brand }}>
                {isEnglish ? "Daily Horoscope" : "आजको राशिफल"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRashifal(false);
                  setSelectedRashi(null);
                }}
                className="p-1 text-gray-500 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {rashifalData.map((rashi) => {
                const selected = selectedRashi?.name === rashi.name;
                return (
                  <button
                    key={rashi.name}
                    type="button"
                    onClick={() => setSelectedRashi(rashi)}
                    className={`flex flex-col items-center border p-3 text-center ${
                      selected ? "text-white" : "border-gray-200 bg-white text-gray-900"
                    }`}
                    style={selected ? { backgroundColor: PORTAL.brand, borderColor: PORTAL.brand } : undefined}
                  >
                    <span className="mb-1 text-xl">{rashi.symbol}</span>
                    <span className="text-xs font-bold leading-tight">{rashi.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedRashi ? (
              <div className="mt-4 border border-gray-200 p-4" style={{ backgroundColor: PORTAL.surface }}>
                <h4 className="mb-1 text-sm font-extrabold" style={{ color: PORTAL.brand }}>
                  {selectedRashi.symbol} {selectedRashi.name}
                </h4>
                <p className="text-sm leading-relaxed text-gray-800">{selectedRashi.prediction}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
