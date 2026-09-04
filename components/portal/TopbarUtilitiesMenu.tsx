"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Coins, DollarSign, CalendarRange, ChevronDown, Newspaper, Sparkles } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type TopbarUtilitiesMenuProps = {
  isEnglish: boolean;
};

/** Compact top-bar utilities menu — links to rates, date converter, and rashifal. */
export function TopbarUtilitiesMenu({ isEnglish }: TopbarUtilitiesMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const langQ = isEnglish ? "?lang=en" : "";

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

  const links = [
    {
      href: `/forex${langQ}`,
      icon: DollarSign,
      label: isEnglish ? "Forex / money rates" : "मुद्रा दर (Forex)",
    },
    {
      href: `/gold-rate${langQ}`,
      icon: Coins,
      label: isEnglish ? "Gold & silver" : "सुन–चाँदी दर",
    },
    {
      href: `/rashifal${langQ}`,
      icon: Sparkles,
      label: isEnglish ? "Horoscope" : "राशिफल",
    },
    {
      href: `/bs-date-converter${langQ}`,
      icon: CalendarRange,
      label: isEnglish ? "BS date converter" : "मिति रूपान्तरण",
    },
    {
      href: `/epaper${langQ}`,
      icon: Newspaper,
      label: isEnglish ? "E-Paper" : "इ-पत्रिका",
    },
  ];

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
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[min(92vw,16rem)] border border-gray-200 bg-white text-gray-900 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
            {isEnglish ? "Utilities" : "उपयोगी सेवा"}
          </div>
          <div className="p-1.5">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2 px-2 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: PORTAL.brand }} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
