"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Coins,
  Sparkles,
  Save,
  CheckCircle2,
  Globe,
  Award,
  RotateCcw,
  Heart,
  Briefcase,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_DETAILED_RASHIFAL, DetailedRashi } from "@/lib/rashifal";

interface ForexItem {
  code: string;
  nameNp: string;
  unit: number;
  buy: string;
  sell: string;
}

export default function AdminUtilitiesPage() {
  const [goldFine, setGoldFine] = useState("1,60,500");
  const [goldTejabi, setGoldTejabi] = useState("1,59,800");
  const [silver, setSilver] = useState("1,950");
  const [rashifal, setRashifal] = useState<DetailedRashi[]>(DEFAULT_DETAILED_RASHIFAL);
  const [forexData, setForexData] = useState<ForexItem[]>([]);

  const [activeTab, setActiveTab] = useState<"gold" | "rashifal" | "forex">("gold");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.gold?.fine) setGoldFine(json.data.gold.fine);
          if (json.data.gold?.tejabi) setGoldTejabi(json.data.gold.tejabi);
          if (json.data.gold?.silver) setSilver(json.data.gold.silver);
          if (json.data.rashifal && Array.isArray(json.data.rashifal)) {
            setRashifal(json.data.rashifal);
          }
          if (json.data.allForexRates) setForexData(json.data.allForexRates);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRashiChange = (index: number, field: keyof DetailedRashi, val: string | number) => {
    const updated = [...rashifal];
    updated[index] = { ...updated[index], [field]: val };
    setRashifal(updated);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/utilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goldFine,
          goldTejabi,
          silver,
          rashifal,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Updates saved successfully!");
      } else {
        toast.error(json.error || "Failed to save updates");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#027081]" />
            <span>Market Rates & Daily Horoscope Management</span>
          </h1>
        </div>

        <Button
          onClick={() => handleSave()}
          disabled={saving}
          className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save All Updates"}</span>
        </Button>
      </div>

      {/* Control Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("gold")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "gold"
              ? "bg-[#027081] text-white shadow-xs"
              : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Coins className="h-4 w-4 text-amber-400" />
          <span>1. Gold & Silver Rates</span>
        </button>

        <button
          onClick={() => setActiveTab("rashifal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "rashifal"
              ? "bg-[#027081] text-white shadow-xs"
              : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>2. 12 Rashis Horoscope</span>
        </button>

        <button
          onClick={() => setActiveTab("forex")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "forex"
              ? "bg-[#027081] text-white shadow-xs"
              : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Globe className="h-4 w-4 text-emerald-400" />
          <span>3. Foreign Exchange Rates (NRB)</span>
        </button>
      </div>

      {/* TAB 1: Gold & Silver Editor */}
      {activeTab === "gold" && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 font-serif">
              <Coins className="h-5 w-5 text-amber-500" />
              <span>Official Gold & Silver Market Prices</span>
            </h2>
            <Button
              onClick={() => handleSave()}
              className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Rates</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="space-y-2 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-600" />
                <span>Fine Gold (24K):</span>
              </label>
              <input
                type="text"
                value={goldFine}
                onChange={(e) => setGoldFine(e.target.value)}
                placeholder="e.g. 1,60,500"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-[#027081] outline-none font-bold"
              />
              <span className="text-[10px] text-muted-foreground block font-mono">per tola (Rs.)</span>
            </div>

            <div className="space-y-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Tejabi Gold (22K):</span>
              </label>
              <input
                type="text"
                value={goldTejabi}
                onChange={(e) => setGoldTejabi(e.target.value)}
                placeholder="e.g. 1,59,800"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-[#027081] outline-none font-bold"
              />
              <span className="text-[10px] text-muted-foreground block font-mono">per tola (Rs.)</span>
            </div>

            <div className="space-y-2 p-4 rounded-xl border border-slate-400/30 bg-muted/20">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-slate-500" />
                <span>Silver:</span>
              </label>
              <input
                type="text"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
                placeholder="e.g. 1,950"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-[#027081] outline-none font-bold"
              />
              <span className="text-[10px] text-muted-foreground block font-mono">per tola (Rs.)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Detailed 12 Rashis Rashifal Editor */}
      {activeTab === "rashifal" && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-foreground font-serif">
                12 Rashis Horoscope Predictions
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setRashifal(DEFAULT_DETAILED_RASHIFAL)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border px-3 py-1.5 rounded-lg bg-background"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Load Default Predictions</span>
              </button>
              <Button
                onClick={() => handleSave()}
                className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Horoscope</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {rashifal.map((rashi, idx) => (
              <div
                key={rashi.name ? `${rashi.name}-${idx}` : `rashi-${idx}`}
                className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3.5 shadow-2xs"
              >
                {/* Rashi Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center space-x-2 font-serif font-bold text-foreground text-sm">
                    <span className="text-2xl bg-amber-400/20 text-amber-600 dark:text-amber-300 h-9 w-9 rounded-xl flex items-center justify-center border border-amber-400/30">
                      {rashi.symbol}
                    </span>
                    <span>{rashi.enName || rashi.name} ({rashi.name})</span>
                  </div>
                </div>

                {/* Metadata Fields Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">Lucky No:</label>
                    <input
                      type="text"
                      value={rashi.luckyNumber || "9"}
                      onChange={(e) => handleRashiChange(idx, "luckyNumber", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">Color:</label>
                    <input
                      type="text"
                      value={rashi.luckyColor || "Red"}
                      onChange={(e) => handleRashiChange(idx, "luckyColor", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold text-[#027081]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">Direction:</label>
                    <input
                      type="text"
                      value={rashi.luckyDirection || "East"}
                      onChange={(e) => handleRashiChange(idx, "luckyDirection", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">Luck %:</label>
                    <input
                      type="number"
                      value={rashi.luckyPercent || 85}
                      onChange={(e) => handleRashiChange(idx, "luckyPercent", Number(e.target.value))}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold text-emerald-600"
                    />
                  </div>
                </div>

                {/* Overview */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Overview:</label>
                  <textarea
                    rows={2}
                    value={rashi.overview}
                    onChange={(e) => handleRashiChange(idx, "overview", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs leading-relaxed"
                  />
                </div>

                {/* Health */}
                <div className="space-y-1">
                  <label className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>Health:</span>
                  </label>
                  <textarea
                    rows={1}
                    value={rashi.health || ""}
                    onChange={(e) => handleRashiChange(idx, "health", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs leading-relaxed"
                  />
                </div>

                {/* Business */}
                <div className="space-y-1">
                  <label className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>Business & Finance:</span>
                  </label>
                  <textarea
                    rows={1}
                    value={rashi.business || ""}
                    onChange={(e) => handleRashiChange(idx, "business", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs leading-relaxed"
                  />
                </div>

                {/* Love */}
                <div className="space-y-1">
                  <label className="font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>Love & Relationships:</span>
                  </label>
                  <textarea
                    rows={1}
                    value={rashi.love || ""}
                    onChange={(e) => handleRashiChange(idx, "love", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs leading-relaxed"
                  />
                </div>

                {/* Astrological Remedy */}
                <div className="space-y-1">
                  <label className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Astrological Remedy:</span>
                  </label>
                  <textarea
                    rows={1}
                    value={rashi.remedy || ""}
                    onChange={(e) => handleRashiChange(idx, "remedy", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NRB Forex Table View */}
      {activeTab === "forex" && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-base font-bold text-foreground flex items-center gap-2 font-serif">
              <Globe className="h-5 w-5 text-[#027081]" />
              <span>Nepal Rastra Bank (NRB) Exchange Rates</span>
            </span>
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>NRB Live API Synced</span>
            </span>
          </div>

          {forexData && Array.isArray(forexData) ? (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#027081] text-white uppercase text-[11px] font-bold font-mono">
                  <tr>
                    <th className="p-3.5">Currency Code</th>
                    <th className="p-3.5">Country / Currency Name</th>
                    <th className="p-3.5">Unit</th>
                    <th className="p-3.5">Buying Rate</th>
                    <th className="p-3.5 text-right">Selling Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {forexData.map((f: ForexItem, idx: number) => (
                    <tr key={f.code ? `${f.code}-${idx}` : `forex-${idx}`} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#027081]">{f.code}</td>
                      <td className="p-3.5 font-bold text-foreground">{f.nameNp}</td>
                      <td className="p-3.5 font-mono font-bold">{f.unit}</td>
                      <td className="p-3.5 font-extrabold text-[#027081]">Rs. {f.buy}</td>
                      <td className="p-3.5 font-bold text-right text-emerald-600 dark:text-emerald-400">Rs. {f.sell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
              Loading foreign exchange rates...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
