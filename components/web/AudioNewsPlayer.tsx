"use client";

import { useState } from "react";
import { Volume2, Pause, Play, RotateCcw } from "lucide-react";
import { PORTAL } from "@/constants/portal";

interface AudioNewsPlayerProps {
  title: string;
  content: string;
  isEnglish?: boolean;
}

export function AudioNewsPlayer({ title, content, isEnglish = false }: AudioNewsPlayerProps) {
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);

  const getPlainText = () => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = content;
    const textContent = tmp.textContent || tmp.innerText || "";
    return `${title}। ${textContent.slice(0, 1500)}`;
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

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(getPlainText());
    utterance.rate = rate;
    utterance.lang = "ne-NP";
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

  if (!isSupported) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 py-3"
      style={{ borderBottom: `1px solid ${PORTAL.rule}` }}
    >
      <div className="flex items-center gap-2.5">
        <Volume2 className="h-4 w-4 shrink-0" style={{ color: PORTAL.brand }} />
        <div>
          <p className="text-[13px] font-semibold" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Listen to article" : "समाचार सुन्नुहोस्"}
          </p>
          <p className="text-[11px] text-gray-400">
            {isPlaying
              ? isEnglish
                ? "Playing…"
                : "बाचन हुँदैछ…"
              : isPaused
                ? isEnglish
                  ? "Paused"
                  : "रोकिएको"
                : isEnglish
                  ? "Text-to-speech"
                  : "अडियो बाचन"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex h-8 items-center gap-1.5 px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PORTAL.brand }}
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            {isPaused
              ? isEnglish
                ? "Resume"
                : "पुनः सुरु"
              : isEnglish
                ? "Play"
                : "सुन्नुहोस्"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="inline-flex h-8 items-center gap-1.5 px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PORTAL.accent }}
          >
            <Pause className="h-3.5 w-3.5 fill-white" />
            {isEnglish ? "Pause" : "रोक्नुहोस्"}
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-800"
            title={isEnglish ? "Stop" : "बन्द"}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        <select
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="h-8 border-0 bg-transparent px-1 text-[12px] text-gray-500 outline-none"
          title={isEnglish ? "Speed" : "गति"}
        >
          <option value={0.8}>0.8×</option>
          <option value={1}>1×</option>
          <option value={1.2}>1.2×</option>
          <option value={1.5}>1.5×</option>
        </select>
      </div>
    </div>
  );
}
