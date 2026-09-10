"use client";

import { useState } from "react";
import Link from "next/link";
import { Type, Copy, Check, ChevronRight } from "lucide-react";
import { romanToNepali } from "@/lib/roman-to-nepali";

export default function UnicodeConverterPage() {
  const [romanText, setRomanText] = useState("");
  const [copied, setCopied] = useState(false);

  const unicodeText = romanToNepali(romanText);

  const handleCopy = () => {
    navigator.clipboard.writeText(unicodeText || romanText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="w-full bg-background pb-16 select-none">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
          <Link href="/" className="hover:text-[#027081]">
            गृह
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#027081] font-bold">नेपाली युनिकोड टाइप औजार</span>
        </nav>

        <header className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center space-x-2 text-[#027081]">
            <Type className="h-6 w-6" />
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
              नेपाली युनिकोड रूपान्तरक
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            रोमन अक्षरमा लेख्नुहोस् र स्वचालित रूपमा शुद्ध नेपाली युनिकोड प्राप्त गर्नुहोस्।
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>रोमन लेखाइ:</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                उदा: nepal samachar hami haru
              </span>
            </label>
            <textarea
              rows={8}
              value={romanText}
              onChange={(e) => setRomanText(e.target.value)}
              placeholder="यहाँ लेख्नुहोस् (उदा: namaste nepal)…"
              className="w-full rounded-2xl border border-input bg-card p-4 text-sm text-foreground focus:border-[#027081] outline-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#027081] font-serif">नेपाली नतिजा:</label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1 bg-[#027081] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#025c6a] transition-all cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "प्रतिलिपि भयो!" : "प्रतिलिपि गर्नुहोस्"}</span>
              </button>
            </div>
            <textarea
              rows={8}
              readOnly
              value={unicodeText || romanText}
              placeholder="नेपाली युनिकोड यहाँ देखिनेछ…"
              className="w-full rounded-2xl border border-[#027081]/30 bg-[#027081]/5 p-4 text-base font-bold text-foreground outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
