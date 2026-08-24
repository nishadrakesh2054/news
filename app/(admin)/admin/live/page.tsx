"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Radio, Plus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LiveUpdateItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface LiveArticleItem {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  status: string;
  updatedAt: string;
  category: {
    name: string;
    nameNp: string | null;
  };
  liveUpdates: LiveUpdateItem[];
}

export default function AdminLivePage() {
  const queryClient = useQueryClient();
  const [selectedArticle, setSelectedArticle] = useState<LiveArticleItem | null>(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");

  const { data: liveArticles = [], isLoading, isError } = useQuery<LiveArticleItem[]>({
    queryKey: ["admin-live"],
    queryFn: async () => {
      const res = await fetch("/api/admin/live");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch live articles");
      return json.data;
    },
  });

  const postUpdateMutation = useMutation({
    mutationFn: async ({ articleId, title, content }: { articleId: string; title: string; content: string }) => {
      const res = await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, title, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to post live update");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Live update posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-live"] });
      setUpdateTitle("");
      setUpdateContent("");
      setSelectedArticle(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !updateTitle || !updateContent) {
      toast.error("Title and update details are required");
      return;
    }

    postUpdateMutation.mutate({
      articleId: selectedArticle.id,
      title: updateTitle,
      content: updateContent,
    });
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-600 animate-pulse" />
            <span>Live Coverage & Real-time Blog Ticker</span>
          </h1>
        </div>
        <Link href="/admin/articles/new">
          <Button className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200">
            <Plus className="h-3.5 w-3.5" />
            <span>New Live Coverage Story</span>
          </Button>
        </Link>
      </div>

      {/* Live Articles Stream */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading live coverage stories...</div>
        ) : isError ? (
          <div className="p-12 text-center text-destructive">Failed to load live coverage stories.</div>
        ) : liveArticles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
            No active Live Coverage stories right now. Create a new article with format &quot;LIVE&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {liveArticles.map((art) => (
              <div key={art.id} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                        LIVE NOW
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {art.category.nameNp || art.category.name}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {art.titleNp || art.title}
                    </h2>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedArticle(art);
                      setUpdateTitle("");
                      setUpdateContent("");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Post Live Update
                  </Button>
                </div>

                {/* Timeline of Live Updates */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Recent Live Updates ({art.liveUpdates.length})
                  </h3>

                  {art.liveUpdates.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">No live updates posted yet.</div>
                  ) : (
                    <div className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                      {art.liveUpdates.map((upd) => (
                        <div key={upd.id} className="space-y-1 relative">
                          <div className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              {new Date(upd.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <h4 className="text-sm font-bold text-foreground">{upd.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {upd.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Posting Update */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold">Post Live Ticker Update</h2>
                <p className="text-xs text-muted-foreground truncate max-w-sm">
                  {selectedArticle.titleNp || selectedArticle.title}
                </p>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Update Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Latest live updates on the election..."
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Live Update Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed update text..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedArticle(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={postUpdateMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {postUpdateMutation.isPending ? "Posting..." : "Publish Live Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
