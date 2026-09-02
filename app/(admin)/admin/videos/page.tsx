"use client";

import { useQuery } from "@tanstack/react-query";
import { Film, HardDrive, Video } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import { adminBtnGhost } from "@/constants/admin-layout";

type VideoItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploader?: { name: string };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminVideosPage() {
  const { data, isLoading, refetch, isFetching } = useQuery<{ items: VideoItem[]; total: number }>({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const res = await fetch("/api/admin/videos");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const items = data?.items ?? [];
  const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
  const mp4Count = items.filter((item) => item.mimeType.includes("mp4")).length;

  return (
    <AdminPageShell
      title="Videos"
      description="Video media from the library"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          {
            label: "Total videos",
            value: data?.total ?? items.length,
            hint: "In media library",
            icon: Video,
          },
          {
            label: "MP4 files",
            value: mp4Count,
            hint: "Standard web format",
            icon: Film,
          },
          {
            label: "Storage used",
            value: formatBytes(totalSize),
            hint: "Current page set",
            icon: HardDrive,
          },
          {
            label: "Upload via",
            value: "Media",
            hint: "Use Media library",
            icon: Video,
          },
        ]}
      />

      <AdminPanel title="Video library">
        <AdminDataTable
          loading={isLoading}
          rows={items}
          rowKey={(row) => row.id}
          emptyMessage="No videos yet. Upload via Media library."
          columns={[
            {
              key: "filename",
              label: "File",
              render: (row) => <span className="font-medium">{row.filename}</span>,
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
              render: (row) => formatBytes(row.size),
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
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className={adminBtnGhost}
                >
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
