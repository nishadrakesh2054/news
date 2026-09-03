"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Coins, DollarSign, CalendarRange, ChevronDown } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type TopbarUtilitiesMenuProps = {
  isEnglish: boolean;
};

/** Compact top-bar utilities: gold/silver/forex/date converter (rashifal lives above footer). */
export function TopbarUtilitiesMenu({ isEnglish }: TopbarUtilitiesMenuProps) {
  const [open, setOpen] = useState(false);
  const [goldPrice, setGoldPrice] = useState("—");
  const [silverPrice, setSilverPrice] = useState("—");
  const [usdRate, setUsdRate] = useState("—");
  const [inrRate, setInrRate] = useState("—");
  const wrapRef = useRef<HTMLDivElement>(null);

  const langQ = isEnglish ? "?lang=en" : "";

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !json.data) return;
        const { forex, gold } = json.data;
        if (gold?.fine) setGoldPrice(gold.fine);
        if (gold?.silver) setSilverPrice(gold.silver);
        if (forex?.usd) setUsdRate(forex.usd);
        if (forex?.inr) setInrRate(forex.inr);
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
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/25"
        aria-expanded={open}
        title={isEnglish ? "Rates & utilities" : "दर तथा उपयोगी सेवा"}
      >
        <Coins className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isEnglish ? "Rates" : "दर"}</span>
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
