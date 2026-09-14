"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Printer, Share2 } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  WhatsAppIcon,
} from "@/components/portal/SocialIcons";
import { PORTAL } from "@/constants/portal";

type ArticleShareBarProps = {
  title: string;
  shareUrl: string;
  isEnglish?: boolean;
};

/** Match lucide default visual weight — same box for every icon. */
const ICON_SIZE = 16;

const btnClass =
  "inline-flex items-center justify-center p-0.5 text-gray-500 transition-colors hover:text-gray-900";

export function ArticleShareBar({
  title,
  shareUrl,
  isEnglish = false,
}: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const showHint = (message: string) => {
    setHint(message);
    window.setTimeout(() => setHint(null), 2000);
  };

  const copyLink = async (successMessage: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showHint(successMessage);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showHint(isEnglish ? "Could not copy" : "कपी असफल");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl, text: title });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copyLink(isEnglish ? "Link copied" : "लिङ्क कपी भयो");
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0">
      <span className="text-[11px] leading-none text-gray-400">
        {isEnglish ? "Share" : "सेयर"}
      </span>

      <div
        className="flex items-center gap-1"
        role="group"
        aria-label={isEnglish ? "Share article" : "समाचार सेयर गर्नुहोस्"}
      >
        {canNativeShare ? (
          <button
            type="button"
            onClick={handleNativeShare}
            className={`${btnClass} hover:text-[#1957A6]`}
            title={isEnglish ? "Share" : "सेयर"}
            aria-label={isEnglish ? "Share" : "सेयर"}
          >
            <Share2 size={ICON_SIZE} strokeWidth={2} />
          </button>
        ) : null}

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={`${btnClass} hover:text-[#1877F2]`}
          title="Facebook"
          aria-label="Facebook"
        >
          <FacebookIcon size={ICON_SIZE} />
        </a>

        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`}
          target="_blank"
          rel="noreferrer"
          className={`${btnClass} hover:text-[#25D366]`}
          title="WhatsApp"
          aria-label="WhatsApp"
        >
          <WhatsAppIcon size={ICON_SIZE} />
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={btnClass}
          title="X"
          aria-label="X"
        >
          <TwitterIcon size={ICON_SIZE} />
        </a>

        <button
          type="button"
          onClick={() =>
            copyLink(
              isEnglish
                ? "Link copied for Instagram"
                : "इन्स्टाग्रामका लागि लिङ्क कपी भयो"
            )
          }
          className={`${btnClass} hover:text-[#E4405F]`}
          title={
            isEnglish ? "Copy link for Instagram" : "इन्स्टाग्रामका लागि लिङ्क कपी"
          }
          aria-label={
            isEnglish ? "Copy link for Instagram" : "इन्स्टाग्रामका लागि लिङ्क कपी"
          }
        >
          <InstagramIcon size={ICON_SIZE} />
        </button>

        <button
          type="button"
          onClick={() => copyLink(isEnglish ? "Link copied" : "लिङ्क कपी भयो")}
          className={`${btnClass} ${copied ? "text-[#1957A6]" : ""}`}
          title={
            copied
              ? isEnglish
                ? "Copied"
                : "कपी भयो"
              : isEnglish
                ? "Copy link"
                : "लिङ्क कपी"
          }
          aria-label={isEnglish ? "Copy link" : "लिङ्क कपी"}
        >
          {copied ? (
            <Check size={ICON_SIZE} strokeWidth={2} />
          ) : (
            <Link2 size={ICON_SIZE} strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.print()}
          className={btnClass}
          title={isEnglish ? "Print" : "प्रिन्ट"}
          aria-label={isEnglish ? "Print" : "प्रिन्ट"}
        >
          <Printer size={ICON_SIZE} strokeWidth={2} />
        </button>
      </div>

      {hint ? (
        <span
          className="text-[11px] leading-none"
          style={{ color: PORTAL.brand }}
          aria-live="polite"
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
