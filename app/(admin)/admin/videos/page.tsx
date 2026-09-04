"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Film, HardDrive, Link2, Loader2, Trash2, Upload, Video } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import { MediaThumb } from "@/components/admin/MediaThumb";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  adminPanelHeader,
  adminPanelTitle,
  adminTextTruncate,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [asReel, setAsReel] = useState(true);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAsReel, setUploadAsReel] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete video");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Video deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleLocalUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("file", file));
      if (uploadTitle.trim()) formData.append("title", uploadTitle.trim());
      formData.append("asReel", uploadAsReel ? "true" : "false");

      const res = await fetch("/api/admin/videos", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload video");

      const count = Array.isArray(json.data) ? json.data.length : 1;
      toast.success(count === 1 ? "Video uploaded" : `${count} videos uploaded`);
      setUploadTitle("");
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
          <h2 className={adminPanelTitle}>Upload video from computer</h2>
        </div>
        <div className="space-y-3 p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder="Optional title (defaults to filename)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className={adminInput}
            />
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={uploadAsReel}
                onChange={(e) => setUploadAsReel(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Show as Reel
            </label>
          </div>
          <div className="rounded-sm border border-dashed border-border/70 bg-muted/20 p-5 text-center transition-colors hover:border-[#0C4EA0] hover:bg-muted/30">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-[#0C4EA0]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs font-medium">Uploading video…</span>
              </div>
            ) : (
              <label className="block cursor-pointer space-y-2">
                <Upload className="mx-auto h-5 w-5 text-[#0C4EA0]" />
                <p className="text-xs font-medium text-foreground">
                  Choose MP4 / WebM / MOV from your computer
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Max 80 MB each · multiple files allowed
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  multiple
                  className="hidden"
                  onChange={(e) => handleLocalUpload(e.target.files)}
                />
              </label>
            )}
          </div>
        </div>
      </section>

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
      </section>

      <AdminPanel title="Video library">
        <AdminDataTable
          loading={isLoading}
          rows={items}
          rowKey={(row) => row.id}
          emptyMessage="No videos yet. Upload a file or add a YouTube link."
          columns={[
            {
              key: "thumb",
              label: "Preview",
              render: (row) => (
                <div className="h-12 w-20 overflow-hidden border border-border/70 bg-muted/20">
                  <MediaThumb
                    url={row.url}
                    mimeType={row.mimeType}
                    filename={row.filename}
                    altText={row.altText}
                    caption={row.caption}
                    className="h-full w-full object-cover"
                    fallbackClassName="flex h-full w-full items-center justify-center bg-muted/35 text-muted-foreground"
                    iconSize="sm"
                  />
                </div>
              ),
            },
            {
              key: "filename",
              label: "Title",
              render: (row) => (
                <div className="max-w-xs">
                  <p className={`${adminTextTruncate} font-medium text-foreground`}>
                    {row.filename}
                  </p>
                  {row.mimeType === "video/youtube" ? (
                    <p className="text-[10px] text-[#0C4EA0]">YouTube embed</p>
                  ) : row.folder === "reels" ? (
                    <p className="text-[10px] text-muted-foreground">Reel</p>
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
              key: "actions",
              label: "Actions",
              align: "right",
              render: (row) => (
                <div className="inline-flex items-center">
                  <a href={row.url} target="_blank" rel="noreferrer" className={adminBtnGhost}>
                    Open
                  </a>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm(`Delete "${row.filename}"?`)) {
                        deleteMutation.mutate(row.id);
                      }
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </AdminPanel>
    </AdminPageShell>
  );
}
