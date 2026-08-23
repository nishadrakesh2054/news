"use client";

import { useState } from "react";
import Link from "next/link";
import { Type, Copy, Check, ChevronRight } from "lucide-react";

export default function UnicodeConverterPage() {
  const [romanText, setRomanText] = useState("");
  const [unicodeText, setUnicodeText] = useState("");
  const [copied, setCopied] = useState(false);

  // Romanized to Nepali Transliteration Engine
  const convertToUnicode = (input: string) => {
    setRomanText(input);

    // Simple rule-based transliteration mapping
    const converted = input
      .replace(/mora/g, "मोर")
      .replace(/nepal/g, "नेपाल")
      .replace(/khabar/g, "खबर")
      .replace(/setopati/g, "सेतोपाटी")
      .replace(/namaste/g, "नमस्ते")
      .replace(/dhanyabad/g, "धन्यवाद")
      .replace(/ka/g, "क")
      .replace(/kha/g, "ख")
      .replace(/ga/g, "ग")
      .replace(/gha/g, "घ")
      .replace(/cha/g, "च")
      .replace(/chha/g, "छ")
      .replace(/ja/g, "ज")
      .replace(/jha/g, "झ")
      .replace(/ta/g, "त")
      .replace(/tha/g, "थ")
      .replace(/da/g, "द")
      .replace(/dha/g, "ध")
      .replace(/na/g, "न")
      .replace(/pa/g, "प")
      .replace(/pha/g, "फ")
      .replace(/ba/g, "ब")
      .replace(/bha/g, "भ")
      .replace(/ma/g, "म")
      .replace(/ya/g, "य")
      .replace(/ra/g, "र")
      .replace(/la/g, "ल")
      .replace(/wa/g, "व")
      .replace(/sha/g, "श")
      .replace(/sa/g, "स")
      .replace(/ha/g, "ह")
      .replace(/0/g, "०")
      .replace(/1/g, "१")
      .replace(/2/g, "२")
      .replace(/3/g, "३")
      .replace(/4/g, "४")
      .replace(/5/g, "५")
      .replace(/6/g, "६")
      .replace(/7/g, "७")
      .replace(/8/g, "८")
      .replace(/9/g, "९");

    setUnicodeText(converted);
  };

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
          <Link href="/" className="hover:text-[#027081]">गृह</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#027081] font-bold">नेपाली युनिकोड टाइप औजार</span>
        </nav>

        <header className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center space-x-2 text-[#027081]">
            <Type className="h-6 w-6" />
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
              नेपाली युनिकोड कन्भर्टर (English to Nepali Unicode)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            अंग्रेजी अक्षर (Romanized Nepali) मा टाइप गर्नुहोस् र स्वचालित रूपमा शुद्ध नेपाली युनिकोड प्राप्त गर्नुहोस्।
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roman Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>अंग्रेजी (Romanized Text Input):</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                उदा: nepal khabar
              </span>
            </label>
            <textarea
              rows={8}
              value={romanText}
              onChange={(e) => convertToUnicode(e.target.value)}
              placeholder="यहाँ टाइप गर्नुहोस् (e.g. namaste nepal)..."
              className="w-full rounded-2xl border border-input bg-card p-4 text-sm text-foreground focus:border-[#027081] outline-none leading-relaxed"
            />
          </div>

          {/* Unicode Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#027081] font-serif">
                नेपाली युनिकोड (Output Nepali Unicode):
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 bg-[#027081] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#025c6a] transition-all cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "कपी भयो!" : "कपी गर्नुहोस्"}</span>
              </button>
            </div>
            <textarea
              rows={8}
              readOnly
              value={unicodeText || romanText}
              placeholder="नेपाली युनिकोड यहाँ देखिनेछ..."
              className="w-full rounded-2xl border border-[#027081]/30 bg-[#027081]/5 p-4 text-base font-bold text-foreground outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
