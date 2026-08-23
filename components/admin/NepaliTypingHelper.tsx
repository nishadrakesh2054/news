"use client";

import { useState } from "react";
import { Keyboard, Copy, Check } from "lucide-react";

// Romanized to Nepali Mapping Rules
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
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [copied, setCopied] = useState(false);

  const convertText = (text: string) => {
    let result = text;
    // Replace common words and phonetic patterns
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
    <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Keyboard className="h-4 w-4 text-[#027081]" />
          <span>नेपाली टाइपिङ सहयोगी (Romanized / Preeti Helper)</span>
        </h4>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
          Unicode Tool
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground mb-1">
            रोमन/अङ्ग्रेजी टाइप (Type Romanized):
          </label>
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="उदा. nepal samachar namaste..."
            className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-[#027081]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-foreground mb-1">
            रूपान्तरित युनिकोड (Converted Unicode):
          </label>
          <textarea
            rows={2}
            readOnly
            value={convertedText}
            placeholder="नेपाली युनिकोड यहाँ देखिनेछ..."
            className="w-full p-2.5 rounded-lg border border-border bg-muted/40 text-foreground font-bold text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#027081] text-white text-xs font-bold rounded-lg hover:bg-[#025a68] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "कपी भयो!" : "युनिकोड कपी गर्नुहोस्"}</span>
        </button>
      </div>
    </div>
  );
}
