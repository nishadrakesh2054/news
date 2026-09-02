"use client";

import { useQuery } from "@tanstack/react-query";
import { Video } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

type VideoItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploader?: { name: string };
};

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

  return (
    <AdminPageShell title="Videos" icon={Video} description="Video media from the library" onRefresh={() => refetch()} isRefreshing={isFetching}>
      <div className="rounded-lg border bg-card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No videos yet. Upload via Media Library with a video file.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 text-left">File</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Uploader</th>
                <th className="px-4 py-3 text-left">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3">{v.filename}</td>
                  <td className="px-4 py-3">{v.mimeType}</td>
                  <td className="px-4 py-3">{v.uploader?.name ?? "—"}</td>
                  <td className="px-4 py-3 truncate max-w-xs">
                    <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
