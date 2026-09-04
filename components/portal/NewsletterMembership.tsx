"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type Props = {
  isEnglish?: boolean;
  source?: string;
};

/** Blue newsletter membership box for homepage sidebar. */
export function NewsletterMembership({ isEnglish = false, source = "home-sidebar" }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source,
          locale: isEnglish ? "en" : "ne",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || (isEnglish ? "Subscription failed" : "सदस्यता असफल"));
      toast.success(json.message || (isEnglish ? "Subscribed" : "सदस्यता सफल भयो"));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : isEnglish ? "Failed" : "असफल");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white" style={{ backgroundColor: PORTAL.brand }}>
      <div className="mb-2 flex items-center gap-2">
        <Mail className="h-5 w-5" />
        <h3 className="text-sm font-extrabold">
          {isEnglish ? "Newsletter Membership" : "न्यूजलेटर सदस्यता"}
        </h3>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-white/95">
        {isEnglish
          ? "Get daily headlines in your inbox."
          : "दैनिक मुख्य समाचार इमेलमा पाउनुहोस्।"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isEnglish ? "your@email.com" : "इमेल ठेगाना"}
          className="w-full border-0 bg-white px-3 py-2 text-xs text-gray-900 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: PORTAL.accent }}
        >
          {loading ? "…" : isEnglish ? "Subscribe" : "सदस्यता लिनुहोस्"}
        </button>
      </form>
    </div>
  );
}
