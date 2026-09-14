"use client";

import { useState, type CSSProperties } from "react";
import { Check, Copy, Printer } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  WhatsAppIcon,
} from "@/components/portal/SocialIcons";
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
  const [copied, setCopied] = useState(false);
  const [igHint, setIgHint] = useState(false);

  const cleanText = stripHtml(content);
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));

  const handleSizeClick = (size: "normal" | "medium" | "large") => {
    setCurrentSize(size);
    if (size === "normal") setFontSizeClass("text-[17px] sm:text-lg");
    else if (size === "medium") setFontSizeClass("text-lg sm:text-xl");
    else setFontSizeClass("text-xl sm:text-2xl leading-loose");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIgHint(true);
      setTimeout(() => setIgHint(false), 2500);
    });
  };

  const socialBtn =
    "inline-flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-500">
          <span>{isEnglish ? `${minutes} min read` : `${minutes} मिनेट`}</span>
          <span className="text-gray-300" aria-hidden>
            ·
          </span>
          <div
            className="flex items-center gap-0.5"
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
                className="px-1.5 py-0.5 transition-colors"
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

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden text-[11px] font-medium text-gray-400 sm:inline">
            {isEnglish ? "Share" : "सेयर"}
          </span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className={socialBtn}
            style={{ color: "#1877F2" }}
            title="Facebook"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className={socialBtn}
            style={{ color: "#25D366" }}
            title="WhatsApp"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={handleInstagramShare}
            className={socialBtn}
            style={{ color: "#E4405F" }}
            title={
              isEnglish ? "Copy link for Instagram" : "इन्स्टाग्रामका लागि लिङ्क कपी"
            }
          >
            <InstagramIcon className="h-4 w-4" />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className={socialBtn}
            style={{ color: "#111827" }}
            title="X"
          >
            <TwitterIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className={socialBtn}
            style={{ color: copied ? PORTAL.brand : PORTAL.muted }}
            title={
              copied
                ? isEnglish
                  ? "Copied"
                  : "कपी भयो"
                : isEnglish
                  ? "Copy link"
                  : "लिङ्क कपी"
            }
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.print()}
            className={socialBtn}
            style={{ color: PORTAL.muted }}
            title={isEnglish ? "Print" : "प्रिन्ट"}
          >
            <Printer className="h-4 w-4" />
          </button>
          {igHint ? (
            <span className="ml-1 text-[11px]" style={{ color: PORTAL.brand }}>
              {isEnglish ? "Link copied" : "लिङ्क कपी भयो"}
            </span>
          ) : null}
        </div>
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
