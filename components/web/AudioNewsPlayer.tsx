"use client";

import { useState } from "react";
import { Volume2, Pause, Play, RotateCcw } from "lucide-react";

interface AudioNewsPlayerProps {
  title: string;
  content: string;
}

export function AudioNewsPlayer({ title, content }: AudioNewsPlayerProps) {
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1);

  const getPlainText = () => {
    // Strip HTML tags to get clean article text
    const tmp = document.createElement("DIV");
    tmp.innerHTML = content;
    const textContent = tmp.textContent || tmp.innerText || "";
    return `${title}। ${textContent.slice(0, 1500)}`; // Read title + first 1500 chars
  };

  const handlePlay = () => {
    if (!isSupported) return;

    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synth.cancel(); // Stop any active speech

    const textToRead = getPlainText();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
    utterance.lang = "ne-NP"; // Set language to Nepali

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

  const handlePause = () => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-[#027081]/20 bg-[#027081]/5 my-6">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-[#027081] text-white flex items-center justify-center shrink-0">
          <Volume2 className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-foreground">
            समाचार सुन्नुहोस् (Listen to Article)
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {isPlaying ? "समाचार बाचन हुँदैछ..." : isPaused ? "रोकिएको छ" : "अडियो सुन्न प्ले थिच्नुहोस्"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#027081] hover:bg-[#025a68] text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>{isPaused ? "पुनः सुरु गर्नुहोस्" : "सुन्नुहोस्"}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Pause className="h-4 w-4 fill-white" />
            <span>रोक्नुहोस्</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
            title="बन्द गर्नुहोस्"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}

        <select
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="h-8 text-xs font-mono rounded-md border border-border bg-background px-2 text-foreground"
          title="गति (Speech Speed)"
        >
          <option value={0.8}>0.8x</option>
          <option value={1}>1.0x</option>
          <option value={1.2}>1.2x</option>
          <option value={1.5}>1.5x</option>
        </select>
      </div>
    </div>
  );
}
