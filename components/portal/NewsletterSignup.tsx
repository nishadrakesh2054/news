"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type NewsletterSignupProps = {
  source?: string;
  isEnglish?: boolean;
};

export function NewsletterSignup({ source = "footer", isEnglish = false }: NewsletterSignupProps) {
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
      toast.success(
        json.message ||
          (isEnglish ? "Subscribed successfully" : "सदस्यता सफल भयो")
      );
      setEmail("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isEnglish
            ? "Failed to subscribe"
            : "सदस्यता लिन सकिएन"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <p className="text-xs leading-relaxed text-white/60">
        {isEnglish
          ? "Get daily headlines in your inbox."
          : "दैनिक समाचार इमेलमा पाउनुहोस्।"}
      </p>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isEnglish ? "your@email.com" : "इमेल ठेगाना"}
            className="w-full border border-white/15 bg-[#061325] py-2.5 pl-8 pr-3 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 px-3.5 py-2.5 text-xs font-bold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: PORTAL.brand }}
        >
          {loading ? "…" : isEnglish ? "Join" : "सदस्यता"}
        </button>
      </div>
    </form>
  );
}
