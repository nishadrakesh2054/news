"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Megaphone,
  RefreshCw,
  Search,
  Eye,
  MousePointerClick,
  BarChart3,
  Code,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@prisma/client";
import { DualImagePicker } from "@/components/admin/DualImagePicker";

interface AdItem {
  id: string;
  title: string;
  slot: AdSlot;
  imageUrl: string | null;
  targetUrl: string | null;
  scriptCode: string | null;
  isActive: boolean;
  clicks: number;
  impressions: number;
  createdAt: string;
}

export default function AdminAdsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form state
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState<AdSlot>(AdSlot.HEADER_LEADERBOARD);
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fetch Ads with TanStack Query
  const { data: ads = [], isLoading, isError, refetch, isFetching } = useQuery<AdItem[]>({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ads");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch ads");
      return json.data;
    },
  });

  // Create Ad Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: Partial<AdItem>) => {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create ad slot");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ad slot created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      closeModal();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Update Ad Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AdItem> }) => {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update ad slot");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ad slot updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      closeModal();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Delete Ad Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete ad slot");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ad slot deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const openCreateModal = () => {
    setEditingAd(null);
    setTitle("");
    setSlot(AdSlot.HEADER_LEADERBOARD);
    setImageUrl("");
    setTargetUrl("");
    setScriptCode("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: AdItem) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setSlot(ad.slot);
    setImageUrl(ad.imageUrl || "");
    setTargetUrl(ad.targetUrl || "");
    setScriptCode(ad.scriptCode || "");
    setIsActive(ad.isActive);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slot) {
      toast.error("Title and Ad slot position are required");
      return;
    }

    const payload = {
      title,
      slot,
      imageUrl: imageUrl || undefined,
      targetUrl: targetUrl || undefined,
      scriptCode: scriptCode || undefined,
      isActive,
    };

    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Filter Ads
  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      search.trim() === "" ||
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      (ad.targetUrl && ad.targetUrl.toLowerCase().includes(search.toLowerCase()));
    const matchesSlot = slotFilter === "ALL" || ad.slot === slotFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && ad.isActive) ||
      (statusFilter === "PAUSED" && !ad.isActive);
    return matchesSearch && matchesSlot && matchesStatus;
  });

  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const activeCount = ads.filter((a) => a.isActive).length;

  const getSlotBadge = (s: AdSlot) => {
    switch (s) {
      case AdSlot.HEADER_LEADERBOARD:
        return { label: "Header Leaderboard", style: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case AdSlot.SIDEBAR_TOP:
        return { label: "Sidebar Top", style: "bg-[#027081]/10 text-[#027081] border-[#027081]/20" };
      case AdSlot.IN_ARTICLE:
        return { label: "In-Article Inline", style: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
      case AdSlot.STICKY_FOOTER:
        return { label: "Sticky Footer", style: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      default:
        return { label: s, style: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
    }
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-[#027081]" />
            <span>Advertisements & Banners</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-2.5 text-xs rounded-lg border-border font-medium hover:bg-muted"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-[#027081]" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={openCreateModal}
            className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Ad Unit</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Ad Units</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{ads.length} <span className="text-xs font-semibold text-emerald-600">({activeCount} Active)</span></p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Megaphone className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Impressions</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{totalImpressions.toLocaleString()}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Eye className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</p>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <MousePointerClick className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average CTR</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">{avgCtr}%</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ad title or link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-sm pl-8 pr-7 py-1.5 text-xs text-foreground outline-none focus:border-[#027081] shadow-2xs transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Position Slot Filter */}
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="bg-card border border-border rounded-sm px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-[#027081] shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Ad Positions</option>
            <option value="HEADER_LEADERBOARD">Header Leaderboard</option>
            <option value="SIDEBAR_TOP">Sidebar Top</option>
            <option value="IN_ARTICLE">In-Article Inline</option>
            <option value="STICKY_FOOTER">Sticky Footer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border rounded-sm px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-[#027081] shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>

          {(search || slotFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSlotFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs text-rose-600 hover:underline font-bold px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Ad Units Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <div className="h-5 w-5 border-2 border-[#027081] border-t-transparent rounded-full animate-spin" />
            <span>Loading advertisement units...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-rose-500 font-semibold">
            Failed to load advertisements.
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold">No ad units found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-slate-50/80 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-4 py-3">Ad Unit Preview / Title</th>
                  <th className="px-4 py-3">Placement Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Impressions</th>
                  <th className="px-4 py-3">Clicks / CTR</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAds.map((ad) => {
                  const slotBadge = getSlotBadge(ad.slot);
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      {/* Title & Preview Thumbnail */}
                      <td className="px-4 py-3 max-w-md">
                        <div className="flex items-center space-x-3">
                          {ad.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="h-10 w-14 object-cover rounded-lg border border-border shrink-0 shadow-2xs"
                            />
                          ) : ad.scriptCode ? (
                            <div className="h-10 w-14 rounded-lg border border-border bg-purple-500/10 text-purple-600 flex items-center justify-center font-mono text-[9px] font-bold shrink-0">
                              <Code className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="h-10 w-14 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-muted-foreground shrink-0">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}

                          <div className="min-w-0 space-y-0.5">
                            <p className="font-bold text-xs text-foreground truncate">{ad.title}</p>
                            {ad.targetUrl && (
                              <a
                                href={ad.targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-muted-foreground hover:text-[#027081] truncate flex items-center gap-1 font-mono"
                              >
                                <span>{ad.targetUrl}</span>
                                <ExternalLink className="h-3 w-3 inline" />
                              </a>
                            )}
                            {ad.scriptCode && (
                              <span className="text-[10px] font-mono text-purple-600 font-semibold">
                                Google AdSense / JS Code Unit
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Placement Position */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg border ${slotBadge.style}`}>
                          {slotBadge.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            updateMutation.mutate({
                              id: ad.id,
                              payload: { isActive: !ad.isActive },
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-extrabold cursor-pointer transition-colors ${
                            ad.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {ad.isActive ? "ACTIVE" : "PAUSED"}
                        </button>
                      </td>

                      {/* Impressions */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-muted-foreground">
                        {ad.impressions.toLocaleString()}
                      </td>

                      {/* Clicks & CTR */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold">
                        <span className="text-foreground">{ad.clicks.toLocaleString()}</span>
                        <span className="ml-1.5 text-[10px] text-[#027081] bg-[#027081]/10 px-1.5 py-0.5 rounded font-bold">
                          {ctr}% CTR
                        </span>
                      </td>

                      {/* Icon-Only Action Buttons */}
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(ad)}
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-[#027081] hover:bg-[#027081]/10"
                          title="Edit Ad Unit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete advertisement "${ad.title}"?`)) {
                              deleteMutation.mutate(ad.id);
                            }
                          }}
                          className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10"
                          title="Delete Ad Unit"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#027081]" />
                <span>{editingAd ? "Edit Ad Unit" : "Create New Ad Unit"}</span>
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Ad Title / Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subisu Fiber Internet Banner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-[#027081]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Ad Placement Position *
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as AdSlot)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-[#027081] cursor-pointer"
                >
                  <option value="HEADER_LEADERBOARD">Header Leaderboard (970×250 / 728×90)</option>
                  <option value="SIDEBAR_TOP">Sidebar Top (300×250 / 300×600)</option>
                  <option value="IN_ARTICLE">In-Article Inline (728×90)</option>
                  <option value="STICKY_FOOTER">Sticky Footer Banner (728×90 / 320×50)</option>
                </select>
              </div>

              <DualImagePicker
                value={imageUrl}
                onChange={setImageUrl}
                folder="ads"
                label="Banner Image"
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Target Click URL
                </label>
                <input
                  type="url"
                  placeholder="https://advertiser.com/landing-page"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#027081]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Google AdSense / Custom Script Code (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="<script async src='...'></script>"
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#027081]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border text-[#027081] focus:ring-[#027081]"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-foreground cursor-pointer">
                  Activate Ad Unit Immediately
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-border/60 pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={closeModal} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#027081] hover:bg-[#025c6a] text-white font-semibold text-xs px-4 h-8 rounded-lg"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingAd ? "Save Changes" : "Create Ad Unit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
