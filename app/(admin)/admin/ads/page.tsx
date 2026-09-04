"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Code, ExternalLink, ImageIcon, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { AdSlot } from "@prisma/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import { DualImagePicker } from "@/components/admin/DualImagePicker";
import {
  adminBadge,
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminSelect,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectMd,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";

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

const SLOT_LABELS: Record<AdSlot, string> = {
  HEADER_LEADERBOARD: "Header leaderboard",
  SIDEBAR_TOP: "Sidebar top (home + article)",
  SIDEBAR_BOTTOM: "Sidebar bottom (home + article)",
  IN_ARTICLE: "In-article (article page)",
  STICKY_FOOTER: "Sticky footer",
};

export default function AdminAdsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState<AdSlot>(AdSlot.HEADER_LEADERBOARD);
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: ads = [], isLoading, isError, refetch, isFetching } = useQuery<AdItem[]>({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ads");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch ads");
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<AdItem>) => {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create ad");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ad unit created");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AdItem> }) => {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update ad");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ad unit updated");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete ad");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ad unit deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    },
    onError: (err: Error) => toast.error(err.message),
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
      toast.error("Title and placement are required");
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

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
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
  }, [ads, search, slotFilter, statusFilter]);

  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const activeCount = ads.filter((a) => a.isActive).length;
  const isFiltered = search.trim() !== "" || slotFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <AdminPageShell
      title="Advertisements"
      description="Manage banner units, placements, and ad scripts"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New ad unit
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total units", value: ads.length },
          { label: "Active", value: activeCount },
          { label: "Impressions", value: totalImpressions.toLocaleString() },
          { label: "Avg CTR", value: `${avgCtr}%` },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={slotFilter}
          onChange={(e) => setSlotFilter(e.target.value)}
          className={adminToolbarSelectMd}
        >
          <option value="ALL">All placements</option>
          <option value="HEADER_LEADERBOARD">Header leaderboard</option>
          <option value="SIDEBAR_TOP">Sidebar top (ad 1)</option>
          <option value="SIDEBAR_BOTTOM">Sidebar bottom (ad 2)</option>
          <option value="IN_ARTICLE">In-article</option>
          <option value="STICKY_FOOTER">Sticky footer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={adminToolbarSelectStatus}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
        </select>

        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title or URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${adminInput} w-full pl-7 pr-7`}
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {isFiltered ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSlotFilter("ALL");
              setStatusFilter("ALL");
            }}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading ad units…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load advertisements.</p>
        ) : filteredAds.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            No ad units match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Ad unit</th>
                  <th className={adminTableHeadCell}>Placement</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={adminTableHeadCell}>Impressions</th>
                  <th className={adminTableHeadCell}>Clicks / CTR</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAds.map((ad) => {
                  const ctr =
                    ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={ad.id} className={adminTableRow}>
                      <td className={`${adminTableCell} max-w-md`}>
                        <div className="flex items-center gap-2.5">
                          {ad.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={ad.imageUrl}
                              alt=""
                              className="h-8 w-12 shrink-0 border border-border object-cover"
                            />
                          ) : ad.scriptCode ? (
                            <div className="flex h-8 w-12 shrink-0 items-center justify-center border border-border bg-muted/30 text-muted-foreground">
                              <Code className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-12 shrink-0 items-center justify-center border border-dashed border-border bg-muted/20 text-muted-foreground">
                              <ImageIcon className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{ad.title}</p>
                            {ad.targetUrl ? (
                              <a
                                href={ad.targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 truncate text-[11px] text-muted-foreground hover:text-[#0C4EA0]"
                              >
                                <span className="truncate">{ad.targetUrl}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ) : ad.scriptCode ? (
                              <span className="text-[11px] text-muted-foreground">Script unit</span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className={adminTableCell}>
                        <span className={adminBadgeMuted}>{SLOT_LABELS[ad.slot] ?? ad.slot}</span>
                      </td>
                      <td className={adminTableCell}>
                        <button
                          type="button"
                          onClick={() =>
                            updateMutation.mutate({
                              id: ad.id,
                              payload: { isActive: !ad.isActive },
                            })
                          }
                          className={
                            ad.isActive
                              ? adminBadge
                              : "inline-flex items-center rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                          }
                        >
                          {ad.isActive ? "Active" : "Paused"}
                        </button>
                      </td>
                      <td className={`${adminTableCell} font-mono tabular-nums text-muted-foreground`}>
                        {ad.impressions.toLocaleString()}
                      </td>
                      <td className={`${adminTableCell} font-mono tabular-nums`}>
                        <span className="text-foreground">{ad.clicks.toLocaleString()}</span>
                        <span className="ml-1.5 text-[10px] text-muted-foreground">{ctr}%</span>
                      </td>
                      <td className={`${adminTableCell} text-right`}>
                        <div className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(ad)}
                            className={adminBtnGhost}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (confirm(`Delete ad "${ad.title}"?`)) {
                                deleteMutation.mutate(ad.id);
                              }
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40">
          <div className="flex min-h-full items-start justify-center p-4 pb-6 pt-16">
            <div
              className={`${adminPanel} flex max-h-[calc(100vh-5rem)] w-full max-w-lg flex-col overflow-hidden`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {editingAd ? "Edit ad unit" : "New ad unit"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <form id="ad-form" onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="ad-title" className="text-xs font-medium text-foreground">
                        Title <span className="text-[#C3272E]">*</span>
                      </label>
                      <input
                        id="ad-title"
                        type="text"
                        required
                        placeholder="Campaign name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`${adminInput} w-full`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="ad-slot" className="text-xs font-medium text-foreground">
                        Placement <span className="text-[#C3272E]">*</span>
                      </label>
                      <select
                        id="ad-slot"
                        value={slot}
                        onChange={(e) => setSlot(e.target.value as AdSlot)}
                        className={`${adminSelect} w-full`}
                      >
                        <option value="HEADER_LEADERBOARD">Header leaderboard</option>
                        <option value="SIDEBAR_TOP">Sidebar top (ad 1)</option>
                        <option value="SIDEBAR_BOTTOM">Sidebar bottom (ad 2)</option>
                        <option value="IN_ARTICLE">In-article inline</option>
                        <option value="STICKY_FOOTER">Sticky footer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">Banner image</p>
                    <DualImagePicker
                      value={imageUrl}
                      onChange={setImageUrl}
                      folder="ads"
                      label=""
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="ad-target-url" className="text-xs font-medium text-foreground">
                      Target URL
                    </label>
                    <input
                      id="ad-target-url"
                      type="url"
                      placeholder="https://advertiser.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className={`${adminInput} w-full font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="ad-script" className="text-xs font-medium text-foreground">
                      Script code
                    </label>
                    <textarea
                      id="ad-script"
                      rows={2}
                      placeholder="<script>…</script>"
                      value={scriptCode}
                      onChange={(e) => setScriptCode(e.target.value)}
                      className={`${adminInput} min-h-14 w-full resize-y py-2 font-mono text-[11px]`}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Optional — for third-party ad networks instead of a banner
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded-sm border-border accent-[#0C4EA0]"
                    />
                    Active immediately
                  </label>
                </form>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-border/70 px-4 py-3">
                <button type="button" onClick={closeModal} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="ad-form"
                  className={adminBtnPrimary}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingAd ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
