"use client";

import { useState } from "react";
import { Copy, Check, Printer } from "lucide-react";
import { FacebookIcon, TwitterIcon } from "@/components/portal/SocialIcons";
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
  const [copied, setCopied] = useState(false);

  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  const readingTimeText = isEnglish
    ? `${minutes} min read`
    : `पढ्न ${minutes} मिनेट`;

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

  const actionClass =
    "inline-flex h-8 items-center gap-1.5 px-2.5 text-[12px] font-medium text-gray-500 transition-colors hover:text-gray-800";

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-y py-3"
      style={{ borderColor: PORTAL.rule }}
    >
      <p className="text-[12px] text-gray-500">{readingTimeText}</p>

      <div className="flex flex-wrap items-center gap-0.5">
        <div className="mr-1 flex items-center gap-0.5" role="group" aria-label={isEnglish ? "Font size" : "अक्षर आकार"}>
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
                className="inline-flex h-8 min-w-8 items-center justify-center px-1.5 text-[13px] transition-colors"
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

        <span className="mx-1 hidden h-4 w-px bg-gray-200 sm:block" aria-hidden />

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
          className={actionClass}
          title="Facebook"
        >
          <FacebookIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Facebook</span>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
          className={actionClass}
          title="X"
        >
          <TwitterIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">X</span>
        </a>
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`}
          target="_blank"
          rel="noreferrer"
          className={actionClass}
          title="WhatsApp"
        >
          WhatsApp
        </a>
        <button type="button" onClick={handleCopyLink} className={actionClass}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" style={{ color: PORTAL.brand }} />
              <span style={{ color: PORTAL.brand }}>
                {isEnglish ? "Copied" : "कपी भयो"}
              </span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>{isEnglish ? "Copy" : "कपी"}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.print()}
          className={actionClass}
          title={isEnglish ? "Print" : "प्रिन्ट"}
        >
          <Printer className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
