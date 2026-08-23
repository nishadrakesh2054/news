"use client";

import { useEffect, useState } from "react";
import { Vote, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PollOption {
  id: string;
  optionNp: string;
  votes: number;
  percentage: number;
}

interface PollData {
  id: string;
  questionNp: string;
  totalVotes: number;
  options: PollOption[];
}

export function OpinionPollWidget() {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPoll(json.data);
          // Check localStorage if already voted on this poll
          const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "[]");
          if (votedPolls.includes(json.data.id)) {
            setHasVoted(true);
          }
        }
      })
      .catch(() => {});
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

        const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "[]");
        votedPolls.push(poll.id);
        localStorage.setItem("voted_polls", JSON.stringify(votedPolls));

        toast.success(json.message || "तपाईंको मत दर्ता भयो। धन्यवाद!");
      }
    } catch {
      toast.error("मत दर्ता गर्न सकिएन");
    } finally {
      setSubmitting(false);
    }
  };

  if (!poll) {
    // Default Fallback Sample Poll
    return (
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-2xs select-none">
        <div className="flex items-center justify-between border-b-2 border-[#027081] pb-2">
          <h3 className="text-base font-extrabold text-foreground font-serif flex items-center gap-2">
            <Vote className="h-4.5 w-4.5 text-[#027081]" />
            <span>जनमत (Opinion Poll)</span>
          </h3>
        </div>
        <p className="text-xs font-bold text-foreground font-serif leading-snug">
          के सरकारको पछिल्लो आर्थिक नीतिले युवा उद्यमीलाई प्रोत्साहन गर्छ?
        </p>
        <div className="space-y-2 text-xs">
          {["गर्छ", "गर्दैन", "भन्न सकिन्न"].map((opt, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-border bg-muted/20 font-bold">
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-2xs select-none">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b-2 border-[#027081] pb-2.5">
        <h3 className="text-base font-extrabold text-foreground font-serif tracking-tight flex items-center gap-2">
          <Vote className="h-5 w-5 text-[#027081]" />
          <span>जनमत (Public Poll)</span>
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono font-bold">
          कुल मत: {poll.totalVotes}
        </span>
      </div>

      {/* Poll Question */}
      <p className="text-xs sm:text-sm font-bold text-foreground font-serif leading-snug">
        {poll.questionNp}
      </p>

      {/* Poll Options */}
      <div className="space-y-2 text-xs">
        {poll.options.map((opt) => {
          const isSelected = selectedOption === opt.id;

          if (hasVoted) {
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>{opt.optionNp}</span>
                  <span className="font-mono text-[#027081]">{opt.percentage}% ({opt.votes})</span>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#027081] h-full rounded-full transition-all duration-500"
                    style={{ width: `${opt.percentage}%` }}
                  />
                </div>
              </div>
            );
          }

          return (
            <label
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer font-bold ${
                isSelected
                  ? "border-[#027081] bg-[#027081]/10 text-[#027081]"
                  : "border-border/60 bg-muted/20 hover:bg-muted/60 text-foreground"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-[#027081] bg-[#027081]" : "border-muted-foreground/40"
                  }`}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span>{opt.optionNp}</span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Vote Action Button */}
      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={!selectedOption || submitting}
          className="w-full py-2.5 rounded-xl bg-[#027081] hover:bg-[#025a68] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "मत दर्ता हुँदैछ..." : "मत दिनुहोस् (Submit Vote)"}
        </button>
      )}

      {hasVoted && (
        <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>तपाईंको मत दर्ता भयो</span>
        </div>
      )}
    </div>
  );
}
