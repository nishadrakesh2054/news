"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Send, X, Pencil, Trash2, Square } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminPanelHeader,
} from "@/constants/admin-layout";

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
  const [editingUpdate, setEditingUpdate] = useState<LiveUpdateItem | null>(null);

  const { data: liveArticles = [], isLoading, isError, refetch, isFetching } = useQuery<LiveArticleItem[]>({
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
      toast.success("Live update posted");
      queryClient.invalidateQueries({ queryKey: ["admin-live"] });
      setUpdateTitle("");
      setUpdateContent("");
      setSelectedArticle(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const editUpdateMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: string;
      title: string;
      content: string;
    }) => {
      const res = await fetch(`/api/admin/live/updates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to edit update");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Update saved");
      queryClient.invalidateQueries({ queryKey: ["admin-live"] });
      setEditingUpdate(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteUpdateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/live/updates/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete update");
    },
    onSuccess: () => {
      toast.success("Update deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-live"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const endLiveMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const res = await fetch("/api/admin/live/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to end live coverage");
    },
    onSuccess: () => {
      toast.success("Live coverage ended");
      queryClient.invalidateQueries({ queryKey: ["admin-live"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !updateTitle || !updateContent) {
      toast.error("Title and content are required");
      return;
    }
    postUpdateMutation.mutate({
      articleId: selectedArticle.id,
      title: updateTitle,
      content: updateContent,
    });
  };

  const totalUpdates = liveArticles.reduce((sum, art) => sum + art.liveUpdates.length, 0);

  return (
    <AdminPageShell
      title="Live coverage"
      description="Post real-time updates to live stories"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/articles/new" className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New live story
        </Link>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Live stories", value: liveArticles.length },
          { label: "Total updates", value: totalUpdates },
          {
            label: "Latest activity",
            value: liveArticles[0]
              ? new Date(liveArticles[0].updatedAt).toLocaleDateString()
              : "—",
          },
          { label: "Status", value: liveArticles.length > 0 ? "Active" : "None" },
        ]}
      />

      <p className="text-xs text-muted-foreground">
        Create articles with format &quot;Live&quot; to appear here.
      </p>

      {isLoading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Loading live stories…</p>
      ) : isError ? (
        <p className="py-8 text-center text-xs text-destructive">Failed to load live stories.</p>
      ) : liveArticles.length === 0 ? (
        <div className={`${adminPanel} px-3 py-10 text-center`}>
          <p className="text-xs text-muted-foreground">No live coverage stories yet.</p>
          <Link href="/admin/articles/new" className={`${adminBtnPrimary} mt-3 inline-flex`}>
            Create live story
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {liveArticles.map((art) => (
            <section key={art.id} className={adminPanel}>
              <div className={adminPanelHeader}>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-sm border border-[#0C4EA0]/30 bg-[#0C4EA0]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0C4EA0]">
                      Live
                    </span>
                    <span className={adminBadgeMuted}>
                      {art.category.nameNp || art.category.name}
                    </span>
                  </div>
                  <h2 className="truncate text-sm font-semibold text-foreground">
                    {art.titleNp || art.title}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/admin/articles/${art.id}/edit`} className={adminBtnSecondary}>
                    Edit story
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("End live coverage for this story?")) {
                        endLiveMutation.mutate(art.id);
                      }
                    }}
                    disabled={endLiveMutation.isPending}
                    className={adminBtnSecondary}
                    title="End live"
                  >
                    <Square className="h-3.5 w-3.5" />
                    End live
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArticle(art);
                      setUpdateTitle("");
                      setUpdateContent("");
                    }}
                    className={adminBtnPrimary}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Post update
                  </button>
                </div>
              </div>

              <div className="p-3">
                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Updates ({art.liveUpdates.length})
                </h3>
                {art.liveUpdates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No updates posted yet.</p>
                ) : (
                  <div className="divide-y divide-border border border-border">
                    {art.liveUpdates.map((upd) => (
                      <div key={upd.id} className="flex items-start justify-between gap-2 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                              {new Date(upd.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-xs font-medium text-foreground">{upd.title}</span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{upd.content}</p>
                        </div>
                        <div className="inline-flex shrink-0 items-center">
                          <button
                            type="button"
                            onClick={() => setEditingUpdate(upd)}
                            className={adminBtnGhost}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this update?")) deleteUpdateMutation.mutate(upd.id);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {editingUpdate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-lg`}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Edit live update</h2>
              <button
                type="button"
                onClick={() => setEditingUpdate(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editUpdateMutation.mutate({
                  id: editingUpdate.id,
                  title: editingUpdate.title,
                  content: editingUpdate.content,
                });
              }}
              className="space-y-3 p-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Headline</label>
                <input
                  type="text"
                  required
                  value={editingUpdate.title}
                  onChange={(e) =>
                    setEditingUpdate({ ...editingUpdate, title: e.target.value })
                  }
                  className={adminInput}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Content</label>
                <textarea
                  rows={4}
                  required
                  value={editingUpdate.content}
                  onChange={(e) =>
                    setEditingUpdate({ ...editingUpdate, content: e.target.value })
                  }
                  className={`${adminInput} h-auto min-h-[88px] py-2`}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setEditingUpdate(null)} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={adminBtnPrimary} disabled={editUpdateMutation.isPending}>
                  {editUpdateMutation.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedArticle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-lg`}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm font-semibold text-foreground">Post live update</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {selectedArticle.titleNp || selectedArticle.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-3 p-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Headline <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Update headline"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className={adminInput}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Content <span className="text-[#C3272E]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Update details…"
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className={`${adminInput} h-auto min-h-[88px] py-2`}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setSelectedArticle(null)} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={adminBtnPrimary} disabled={postUpdateMutation.isPending}>
                  <Send className="h-3.5 w-3.5" />
                  {postUpdateMutation.isPending ? "Posting…" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
