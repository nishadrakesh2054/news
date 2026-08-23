"use client";

import { useState } from "react";
import { Clock, Type, Share2, Copy, Check, Printer, MessageCircle } from "lucide-react";
import { FacebookIcon } from "@/components/portal/SocialIcons";

interface ArticleReaderControlsProps {
  title: string;
  shareUrl: string;
  wordCount: number;
  onFontSizeChange: (size: "normal" | "medium" | "large") => void;
}

export function ArticleReaderControls({
  title,
  shareUrl,
  wordCount,
  onFontSizeChange,
}: ArticleReaderControlsProps) {
  const [currentSize, setCurrentSize] = useState<"normal" | "medium" | "large">("normal");
  const [copied, setCopied] = useState(false);

  // Estimate reading time: average 180 words per minute for Nepali/English text
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  const readingTimeText = `पढ्न लाग्ने समय: ${minutes} मिनेट`;

  const handleSizeClick = (size: "normal" | "medium" | "large") => {
    setCurrentSize(size);
    onFontSizeChange(size);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full bg-muted/40 border border-border/60 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4 select-none my-4">
      {/* Estimated Reading Time */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
        <Clock className="h-4 w-4 text-[#027081]" />
        <span>{readingTimeText}</span>
      </div>

      {/* Font Size Adjuster Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline flex items-center gap-1">
          <Type className="h-3.5 w-3.5 text-[#027081]" />
          अक्षर आकार:
        </span>
        <div className="flex items-center space-x-1 bg-background border border-border rounded-lg p-1 text-xs font-bold">
          <button
            onClick={() => handleSizeClick("normal")}
            className={`px-2 py-0.5 rounded ${
              currentSize === "normal"
                ? "bg-[#027081] text-white"
                : "text-foreground hover:bg-muted"
            }`}
            title="Standard Font Size"
          >
            A-
          </button>
          <button
            onClick={() => handleSizeClick("medium")}
            className={`px-2 py-0.5 rounded ${
              currentSize === "medium"
                ? "bg-[#027081] text-white"
                : "text-foreground hover:bg-muted"
            }`}
            title="Medium Font Size"
          >
            A
          </button>
          <button
            onClick={() => handleSizeClick("large")}
            className={`px-2 py-0.5 rounded text-sm ${
              currentSize === "large"
                ? "bg-[#027081] text-white"
                : "text-foreground hover:bg-muted"
            }`}
            title="Large Font Size"
          >
            A+
          </button>
        </div>
      </div>

      {/* Social Sharing & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 bg-[#1877F2] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
          title="Facebook मा सेयर गर्नुहोस्"
        >
          <FacebookIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">फेसबुक</span>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
          title="WhatsApp मा पठाउनुहोस्"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* Viber */}
        <a
          href={`viber://forward?text=${encodeURIComponent(title + " " + shareUrl)}`}
          className="flex items-center space-x-1 bg-purple-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
          title="Viber मा पठाउनुहोस्"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">भाइबर</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-1 bg-card border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
          title="लिङ्क कपी गर्नुहोस्"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>कपी भयो!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              <span>कपी</span>
            </>
          )}
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1 bg-card border border-border text-foreground px-2 py-1.5 rounded-lg text-xs hover:bg-muted transition-colors cursor-pointer"
          title="प्रिन्ट गर्नुहोस्"
        >
          <Printer className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
