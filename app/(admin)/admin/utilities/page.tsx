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
  const [goldFine, setGoldFine] = useState("१,६०,५००");
  const [goldTejabi, setGoldTejabi] = useState("१,५९,८००");
  const [silver, setSilver] = useState("१,९५०");
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
        toast.success(json.message || "सफलतापूर्वक अद्यावधिक सेभ भयो!");
      } else {
        toast.error(json.error || "सेभ गर्न सकिएन");
      }
    } catch {
      toast.error("सर्भर त्रुटि");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 px-6 py-4 pb-12 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-serif flex items-center gap-2">
              <Coins className="h-6 w-6 text-[#027081]" />
              <span>बजार दररेट तथा दैनिक राशिफल सम्पादकीय प्यानल</span>
            </h1>
            <span className="text-xs font-bold bg-[#027081]/10 text-[#027081] px-2.5 py-0.5 rounded-full border border-[#027081]/20">
              सम्पादक नियन्त्रण
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            छापावाल र तेजाबी सुन, चाँदीको भाउ तथा १२ राशिको विस्तृत फल अद्यावधिक गर्नुहोस्। विदेशी विनिमय दर NRB API बाट स्वतः चल्छ।
          </p>
        </div>

        <Button
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-[#027081] hover:bg-[#025c6a] text-white text-xs font-bold px-6 h-10 rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all shrink-0"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "सेभ हुँदैछ..." : "सबै अद्यावधिक सेभ गर्नुहोस्"}</span>
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
          <span>१. सुन-चाँदीको दररेट सम्पादन</span>
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
          <span>२. १२ राशिको राशिफल सम्पादन</span>
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
          <span>३. विनिमय दर सूची (NRB API)</span>
        </button>
      </div>

      {/* TAB 1: Gold & Silver Editor */}
      {activeTab === "gold" && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 font-serif">
              <Coins className="h-5 w-5 text-amber-500" />
              <span>आजको सुन तथा चाँदीको आधिकारिक बजार मूल्य</span>
            </h2>
            <Button
              onClick={() => handleSave()}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>दररेट सेभ गर्नुहोस्</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="space-y-2 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-600" />
                <span>छापावाल सुन (24K):</span>
              </label>
              <input
                type="text"
                value={goldFine}
                onChange={(e) => setGoldFine(e.target.value)}
                placeholder="उदा: १,६०,५००"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-[#027081] outline-none font-bold"
              />
              <span className="text-[10px] text-muted-foreground block font-mono">प्रति तोला रु.</span>
            </div>

            <div className="space-y-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                <span>तेजाबी सुन (22K):</span>
              </label>
              <input
                type="text"
                value={goldTejabi}
                onChange={(e) => setGoldTejabi(e.target.value)}
                placeholder="उदा: १,५९,८००"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-[#027081] outline-none font-bold"
              />
              <span className="text-[10px] text-muted-foreground block font-mono">प्रति तोला रु.</span>
            </div>

            <div className="space-y-2 p-4 rounded-xl border border-slate-400/30 bg-muted/20">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-slate-500" />
                <span>चाँदी (Silver):</span>
              </label>
              <input
                type="text"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
                placeholder="उदा: १,९५०"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-[#027081] outline-none font-bold"
              />
              <span className="text-[10px] text-muted-foreground block font-mono">प्रति तोला रु.</span>
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
                १२ वटै राशिको विस्तृत फल अद्यावधिक (Astrological Predictions Editor)
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setRashifal(DEFAULT_DETAILED_RASHIFAL)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border px-3 py-1.5 rounded-lg bg-background"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>डिफल्ट फल लोड गर्नुहोस्</span>
              </button>
              <Button
                onClick={() => handleSave()}
                size="sm"
                className="bg-[#027081] hover:bg-[#025c6a] text-white text-xs font-bold"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                <span>राशिफल सेभ गर्नुहोस्</span>
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
                    <span>{rashi.name} ({rashi.enName || ""})</span>
                  </div>
                </div>

                {/* Metadata Fields Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">शुभ अङ्क:</label>
                    <input
                      type="text"
                      value={rashi.luckyNumber || "९"}
                      onChange={(e) => handleRashiChange(idx, "luckyNumber", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">शुभ रङ्ग:</label>
                    <input
                      type="text"
                      value={rashi.luckyColor || "रातो"}
                      onChange={(e) => handleRashiChange(idx, "luckyColor", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold text-[#027081]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">दिशा:</label>
                    <input
                      type="text"
                      value={rashi.luckyDirection || "पूर्व"}
                      onChange={(e) => handleRashiChange(idx, "luckyDirection", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground">भाग्य %:</label>
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
                  <label className="font-bold text-foreground">समग्र फल (Overview):</label>
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
                    <span>स्वास्थ्य (Health):</span>
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
                    <span>व्यापार र अर्थ (Business):</span>
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
                    <span>प्रेम र सम्बन्ध (Love):</span>
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
                    <span>ज्योतिषीय उपाय र सुझाव (Remedy):</span>
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
              <span>नेपाल राष्ट्र बैंक (NRB) सबै देशको विनिमय दर</span>
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
                    <th className="p-3.5">मुद्रा Code</th>
                    <th className="p-3.5">देश / मुद्रा Name</th>
                    <th className="p-3.5">इकाई Unit</th>
                    <th className="p-3.5">खरिद दर (Buying Rate)</th>
                    <th className="p-3.5 text-right">बिक्री दर (Selling Rate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {forexData.map((f: ForexItem, idx: number) => (
                    <tr key={f.code ? `${f.code}-${idx}` : `forex-${idx}`} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#027081]">{f.code}</td>
                      <td className="p-3.5 font-bold text-foreground">{f.nameNp}</td>
                      <td className="p-3.5 font-mono font-bold">{f.unit}</td>
                      <td className="p-3.5 font-extrabold text-[#027081]">रु. {f.buy}</td>
                      <td className="p-3.5 font-bold text-right text-emerald-600 dark:text-emerald-400">रु. {f.sell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
              विदेशी विनिमय दर अद्यावधिक हुँदैछ...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
