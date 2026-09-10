"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, Copy, Pause, Play, Printer, RotateCcw } from "lucide-react";
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

/**
 * Prefer natural cloud voices (Google/Microsoft). Never force eSpeak/robotic locals.
 * If nothing good is found, return null and let the browser use `utterance.lang` only
 * (this is what sounded good when the project started).
 */
function pickNaturalVoice(isEnglish: boolean): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const prefer = isEnglish
    ? [/^en-US/i, /^en-GB/i, /^en/i]
    : [/^ne/i, /^ne-/i];

  const isRobot = (v: SpeechSynthesisVoice) =>
    /espeak|compact|robot|dummy|festival/i.test(`${v.name} ${v.voiceURI}`);

  const isPremium = (v: SpeechSynthesisVoice) =>
    /google|microsoft|natural|neural|premium|enhanced|samantha|aria|jenny|guy/i.test(
      v.name
    );

  const scored = voices
    .filter((v) => !isRobot(v))
    .map((v) => {
      let score = 0;
      const langIdx = prefer.findIndex((re) => re.test(v.lang));
      if (langIdx === -1) {
        // Nepali text: allow Hindi Google only as soft fallback (Devanagari)
        if (!isEnglish && /^hi/i.test(v.lang) && /google/i.test(v.name)) score = 20;
        else return null;
      } else {
        score = 100 - langIdx * 10;
      }
      if (isPremium(v)) score += 40;
      if (v.localService === false) score += 15; // often cloud/natural
      return { v, score };
    })
    .filter((x): x is { v: SpeechSynthesisVoice; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);

  // Only attach a voice when it's clearly a good match — otherwise leave unset
  if (!scored.length || scored[0].score < 50) return null;
  return scored[0].v;
}

function buildListenText(title: string, body: string, isEnglish: boolean) {
  const sep = isEnglish ? ". " : "। ";
  // Keep chunks moderate — Chrome can glitch on very long single utterances
  return `${title}${sep}${body.slice(0, 2800)}`;
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
  const [isSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const voicesReadyRef = useRef(false);

  useEffect(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    const warm = () => {
      synth.getVoices();
      voicesReadyRef.current = true;
    };
    warm();
    synth.addEventListener("voiceschanged", warm);
    return () => {
      synth.removeEventListener("voiceschanged", warm);
      synth.cancel();
    };
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isEnglish, isSupported, content, title]);

  const safeContent = content;
  const cleanText = stripHtml(safeContent);
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

  const startSpeech = () => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    // Warm voices (Chrome often returns [] until this runs)
    synth.getVoices();

    const utterance = new SpeechSynthesisUtterance(
      buildListenText(title, cleanText, isEnglish)
    );
    utterance.lang = isEnglish ? "en-US" : "ne-NP";
    utterance.rate = isEnglish ? 1 : 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = pickNaturalVoice(isEnglish);
    if (voice) {
      utterance.voice = voice;
      // Keep lang in sync with chosen voice for better accent
      utterance.lang = voice.lang || utterance.lang;
    }
    // If no premium voice: only `lang` is set — browser picks best (original behavior)

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePlay = () => {
    if (!isSupported) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    startSpeech();
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
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
          <div className="flex items-center gap-0.5" role="group" aria-label={isEnglish ? "Font size" : "अक्षर आकार"}>
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

          {isSupported ? (
            <>
              <span className="text-gray-300" aria-hidden>
                ·
              </span>
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={handlePlay}
                  className="inline-flex items-center gap-1 transition-colors"
                  style={{ color: PORTAL.brand }}
                  title={isEnglish ? "Listen in English" : "नेपालीमा सुन्नुहोस्"}
                >
                  <Play className="h-3 w-3" />
                  <span className="font-medium">
                    {isPaused
                      ? isEnglish
                        ? "Resume"
                        : "पुनः"
                      : isEnglish
                        ? "Listen"
                        : "सुन्नुहोस्"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex items-center gap-1"
                  style={{ color: PORTAL.accent }}
                >
                  <Pause className="h-3 w-3" />
                  <span>{isEnglish ? "Pause" : "रोक्नुहोस्"}</span>
                </button>
              )}
              {(isPlaying || isPaused) && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-700"
                  title={isEnglish ? "Stop" : "बन्द"}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="font-medium">{isEnglish ? "Stop" : "बन्द"}</span>
                </button>
              )}
            </>
          ) : null}
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
              isEnglish
                ? "Copy link for Instagram"
                : "इन्स्टाग्रामका लागि लिङ्क कपी"
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
            title={copied ? (isEnglish ? "Copied" : "कपी भयो") : isEnglish ? "Copy link" : "लिङ्क कपी"}
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
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </div>
  );
}
