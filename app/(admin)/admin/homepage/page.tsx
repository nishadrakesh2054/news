"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ExternalLink, Save } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnPrimary,
  adminBtnSecondary,
  adminPanel,
  adminPanelHeader,
  adminPanelTitle,
  adminSelect,
} from "@/constants/admin-layout";

interface CategoryOption {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  order: number;
}

type HeroLayoutMode = "lead_3_grid" | "lead_5_grid" | "full_banner";

const HERO_LAYOUTS: { value: HeroLayoutMode; label: string; description: string }[] = [
  { value: "lead_3_grid", label: "3-column", description: "1 lead story + 2 side cards" },
  { value: "lead_5_grid", label: "5-grid", description: "1 lead story + 4 thumbnails" },
  { value: "full_banner", label: "Full banner", description: "Full-width hero carousel" },
];

export default function AdminHomepageLayoutPage() {
  const [showBreakingTicker, setShowBreakingTicker] = useState(true);
  const [tickerSpeedSec, setTickerSpeedSec] = useState(5);
  const [showHeroFeatured, setShowHeroFeatured] = useState(true);
  const [heroLayoutMode, setHeroLayoutMode] = useState<HeroLayoutMode>("lead_3_grid");
  const [showLiveBar, setShowLiveBar] = useState(true);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading, refetch, isFetching } = useQuery<CategoryOption[]>({
    queryKey: ["admin-homepage-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return json.data;
    },
  });

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [categories]
  );

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          if (d.showBreakingTicker !== undefined) setShowBreakingTicker(d.showBreakingTicker);
          if (d.tickerSpeedSec !== undefined) setTickerSpeedSec(d.tickerSpeedSec);
          if (d.showHeroFeatured !== undefined) setShowHeroFeatured(d.showHeroFeatured);
          if (d.heroLayoutMode) setHeroLayoutMode(d.heroLayoutMode);
          if (d.showLiveBar !== undefined) setShowLiveBar(d.showLiveBar);
          if (Array.isArray(d.sectionOrder) && d.sectionOrder.length > 0) {
            setSectionOrder(d.sectionOrder);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sectionOrder.length === 0 && sortedCategories.length > 0) {
      setSectionOrder(sortedCategories.map((cat) => cat.id));
    }
  }, [sortedCategories, sectionOrder.length]);

  const orderedSections = sectionOrder
    .map((id) => sortedCategories.find((cat) => cat.id === id))
    .filter((cat): cat is CategoryOption => Boolean(cat));

  const hiddenCount = sortedCategories.length - orderedSections.length;

  const toggleCategory = (categoryId: string, enabled: boolean) => {
    if (enabled) {
      setSectionOrder((current) => [...current, categoryId]);
    } else {
      setSectionOrder((current) => current.filter((id) => id !== categoryId));
    }
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setSectionOrder(next);
  };

  const handleSaveLayout = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showBreakingTicker,
          tickerSpeedSec,
          showHeroFeatured,
          heroLayoutMode,
          showLiveBar,
          sectionOrder,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Homepage layout saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const heroLabel = HERO_LAYOUTS.find((l) => l.value === heroLayoutMode)?.label ?? "—";

  return (
    <AdminPageShell
      title="Homepage"
      description="Configure hero, ticker, and section layout for the public site"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <>
          <a href="/" target="_blank" rel="noreferrer" className={adminBtnSecondary}>
            <ExternalLink className="h-3.5 w-3.5" />
            Preview site
          </a>
          <button type="button" onClick={handleSaveLayout} disabled={saving} className={adminBtnPrimary}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save layout"}
          </button>
        </>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Hero layout", value: heroLabel },
          { label: "Homepage sections", value: orderedSections.length },
          { label: "Hidden categories", value: hiddenCount },
          { label: "Breaking ticker", value: showBreakingTicker ? "On" : "Off" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className={adminPanel}>
            <div className={adminPanelHeader}>
              <h2 className={adminPanelTitle}>Hero section</h2>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showHeroFeatured}
                  onChange={(e) => setShowHeroFeatured(e.target.checked)}
                  className="h-3.5 w-3.5 rounded-sm border-border"
                />
                Show featured hero
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
              {HERO_LAYOUTS.map((layout) => (
                <button
                  key={layout.value}
                  type="button"
                  onClick={() => setHeroLayoutMode(layout.value)}
                  className={`border px-3 py-2 text-left transition-colors ${
                    heroLayoutMode === layout.value
                      ? "border-[#0C4EA0] bg-[#0C4EA0]/5"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-xs font-medium text-foreground">{layout.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{layout.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className={adminPanel}>
            <div className={adminPanelHeader}>
              <h2 className={adminPanelTitle}>Breaking ticker</h2>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showBreakingTicker}
                  onChange={(e) => setShowBreakingTicker(e.target.checked)}
                  className="h-3.5 w-3.5 rounded-sm border-border"
                />
                Enabled
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Scroll interval</label>
                <select
                  value={tickerSpeedSec}
                  onChange={(e) => setTickerSpeedSec(Number(e.target.value))}
                  className={adminSelect}
                >
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={8}>8 seconds</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Live coverage bar</label>
                <select
                  value={showLiveBar ? "on" : "off"}
                  onChange={(e) => setShowLiveBar(e.target.value === "on")}
                  className={adminSelect}
                >
                  <option value="on">Visible</option>
                  <option value="off">Hidden</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>Category sections</h2>
            <Link href="/admin/categories" className="text-[11px] font-medium text-[#0C4EA0] hover:underline">
              Manage
            </Link>
          </div>
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading categories…</p>
          ) : sortedCategories.length === 0 ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">No categories configured.</p>
          ) : (
            <div className="divide-y divide-border/70">
              {sortedCategories.map((cat) => {
                const enabled = sectionOrder.includes(cat.id);
                const index = sectionOrder.indexOf(cat.id);
                return (
                  <div key={cat.id} className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => toggleCategory(cat.id, e.target.checked)}
                      className="h-3.5 w-3.5 rounded-sm border-border accent-[#0C4EA0]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {cat.nameNp || cat.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">/{cat.slug}</p>
                    </div>
                    {enabled ? (
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-muted-foreground">#{index + 1}</span>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveSection(index, -1)}
                          className="rounded-sm p-1 hover:bg-muted"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === sectionOrder.length - 1}
                          onClick={() => moveSection(index, 1)}
                          className="rounded-sm p-1 hover:bg-muted"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className={adminBadgeMuted}>Hidden</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-border/70 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">
              Checked categories appear on the homepage in the order shown. Save layout to apply.
            </p>
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}
