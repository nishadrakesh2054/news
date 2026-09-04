"use client";

import { useState, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
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

  const inputClass =
    "w-full border-0 border-b bg-transparent px-0 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-b-2";

  return (
    <section className="mt-12 border-t pt-8" style={{ borderColor: PORTAL.rule }}>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-extrabold sm:text-base" style={{ color: PORTAL.brand }}>
          {isEnglish ? `Comments (${comments.length})` : `प्रतिक्रिया (${comments.length})`}
        </h2>
        <div
          className="h-px min-w-4 flex-1"
          style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-10 space-y-5">
        {message ? (
          <p
            className="text-[13px]"
            style={{ color: message.type === "success" ? PORTAL.brand : PORTAL.accent }}
          >
            {message.text}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
              {isEnglish ? "Name" : "नाम"}{" "}
              <span style={{ color: PORTAL.accent }}>*</span>
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={isEnglish ? "Your name" : "तपाईंको नाम"}
              className={inputClass}
              style={{ borderColor: PORTAL.rule }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
              {isEnglish ? "Email (private)" : "ईमेल (गोप्य)"}
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder={isEnglish ? "Email address" : "ईमेल ठेगाना"}
              className={inputClass}
              style={{ borderColor: PORTAL.rule }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
            {isEnglish ? "Comment" : "प्रतिक्रिया"}{" "}
            <span style={{ color: PORTAL.accent }}>*</span>
          </label>
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isEnglish ? "Share your thoughts…" : "आफ्नो प्रतिक्रिया लेख्नुहोस्…"
            }
            className={`${inputClass} resize-y`}
            style={{ borderColor: PORTAL.rule }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center gap-2 px-4 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: PORTAL.brand }}
        >
          <Send className="h-3.5 w-3.5" />
          {submitting
            ? isEnglish
              ? "Sending…"
              : "पठाउँदै…"
            : isEnglish
              ? "Post comment"
              : "प्रतिक्रिया पठाउनुहोस्"}
        </button>
      </form>

      <div className="space-y-0 divide-y divide-gray-100">
        {loading ? (
          <p className="py-6 text-center text-[13px] text-gray-400">
            {isEnglish ? "Loading comments…" : "प्रतिक्रिया लोड हुँदैछ…"}
          </p>
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 py-5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-bold"
                style={{
                  color: PORTAL.brand,
                  backgroundColor: "rgba(25, 87, 166, 0.08)",
                }}
              >
                {(c.author?.name || c.authorName || "ग").charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[13px] font-semibold" style={{ color: PORTAL.ink }}>
                    {c.author?.name || c.authorName || (isEnglish ? "Anonymous" : "अज्ञात")}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {formatTimeAgoNp(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-gray-700">{c.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-[13px] text-gray-400">
            {isEnglish
              ? "No comments yet. Be the first."
              : "अहिलेसम्म कुनै प्रतिक्रिया छैन। पहिलो टिप्पणीकर्ता बन्नुहोस्।"}
          </p>
        )}
      </div>
    </section>
  );
}
