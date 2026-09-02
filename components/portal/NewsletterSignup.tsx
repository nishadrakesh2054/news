"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export function NewsletterSignup({ source = "footer" }: { source?: string }) {
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
        body: JSON.stringify({ email: email.trim(), source, locale: "ne" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Subscription failed");
      toast.success(json.message || "सदस्यता सफल भयो");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-xs text-slate-400">
        दैनिक समाचार इमेलमा पाउनुहोस् — न्यूजलेटर सदस्यता
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-none border border-slate-700 bg-slate-900 py-2 pl-8 pr-3 text-xs text-white outline-none focus:border-[#027081]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-none bg-[#027081] px-3 py-2 text-xs font-bold text-white hover:bg-[#025f6b] disabled:opacity-50"
        >
          {loading ? "…" : "सदस्यता"}
        </button>
      </div>
    </form>
  );
}
