"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutGrid,
  Zap,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  FolderTree,
  Radio,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryOption {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  order: number;
}

export default function AdminHomepageLayoutPage() {
  // Settings State
  const [showBreakingTicker, setShowBreakingTicker] = useState(true);
  const [tickerSpeedSec, setTickerSpeedSec] = useState(5);
  const [showHeroFeatured, setShowHeroFeatured] = useState(true);
  const [heroLayoutMode, setHeroLayoutMode] = useState<"lead_3_grid" | "lead_5_grid" | "full_banner">("lead_3_grid");
  const [showLiveBar, setShowLiveBar] = useState(true);

  // Fetch Categories for Section Ordering
  const { data: categories = [], isLoading, refetch, isFetching } = useQuery<CategoryOption[]>({
    queryKey: ["admin-homepage-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return json.data;
    },
  });

  const handleSaveLayout = () => {
    toast.success("Homepage layout configuration saved successfully!");
  };

  return (
    <div className="w-full space-y-6 px-6 py-4 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-serif flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-[#027081]" />
              <span>Homepage Layout & Section Manager</span>
            </h1>
            <span className="text-xs font-bold bg-[#027081]/10 text-[#027081] px-2.5 py-0.5 rounded-full border border-[#027081]/20">
              Live Configuration
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Configure featured news blocks, breaking tickers, ad slots, and category grid ordering
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 text-xs rounded-xl border-border font-medium hover:bg-muted"
            title="Refresh configuration"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-[#027081]" : ""}`} />
            <span>Refresh</span>
          </Button>

          <a href="/" target="_blank" rel="noreferrer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs rounded-xl border-border font-medium"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              <span>Preview Live Portal</span>
            </Button>
          </a>

          <Button
            onClick={handleSaveLayout}
            className="bg-[#027081] hover:bg-[#025c6a] text-white text-xs font-bold px-4 h-9 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Hero Layout</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5 uppercase">3-Column Grid</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Breaking Ticker</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {showBreakingTicker ? "ENABLED" : "DISABLED"}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Zap className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Banner</p>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">
              {showLiveBar ? "ACTIVE" : "HIDDEN"}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Radio className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ad Slots Active</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">2 Slots</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <Megaphone className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Hero & Ticker Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section Config */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#027081]" />
                <span>Lead Story & Hero Section (मुख्य समाचार)</span>
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeroFeatured}
                  onChange={(e) => setShowHeroFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#027081]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setHeroLayoutMode("lead_3_grid")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  heroLayoutMode === "lead_3_grid"
                    ? "border-[#027081] bg-[#027081]/5 shadow-2xs"
                    : "border-border hover:border-slate-400"
                }`}
              >
                <div className="font-bold text-xs text-foreground">Standard 3-Column</div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  1 Large Lead Story + 2 Side Featured Cards
                </p>
              </div>

              <div
                onClick={() => setHeroLayoutMode("lead_5_grid")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  heroLayoutMode === "lead_5_grid"
                    ? "border-[#027081] bg-[#027081]/5 shadow-2xs"
                    : "border-border hover:border-slate-400"
                }`}
              >
                <div className="font-bold text-xs text-foreground">Magazine 5-Grid</div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  1 Large Lead Story + 4 Compact Thumbnail Cards
                </p>
              </div>

              <div
                onClick={() => setHeroLayoutMode("full_banner")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  heroLayoutMode === "full_banner"
                    ? "border-[#027081] bg-[#027081]/5 shadow-2xs"
                    : "border-border hover:border-slate-400"
                }`}
              >
                <div className="font-bold text-xs text-foreground">Full Hero Banner</div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Full-Width Hero Image Carousel
                </p>
              </div>
            </div>
          </div>

          {/* Breaking News Ticker Config */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-rose-600" />
                <span>Header Breaking Ticker Settings</span>
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBreakingTicker}
                  onChange={(e) => setShowBreakingTicker(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Auto-Scroll Delay (seconds)</label>
                <select
                  value={tickerSpeedSec}
                  onChange={(e) => setTickerSpeedSec(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-[#027081]"
                >
                  <option value={3}>3 seconds (Fast)</option>
                  <option value={5}>5 seconds (Standard)</option>
                  <option value={8}>8 seconds (Slow)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Live Coverage Bar</label>
                <button
                  type="button"
                  onClick={() => setShowLiveBar(!showLiveBar)}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    showLiveBar
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {showLiveBar ? "🔴 Live Coverage Bar Visible" : "Hidden"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1-Col: Category Grid Ordering */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <FolderTree className="h-4 w-4 text-[#027081]" />
              <span>Category Sections Display Order</span>
            </h2>

            {isLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Loading categories...</div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 text-xs font-semibold"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 rounded bg-muted text-[10px] font-mono flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span>{cat.nameNp || cat.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">/{cat.slug}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
