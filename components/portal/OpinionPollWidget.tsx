"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Vote, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

interface PollOption {
  id: string;
  option: string;
  optionNp: string;
  votes: number;
  percentage: number;
}

interface PollData {
  id: string;
  question: string;
  questionNp: string;
  totalVotes: number;
  options: PollOption[];
}

/** Homepage sidebar opinion poll — votes via /api/polls. */
export function OpinionPollWidget() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));

  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPoll(json.data);
          try {
            const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "[]");
            if (votedPolls.includes(json.data.id)) setHasVoted(true);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handleVote = async () => {
    if (!poll || !selectedOption || submitting || hasVoted) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOption }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPoll(json.data);
        setHasVoted(true);
        try {
          const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "[]");
          votedPolls.push(poll.id);
          localStorage.setItem("voted_polls", JSON.stringify(votedPolls));
        } catch {
          // ignore
        }
        toast.success(json.message || (isEnglish ? "Vote recorded. Thank you!" : "तपाईंको मत दर्ता भयो। धन्यवाद!"));
      } else {
        toast.error(json.error || (isEnglish ? "Could not submit vote" : "मत दर्ता गर्न सकिएन"));
      }
    } catch {
      toast.error(isEnglish ? "Could not submit vote" : "मत दर्ता गर्न सकिएन");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded || !poll) return null;

  const question = isEnglish ? poll.question || poll.questionNp : poll.questionNp;

  return (
    <div className="border border-gray-200 bg-white">
      <div
        className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5"
        style={{ backgroundColor: "rgba(25, 87, 166, 0.06)" }}
      >
        <h3
          className="inline-flex items-center gap-1.5 text-sm font-extrabold"
          style={{ color: PORTAL.brand }}
        >
          <Vote className="h-4 w-4" />
          {isEnglish ? "Opinion poll" : "जनमत"}
        </h3>
        <span className="text-[10px] font-bold tabular-nums text-gray-500">
          {isEnglish ? `Votes: ${poll.totalVotes}` : `कुल मत: ${poll.totalVotes}`}
        </span>
      </div>

      <div className="space-y-3 p-3">
        <p className="text-sm font-bold leading-snug text-gray-900">{question}</p>

        <div className="space-y-2">
          {poll.options.map((opt) => {
            const label = isEnglish ? opt.option || opt.optionNp : opt.optionNp;
            const isSelected = selectedOption === opt.id;

            if (hasVoted) {
              return (
                <div key={opt.id} className="space-y-1">
                  <div className="flex justify-between gap-2 text-xs font-bold text-gray-800">
                    <span>{label}</span>
                    <span className="shrink-0 tabular-nums" style={{ color: PORTAL.brand }}>
                      {opt.percentage}% ({opt.votes})
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden bg-gray-100">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${opt.percentage}%`,
                        backgroundColor: PORTAL.brand,
                      }}
                    />
                  </div>
                </div>
              );
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={`flex w-full items-center gap-2.5 border px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                  isSelected
                    ? "border-transparent text-white"
                    : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                }`}
                style={isSelected ? { backgroundColor: PORTAL.brand } : undefined}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? "border-white bg-white/25" : ""
                  }`}
                  style={
                    isSelected
                      ? undefined
                      : { borderColor: "rgba(25, 87, 166, 0.55)" }
                  }
                >
                  {isSelected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {!hasVoted ? (
          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOption || submitting}
            className="w-full py-2.5 text-xs font-bold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: PORTAL.accent }}
          >
            {submitting
              ? isEnglish
                ? "Submitting…"
                : "मत दर्ता हुँदैछ…"
              : isEnglish
                ? "Submit vote"
                : "मत दिनुहोस्"}
          </button>
        ) : (
          <div
            className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] font-bold"
            style={{ color: PORTAL.brand }}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {isEnglish ? "Your vote was recorded" : "तपाईंको मत दर्ता भयो"}
          </div>
        )}
      </div>
    </div>
  );
}
