"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Film, HardDrive, Link2, Video } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  adminPanelHeader,
  adminPanelTitle,
} from "@/constants/admin-layout";

type VideoItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  folder?: string;
  caption: string | null;
  altText: string | null;
  uploader?: { name: string };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminVideosPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [asReel, setAsReel] = useState(true);

  const { data, isLoading, refetch, isFetching } = useQuery<{ items: VideoItem[]; total: number }>({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const res = await fetch("/api/admin/videos");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, youtubeUrl, asReel }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add video");
      return json.data;
    },
    onSuccess: () => {
      toast.success(asReel ? "Reel added" : "YouTube video added");
      setTitle("");
      setYoutubeUrl("");
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data?.items ?? [];
  const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
  const youtubeCount = items.filter((item) => item.mimeType === "video/youtube").length;
  const reelCount = items.filter((item) => item.folder === "reels").length;

  return (
    <AdminPageShell
      title="Videos"
      description="Uploaded files and YouTube embeds"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total videos", value: data?.total ?? items.length, icon: Video },
          { label: "Reels", value: reelCount, icon: Film },
          { label: "YouTube", value: youtubeCount, icon: Link2 },
          { label: "Storage used", value: formatBytes(totalSize), icon: HardDrive },
        ]}
      />

      <section className={adminPanel}>
        <div className={adminPanelHeader}>
          <h2 className={adminPanelTitle}>Add YouTube video / reel</h2>
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={adminInput}
          />
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=… or Shorts URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className={`${adminInput} font-mono`}
          />
          <button
            type="button"
            onClick={() => addMutation.mutate()}
            disabled={!title.trim() || !youtubeUrl.trim() || addMutation.isPending}
            className={adminBtnPrimary}
          >
            Add
          </button>
        </div>
        <label className="flex items-center gap-2 border-t border-border/70 px-3 py-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={asReel}
            onChange={(e) => setAsReel(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Show on homepage as Reel
        </label>
        <p className="border-t border-border/70 px-3 py-2 text-[10px] text-muted-foreground">
          Upload MP4 files via Media library. Paste YouTube / Shorts links here for embeds.
        </p>
      </section>

      <AdminPanel title="Video library">
        <AdminDataTable
          loading={isLoading}
          rows={items}
          rowKey={(row) => row.id}
          emptyMessage="No videos yet. Add a YouTube link or upload via Media library."
          columns={[
            {
              key: "filename",
              label: "Title",
              render: (row) => (
                <div>
                  <span className="font-medium">{row.filename}</span>
                  {row.mimeType === "video/youtube" ? (
                    <p className="text-[10px] text-[#0C4EA0]">YouTube embed</p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "mimeType",
              label: "Type",
              cellClassName: "text-muted-foreground",
            },
            {
              key: "size",
              label: "Size",
              cellClassName: "font-mono tabular-nums text-muted-foreground",
              render: (row) => (row.mimeType === "video/youtube" ? "—" : formatBytes(row.size)),
            },
            {
              key: "uploader",
              label: "Uploader",
              render: (row) => row.uploader?.name ?? "—",
            },
            {
              key: "url",
              label: "Link",
              align: "right",
              render: (row) => (
                <a href={row.url} target="_blank" rel="noreferrer" className={adminBtnGhost}>
                  Open
                </a>
              ),
            },
          ]}
        />
      </AdminPanel>
    </AdminPageShell>
  );
}
