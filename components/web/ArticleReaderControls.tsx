"use client";

import { useState } from "react";
import { ArticleShareBar } from "@/components/web/ArticleShareBar";
import { PORTAL } from "@/constants/portal";

interface ArticleReaderControlsProps {
  title: string;
  shareUrl: string;
  wordCount: number;
  onFontSizeChange: (size: "normal" | "medium" | "large") => void;
  isEnglish?: boolean;
}

export function ArticleReaderControls({
  title,
  shareUrl,
  wordCount,
  onFontSizeChange,
  isEnglish = false,
}: ArticleReaderControlsProps) {
  const [currentSize, setCurrentSize] = useState<"normal" | "medium" | "large">("normal");

  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  const readingTimeText = isEnglish
    ? `${minutes} min read`
    : `पढ्न ${minutes} मिनेट`;

  const handleSizeClick = (size: "normal" | "medium" | "large") => {
    setCurrentSize(size);
    onFontSizeChange(size);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0">
      <div className="flex flex-wrap items-center gap-x-1.5 text-[12px] leading-none text-gray-500">
        <p>{readingTimeText}</p>
        <span className="text-gray-300" aria-hidden>
          ·
        </span>
        <div
          className="flex items-center"
          role="group"
          aria-label={isEnglish ? "Font size" : "अक्षर आकार"}
        >
          {(
            [
              { size: "normal" as const, label: "A−" },
              { size: "medium" as const, label: "A" },
              { size: "large" as const, label: "A+" },
            ] as const
          ).map(({ size, label }) => {
            const active = currentSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeClick(size)}
                className="px-0.5 py-0 text-[13px] transition-colors"
                style={{
                  color: active ? PORTAL.brand : PORTAL.muted,
                  fontWeight: active ? 700 : 500,
                }}
                title={size}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <ArticleShareBar title={title} shareUrl={shareUrl} isEnglish={isEnglish} />
    </div>
  );
}
