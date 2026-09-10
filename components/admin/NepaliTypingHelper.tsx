"use client";

import { useState } from "react";
import { Keyboard, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { adminBtnPrimary, adminBtnSecondary, adminInput, adminPanel } from "@/constants/admin-layout";
import { romanToNepali } from "@/lib/roman-to-nepali";

type NepaliTypingHelperProps = {
  /** When set, "Use in field" writes the converted text into the parent control. */
  onApply?: (unicode: string) => void;
};

export function NepaliTypingHelper({ onApply }: NepaliTypingHelperProps) {
  const [open, setOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);

  const convertedText = romanToNepali(inputText);

  const handleCopy = async () => {
    const value = convertedText || inputText;
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={adminPanel}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Keyboard className="h-3.5 w-3.5 text-[#0C4EA0]" />
          Nepali typing helper
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border/70 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Roman input
              </label>
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="nepal samachar hami haru…"
                className={`${adminInput} min-h-14 w-full resize-y py-2`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Unicode output
              </label>
              <textarea
                rows={2}
                readOnly
                value={convertedText}
                placeholder="नेपाल समाचार हामीहरू…"
                className={`${adminInput} min-h-14 w-full resize-none bg-muted/30 py-2 font-semibold`}
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {onApply ? (
              <button
                type="button"
                disabled={!convertedText}
                onClick={() => onApply(convertedText)}
                className={adminBtnSecondary}
              >
                Use in headline
              </button>
            ) : null}
            <button type="button" onClick={handleCopy} className={adminBtnPrimary}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy Unicode"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
