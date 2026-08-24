"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Check, X, ShieldAlert, Trash2, ExternalLink } from "lucide-react";

interface AdminComment {
  id: string;
  content: string;
  authorName: string | null;
  authorEmail: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  createdAt: string;
  article: {
    id: string;
    title: string;
    titleNp: string | null;
    slug: string;
  };
  author?: {
    name: string;
    email: string;
  } | null;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("PENDING");

  useEffect(() => {
    let ignore = false;
    async function loadComments() {
      try {
        const res = await fetch(`/api/admin/comments?status=${activeTab}`);
        const data = await res.json();
        if (!ignore && data.success) {
          setComments(data.data.comments || []);
        }
      } catch (err) {
        console.error("Failed to load admin comments", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadComments();
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#027081]" />
            <span>Comment Moderation</span>
          </h1>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-card p-1 rounded-sm border border-border shadow-2xs">
          {["PENDING", "APPROVED", "REJECTED", "SPAM"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setLoading(true);
                setActiveTab(tab);
              }}
              className={`px-3 py-1 rounded-xs text-xs font-bold transition-colors ${
                activeTab === tab
                  ? "bg-[#027081] text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "PENDING"
                ? "Pending"
                : tab === "APPROVED"
                ? "Approved"
                : tab === "REJECTED"
                ? "Rejected"
                : "Spam"}
            </button>
          ))}
        </div>
      </div>

      {/* Comment Cards Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">Loading...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    {comment.author?.name || comment.authorName || "Anonymous Reader"}
                  </span>
                  {(comment.author?.email || comment.authorEmail) && (
                    <span className="text-[11px] text-muted-foreground ml-2">
                      ({comment.author?.email || comment.authorEmail})
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Date: {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>

                <a
                  href={`/article/${comment.article.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#027081] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Story: {comment.article.title || comment.article.titleNp}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-muted/40 p-3 rounded-xl border border-border/30">
                {comment.content}
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2">
                {activeTab !== "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "APPROVED")}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {activeTab !== "REJECTED" && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "REJECTED")}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                {activeTab !== "SPAM" && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "SPAM")}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Mark Spam</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1.5 text-muted-foreground hover:text-rose-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
          No comments found.
        </div>
      )}
    </div>
  );
}
