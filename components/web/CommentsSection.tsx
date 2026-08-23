"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, CheckCircle2, Clock } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";

interface CommentItem {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: string;
  author?: {
    name: string;
    image: string | null;
  } | null;
}

interface CommentsSectionProps {
  articleId: string;
}

export function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/articles/${articleId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setComments(data.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load comments", err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorName,
          authorEmail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setContent("");
        if (data.data?.status === "APPROVED") {
          fetchComments();
        }
      } else {
        setMessage({ type: "error", text: data.message || "प्रतिक्रिया पठाउन सकिएन।" });
      }
    } catch {
      setMessage({ type: "error", text: "समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-border space-y-8">
      <div className="flex items-center space-x-3">
        <MessageSquare className="h-6 w-6 text-[#027081]" />
        <h3 className="text-xl font-extrabold text-foreground font-serif">
          प्रतिक्रिया तथा टिप्पणीहरू ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-foreground">तपाईंको विचार व्यक्त गर्नुहोस्</h4>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              तपाईंको नाम <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="नाम लेख्नुहोस्..."
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-[#027081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              ईमेल (गोप्य रहनेछ)
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="ईमेल ठेगाना..."
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-[#027081]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            प्रतिक्रिया <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="यहाँ आफ्नो प्रतिक्रिया वा टिप्पणी लेख्नुहोस्..."
            className="w-full p-3.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-[#027081]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#027081] hover:bg-[#025a68] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>{submitting ? "पठाउँदैछ..." : "प्रतिक्रिया पठाउनुहोस्"}</span>
        </button>
      </form>

      {/* Approved Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">प्रतिक्रियाहरू लोड हुँदैछन्...</div>
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-[#027081]/10 text-[#027081] font-bold text-xs flex items-center justify-center">
                    {(c.author?.name || c.authorName || "ग").charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {c.author?.name || c.authorName || "अज्ञात"}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgoNp(c.createdAt)}
                </span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed pl-9">{c.content}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
            अहिलेसम्म कुनै प्रतिक्रिया आएको छैन। पहिलो टिप्पणीकर्ता बन्नुहोस्!
          </div>
        )}
      </div>
    </section>
  );
}
