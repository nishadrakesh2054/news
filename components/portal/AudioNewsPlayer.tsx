"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, RotateCcw } from "lucide-react";

interface AudioNewsPlayerProps {
  textToRead: string;
  title: string;
}

export function AudioNewsPlayer({ textToRead, title }: AudioNewsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [speechRate] = useState<number>(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!synthRef.current || !textToRead) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        synthRef.current.cancel(); // Stop existing

        // Strip HTML tags for clean reading text
        const cleanText = textToRead.replace(/<[^>]*>?/gm, "").slice(0, 3000);
        const textToSpeech = `${title}। ${cleanText}`;

        const utterance = new SpeechSynthesisUtterance(textToSpeech);
        utterance.lang = "ne-NP"; // Nepali locale
        utterance.rate = speechRate;

        // Try to pick a Nepali voice if available
        const voices = synthRef.current.getVoices();
        const nepaliVoice = voices.find((v) => v.lang.includes("ne") || v.lang.includes("hi"));
        if (nepaliVoice) {
          utterance.voice = nepaliVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="bg-[#027081]/10 border border-[#027081]/30 rounded-2xl p-4 my-6 shadow-2xs select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-[#027081] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Volume2 className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-foreground font-serif flex items-center gap-1.5">
            <span>समाचार सुन्नुहोस्</span>
            <span className="text-[10px] bg-[#027081]/20 text-[#027081] px-2 py-0.5 rounded-full font-mono font-bold">
              स्वतः वाचन
            </span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            यो खबरलाई नेपाली आवाजमा स्वतः वाचन गरी सुन्नुहोस्।
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={handlePlayPause}
          className="flex items-center space-x-2 bg-[#027081] hover:bg-[#025b69] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 fill-current" />
              <span>रोक्नुहोस्</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>सुन्नुहोस्</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            onClick={handleReset}
            className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer"
            title="पुनः सुरु गर्नुहोस्"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
