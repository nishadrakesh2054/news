"use client";

import { useState, type CSSProperties } from "react";
import { ArticleShareBar } from "@/components/web/ArticleShareBar";
import { PORTAL } from "@/constants/portal";

interface ArticleBodyClientProps {
  title: string;
  /** Pre-sanitized HTML from the server. */
  content: string;
  shareUrl: string;
  isEnglish?: boolean;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
}

export function ArticleBodyClient({
  title,
  content,
  shareUrl,
  isEnglish = false,
}: ArticleBodyClientProps) {
  const [fontSizeClass, setFontSizeClass] = useState("text-[17px] sm:text-lg");
  const [currentSize, setCurrentSize] = useState<"normal" | "medium" | "large">("normal");

  const cleanText = stripHtml(content);
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));

  const handleSizeClick = (size: "normal" | "medium" | "large") => {
    setCurrentSize(size);
    if (size === "normal") setFontSizeClass("text-[17px] sm:text-lg");
    else if (size === "medium") setFontSizeClass("text-lg sm:text-xl");
    else setFontSizeClass("text-xl sm:text-2xl leading-loose");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-0">
        <div className="flex flex-wrap items-center gap-x-1.5 text-[12px] leading-none text-gray-500">
          <span>{isEnglish ? `${minutes} min read` : `${minutes} मिनेट`}</span>
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
            ).map(({ size, label }) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeClick(size)}
                className="px-0.5 py-0 transition-colors"
                style={{
                  color: currentSize === size ? PORTAL.brand : PORTAL.muted,
                  fontWeight: currentSize === size ? 700 : 500,
                }}
                aria-pressed={currentSize === size}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ArticleShareBar title={title} shareUrl={shareUrl} isEnglish={isEnglish} />
      </div>

      <div
        className={`article-prose max-w-none font-normal leading-[1.8] text-gray-800 ${fontSizeClass}`}
        style={
          {
            ["--article-link"]: PORTAL.brand,
            ["--article-accent"]: PORTAL.accent,
          } as CSSProperties
        }
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
