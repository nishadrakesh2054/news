"use client";

import { useState } from "react";
import { Keyboard, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { adminBtnPrimary, adminInput, adminPanel } from "@/constants/admin-layout";

const romanMap: Record<string, string> = {
  a: "अ",
  aa: "आ",
  i: "इ",
  ee: "ई",
  u: "उ",
  oo: "ऊ",
  e: "ए",
  ai: "ऐ",
  o: "ओ",
  au: "औ",
  ka: "क",
  kha: "ख",
  ga: "ग",
  gha: "घ",
  cha: "च",
  chha: "छ",
  ja: "ज",
  jha: "झ",
  ta: "त",
  tha: "थ",
  da: "द",
  dha: "ध",
  na: "न",
  pa: "प",
  pha: "फ",
  fa: "फ",
  ba: "ब",
  bha: "भ",
  ma: "म",
  ya: "य",
  ra: "र",
  la: "ल",
  wa: "व",
  sha: "श",
  sa: "स",
  ha: "ह",
  nepal: "नेपाल",
  samachar: "समाचार",
  namaste: "नमस्ते",
  kathmandu: "काठमाडौँ",
  sarkar: "सरकार",
  desh: "देश",
  bikas: "विकास",
  raajneeti: "राजनीति",
};

export function NepaliTypingHelper() {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [copied, setCopied] = useState(false);

  const convertText = (text: string) => {
    let result = text;
    Object.keys(romanMap).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      result = result.replace(regex, romanMap[key]);
    });
    setConvertedText(result);
  };

  const handleInput = (val: string) => {
    setInputText(val);
    convertText(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedText || inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={adminPanel}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Keyboard className="h-3.5 w-3.5 text-[#0C4EA0]" />
          Nepali typing helper
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border/70 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Roman input
              </label>
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="e.g. nepal samachar…"
                className={`${adminInput} min-h-14 w-full resize-y py-2`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Unicode output
              </label>
              <textarea
                rows={2}
                readOnly
                value={convertedText}
                placeholder="Converted Nepali text…"
                className={`${adminInput} min-h-14 w-full resize-none bg-muted/30 py-2 font-semibold`}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleCopy} className={adminBtnPrimary}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy Unicode"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
