"use client";

import { useEffect, useState } from "react";
import { Volume2, Pause, Play, RotateCcw } from "lucide-react";
import { PORTAL } from "@/constants/portal";

interface AudioNewsPlayerProps {
  title: string;
  content: string;
  isEnglish?: boolean;
}

function pickNaturalVoice(isEnglish: boolean): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const prefer = isEnglish ? [/^en-US/i, /^en-GB/i, /^en/i] : [/^ne/i];
  const isRobot = (v: SpeechSynthesisVoice) =>
    /espeak|compact|robot|dummy|festival/i.test(`${v.name} ${v.voiceURI}`);
  const isPremium = (v: SpeechSynthesisVoice) =>
    /google|microsoft|natural|neural|premium|enhanced/i.test(v.name);

  const scored = voices
    .filter((v) => !isRobot(v))
    .map((v) => {
      const langIdx = prefer.findIndex((re) => re.test(v.lang));
      if (langIdx === -1) {
        if (!isEnglish && /^hi/i.test(v.lang) && /google/i.test(v.name)) {
          return { v, score: 25 };
        }
        return null;
      }
      let score = 100 - langIdx * 10;
      if (isPremium(v)) score += 40;
      if (v.localService === false) score += 15;
      return { v, score };
    })
    .filter((x): x is { v: SpeechSynthesisVoice; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);

  if (!scored.length || scored[0].score < 50) return null;
  return scored[0].v;
}

export function AudioNewsPlayer({ title, content, isEnglish = false }: AudioNewsPlayerProps) {
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    const warm = () => synth.getVoices();
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
  }, [isEnglish, title, content, isSupported]);

  const getPlainText = () => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = content;
    const textContent = (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
    const sep = isEnglish ? ". " : "। ";
    return `${title}${sep}${textContent.slice(0, 2800)}`;
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
    synth.getVoices();

    const utterance = new SpeechSynthesisUtterance(getPlainText());
    utterance.rate = rate;
    utterance.lang = isEnglish ? "en-US" : "ne-NP";
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = pickNaturalVoice(isEnglish);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || utterance.lang;
    }

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
                  ? "English voice"
                  : "नेपाली आवाज"}
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
