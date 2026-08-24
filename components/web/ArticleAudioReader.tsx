"use client";

import { useState } from "react";
import { Volume2, Play, Pause, Type, Printer } from "lucide-react";

interface ArticleAudioReaderProps {
  textToRead: string;
  onFontSizeChange: (size: "sm" | "base" | "lg" | "xl") => void;
}

export function ArticleAudioReader({
  textToRead,
  onFontSizeChange,
}: ArticleAudioReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [speechSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );

  const handleTogglePlay = () => {
    if (!speechSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();

      // Clean HTML tags from text
      const cleanText = textToRead.replace(/<[^>]*>?/gm, "").substring(0, 3000);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "ne-NP"; // Nepali language voice
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleSetFontSize = (size: "sm" | "base" | "lg" | "xl") => {
    setFontSize(size);
    onFontSizeChange(size);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Voice Reader Controls */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={handleTogglePlay}
          disabled={!speechSupported}
          className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
            isPlaying
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
              : "bg-[#027081] hover:bg-[#025c6a] text-white shadow-2xs"
          }`}
          title="समाचार सुन्नुहोस् (Listen to Article)"
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>रोक्नुहोस् (Pause Voice)</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>समाचार सुन्नुहोस् (Voice Reader)</span>
            </>
          )}
        </button>

        {isPlaying && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 animate-pulse">
            <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>लाइभ अडियो चलिरहेको छ...</span>
          </span>
        )}
      </div>

      {/* Font Size & Print Controls */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1 mr-1">
          <Type className="h-3.5 w-3.5 text-[#027081]" />
          <span>अक्षर आकार:</span>
        </span>

        <button
          onClick={() => handleSetFontSize("sm")}
          className={`px-2 py-0.5 rounded border transition-colors ${
            fontSize === "sm"
              ? "bg-[#027081] text-white border-[#027081]"
              : "bg-background border-border hover:bg-muted"
          }`}
          title="सानो अक्षर"
        >
          क-
        </button>
        <button
          onClick={() => handleSetFontSize("base")}
          className={`px-2 py-0.5 rounded border transition-colors ${
            fontSize === "base"
              ? "bg-[#027081] text-white border-[#027081]"
              : "bg-background border-border hover:bg-muted"
          }`}
          title="सामान्य"
        >
          क
        </button>
        <button
          onClick={() => handleSetFontSize("lg")}
          className={`px-2 py-0.5 rounded border transition-colors ${
            fontSize === "lg"
              ? "bg-[#027081] text-white border-[#027081]"
              : "bg-background border-border hover:bg-muted"
          }`}
          title="ठूलो अक्षर"
        >
          क+
        </button>

        <span className="text-border">|</span>

        <button
          onClick={handlePrint}
          className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted text-foreground font-semibold inline-flex items-center gap-1 cursor-pointer"
          title="Print Article"
        >
          <Printer className="h-3 w-3 text-[#027081]" />
          <span>प्रिन्ट</span>
        </button>
      </div>
    </div>
  );
}
