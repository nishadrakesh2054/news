"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Vote, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PollOption {
  id: string;
  optionNp: string;
  votes: number;
}

interface PollItem {
  id: string;
  questionNp: string;
  status: string;
  createdAt: string;
  options: PollOption[];
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [questionNp, setQuestionNp] = useState("");
  const [opt1, setOpt1] = useState("Yes");
  const [opt2, setOpt2] = useState("No");
  const [opt3, setOpt3] = useState("Neutral");

  const fetchPolls = useCallback(() => {
    fetch("/api/admin/polls")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPolls(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionNp.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionNp,
          options: [opt1, opt2, opt3].filter(Boolean),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("New opinion poll created successfully!");
        setQuestionNp("");
        fetchPolls();
      } else {
        toast.error(json.error || "Failed to create poll");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <Vote className="h-5 w-5 text-[#027081]" />
            <span>Public Opinion Polls Management</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Poll Form */}
        <form onSubmit={handleCreatePoll} className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-4 h-fit">
          <h2 className="text-base font-bold text-foreground font-serif border-b border-border/60 pb-2 flex items-center gap-2">
            <Plus className="h-4.5 w-4.5 text-[#027081]" />
            <span>Create New Opinion Poll</span>
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Poll Question:</label>
            <textarea
              rows={3}
              required
              value={questionNp}
              onChange={(e) => setQuestionNp(e.target.value)}
              placeholder="e.g. Will the new budget positively impact the economy?"
              className="w-full rounded-sm border border-input bg-card p-3 text-xs focus:border-[#027081] outline-none font-serif leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Options:</label>
            <input
              type="text"
              required
              value={opt1}
              onChange={(e) => setOpt1(e.target.value)}
              className="w-full rounded-sm border border-input bg-card px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
            />
            <input
              type="text"
              required
              value={opt2}
              onChange={(e) => setOpt2(e.target.value)}
              className="w-full rounded-sm border border-input bg-card px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
            />
            <input
              type="text"
              value={opt3}
              onChange={(e) => setOpt3(e.target.value)}
              className="w-full rounded-sm border border-input bg-card px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
            />
          </div>

          <Button
            type="submit"
            disabled={creating}
            className="w-full h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {creating ? "Creating..." : "Publish New Poll"}
          </Button>
        </form>

        {/* Existing Polls List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-foreground font-serif">
            Opinion Poll History
          </h2>

          {loading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">Loading poll data...</div>
          ) : polls.length > 0 ? (
            <div className="space-y-4">
              {polls.map((p) => {
                const totalVotes = p.options.reduce((acc: number, opt: PollOption) => acc + opt.votes, 0);
                const isActive = p.status === "ACTIVE";

                return (
                  <div
                    key={p.id}
                    className={`bg-card rounded-2xl border p-5 space-y-3 shadow-2xs ${
                      isActive ? "border-[#027081] ring-1 ring-[#027081]/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        Date: {new Date(p.createdAt).toLocaleDateString()} • Total Votes: {totalVotes}
                      </span>
                      {isActive && (
                        <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active Poll</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-foreground font-serif">
                      {p.questionNp}
                    </h3>

                    <div className="space-y-2 text-xs">
                      {p.options.map((opt: PollOption) => {
                        const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-foreground">
                              <span>{opt.optionNp}</span>
                              <span className="font-mono text-[#027081]">{percent}% ({opt.votes} votes)</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#027081] h-full rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No polls created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
