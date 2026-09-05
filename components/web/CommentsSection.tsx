"use client";

import { useState, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { PORTAL } from "@/constants/portal";

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
  isEnglish?: boolean;
}

export function CommentsSection({ articleId, isEnglish = false }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      if (data.success) {
        const payload = data.data;
        setComments(Array.isArray(payload) ? payload : payload?.comments || []);
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
          const payload = data.data;
          setComments(Array.isArray(payload) ? payload : payload?.comments || []);
        }
      })
      .catch((err) => console.error("Failed to load comments", err))
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
        body: JSON.stringify({ content, authorName, authorEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setContent("");
        if (data.data?.status === "APPROVED") fetchComments();
      } else {
        setMessage({
          type: "error",
          text:
            data.message ||
            (isEnglish ? "Could not post comment." : "प्रतिक्रिया पठाउन सकिएन।"),
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: isEnglish ? "Something went wrong. Try again." : "समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400";

  return (
    <section className="mt-10 border-t pt-6" style={{ borderColor: PORTAL.rule }}>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-extrabold" style={{ color: PORTAL.brand }}>
          {isEnglish ? `Comments (${comments.length})` : `प्रतिक्रिया (${comments.length})`}
        </h2>
        <div
          className="h-px min-w-4 flex-1"
          style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        {message ? (
          <p
            className="text-xs"
            style={{ color: message.type === "success" ? PORTAL.brand : PORTAL.accent }}
          >
            {message.text}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={isEnglish ? "Name *" : "नाम *"}
            aria-label={isEnglish ? "Name" : "नाम"}
            className={fieldClass}
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder={isEnglish ? "Email (private)" : "ईमेल (गोप्य)"}
            aria-label={isEnglish ? "Email" : "ईमेल"}
            className={fieldClass}
          />
        </div>

        <textarea
          required
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isEnglish ? "Write a comment…" : "प्रतिक्रिया लेख्नुहोस्…"}
          aria-label={isEnglish ? "Comment" : "प्रतिक्रिया"}
          className={`${fieldClass} resize-y`}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: PORTAL.brand }}
          >
            <Send className="h-3 w-3" />
            {submitting
              ? isEnglish
                ? "Sending…"
                : "पठाउँदै…"
              : isEnglish
                ? "Post"
                : "पठाउनुहोस्"}
          </button>
        </div>
      </form>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <p className="py-4 text-center text-xs text-gray-400">
            {isEnglish ? "Loading comments…" : "प्रतिक्रिया लोड हुँदैछ…"}
          </p>
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 py-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-bold"
                style={{
                  color: PORTAL.brand,
                  backgroundColor: "rgba(25, 87, 166, 0.08)",
                }}
              >
                {(c.author?.name || c.authorName || "ग").charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-xs font-semibold" style={{ color: PORTAL.ink }}>
                    {c.author?.name || c.authorName || (isEnglish ? "Anonymous" : "अज्ञात")}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatTimeAgo(c.createdAt, isEnglish ? "en" : "ne")}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-700">{c.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs text-gray-400">
            {isEnglish
              ? "No comments yet. Be the first."
              : "अहिलेसम्म कुनै प्रतिक्रिया छैन।"}
          </p>
        )}
      </div>
    </section>
  );
}
