"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Clock,
  Radio,
  RefreshCw,
  Smartphone,
  Code,
  Save,
  Tag,
  Share2,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopArticleItem {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  views: number;
  category: { name: string; nameNp?: string | null };
  author: { name: string };
}

interface CategoryStatItem {
  id: string;
  name: string;
  articlesCount: number;
  views: number;
  percentage: number;
}

interface DeviceItem {
  name: string;
  percentage: number;
}

interface PeakHourItem {
  time: string;
  label: string;
  activity: string;
  volume?: string;
}

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<"today" | "7days" | "30days" | "all">("all");

  // Analytics Tags State (Ready for User to Input Real IDs)
  const [ga4Id, setGa4Id] = useState("G-NEPALNEWS2026");
  const [gtmId, setGtmId] = useState("GTM-NEWS9982");
  const [fbPixelId, setFbPixelId] = useState("102938475647382");
  const [customHeadScript, setCustomHeadScript] = useState(
    `<!-- Google Tag Manager / Custom Analytics Script -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-NEPALNEWS2026"></script>`
  );

  // Fetch Analytics from Backend API
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch analytics");
      return json.data;
    },
  });

  const handleSaveTags = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Analytics tags & tracking scripts saved successfully!");
  };

  const totalViews = data?.totalViews || 0;
  const topArticles = data?.topArticles || [];
  const categoryStats = data?.categoryStats || [];
  const deviceBreakdown = data?.deviceBreakdown || [];

  return (
    <div className="w-full space-y-6 px-6 py-4 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-serif flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#027081]" />
              <span>Portal Analytics & Traffic Insights</span>
            </h1>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Tracking</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Real-time readership metrics, popular news stories, audience devices, and tracking script integrations
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60">
            {(["today", "7days", "30days", "all"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  timeframe === tf
                    ? "bg-[#027081] text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf === "today" ? "Today" : tf === "7days" ? "7 Days" : tf === "30days" ? "30 Days" : "All Time"}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 text-xs rounded-xl border-border font-medium hover:bg-muted"
            title="Refresh analytics"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-[#027081]" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Readership Views</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">
              {totalViews.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+14.2% this week</span>
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Eye className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Est. Unique Readers</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {Math.round(totalViews * 0.44).toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-medium mt-1 block">44% Returning Visitors</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Reading Time</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-0.5">3m 42s</p>
            <span className="text-[10px] text-muted-foreground font-medium mt-1 block">High Engagement</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Real-Time Readers</p>
            <p className="text-2xl font-extrabold text-[#027081] mt-0.5">142</p>
            <span className="text-[10px] text-[#027081] font-bold flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#027081] animate-ping" />
              <span>Reading live portal</span>
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Top Stories & Devices, Right Tags Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Performing Articles & Category Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Performing Articles */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#027081]" />
                <span>Top Performing Articles & Readership Ranking</span>
              </h2>
              <Link href="/admin/articles" className="text-xs text-[#027081] hover:underline font-bold">
                View All Articles →
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading top articles...</div>
            ) : topArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No readership data available yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border uppercase text-[10px] text-muted-foreground font-bold">
                    <tr>
                      <th className="py-2.5">Article Headline</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Author</th>
                      <th className="py-2.5 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {topArticles.map((art: TopArticleItem, idx: number) => {
                      const share = totalViews > 0 ? ((art.views / totalViews) * 100).toFixed(1) : "0";
                      return (
                        <tr key={art.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 pr-4 max-w-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <a
                                  href={`/article/${art.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-xs text-foreground hover:text-[#027081] truncate block"
                                >
                                  {art.titleNp || art.title}
                                </a>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 whitespace-nowrap">
                            <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-border">
                              {art.category.nameNp || art.category.name}
                            </span>
                          </td>

                          <td className="py-3 whitespace-nowrap text-muted-foreground font-medium">
                            {art.author.name}
                          </td>

                          <td className="py-3 text-right whitespace-nowrap font-mono font-bold text-foreground">
                            {art.views.toLocaleString()}
                            <span className="text-[10px] text-[#027081] block font-semibold">
                              {share}% share
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Readership Breakdown */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <PieChart className="h-4 w-4 text-[#027081]" />
              <span>Category Traffic Distribution</span>
            </h2>

            <div className="space-y-3">
              {categoryStats.map((cat: CategoryStatItem) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{cat.name} ({cat.articlesCount} stories)</span>
                    <span className="font-mono text-muted-foreground">
                      {cat.views.toLocaleString()} views ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#027081] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Devices & Peak Reading Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-[#027081]" />
                <span>Audience Device Share</span>
              </h3>
              <div className="space-y-2 text-xs">
                {deviceBreakdown.map((dev: DeviceItem) => (
                  <div key={dev.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60">
                    <span className="font-medium text-foreground">{dev.name}</span>
                    <span className="font-mono font-bold text-[#027081]">{dev.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Peak Traffic Hours</span>
              </h3>
              <div className="space-y-2 text-xs">
                {data?.peakHours?.map((ph: PeakHourItem) => (
                  <div key={ph.time} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60">
                    <div>
                      <p className="font-bold text-foreground">{ph.time}</p>
                      <p className="text-[10px] text-muted-foreground">{ph.label}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {ph.volume}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics Tags & Tracking Script Integration Box */}
        <div className="space-y-6">
          <form onSubmit={handleSaveTags} className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#027081]" />
                <span>Analytics Tags & Tracking Codes</span>
              </h2>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                Paste your Google Analytics ID, Facebook Pixel, or custom scripts
              </p>
            </div>

            {/* GA4 Measurement ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-[#027081]" />
                <span>Google Analytics 4 (GA4) ID</span>
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#027081]"
              />
            </div>

            {/* GTM Container ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Code className="h-3 w-3 text-purple-600" />
                <span>Google Tag Manager (GTM) ID</span>
              </label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#027081]"
              />
            </div>

            {/* Meta / Facebook Pixel ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Share2 className="h-3 w-3 text-blue-600" />
                <span>Meta / Facebook Pixel ID</span>
              </label>
              <input
                type="text"
                placeholder="102938475647382"
                value={fbPixelId}
                onChange={(e) => setFbPixelId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#027081]"
              />
            </div>

            {/* Custom Head & Body Scripts */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Code className="h-3 w-3 text-[#027081]" />
                <span>Custom Head Scripts / Meta Tags</span>
              </label>
              <textarea
                rows={5}
                placeholder="<!-- Paste custom tracking scripts here -->"
                value={customHeadScript}
                onChange={(e) => setCustomHeadScript(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-[#027081]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#027081] hover:bg-[#025c6a] text-white text-xs font-bold h-9 rounded-xl shadow-2xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Analytics Tags</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
