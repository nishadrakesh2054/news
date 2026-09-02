"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminPanel } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
} from "@/constants/admin-layout";

type GalleryMedia = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
};

type GalleryItemRow = {
  id: string;
  caption: string | null;
  order: number;
  media: GalleryMedia;
};

type GalleryDetail = {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  isPublished: boolean;
  items: GalleryItemRow[];
};

type MediaOption = {
  id: string;
  filename: string;
  url: string;
};

export default function AdminGalleryManagePage() {
  const params = useParams<{ id: string }>();
  const galleryId = params.id;
  const queryClient = useQueryClient();
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [captionDraft, setCaptionDraft] = useState("");

  const { data: gallery, isLoading, refetch, isFetching } = useQuery<GalleryDetail>({
    queryKey: ["admin-gallery", galleryId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/galleries/${galleryId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load gallery");
      return json.data;
    },
    enabled: Boolean(galleryId),
  });

  const { data: mediaData } = useQuery<{ media: MediaOption[] }>({
    queryKey: ["admin-media-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/media?type=image&limit=48");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to load media");
      return json.data;
    },
  });

  const items = gallery?.items ?? [];
  const mediaOptions = useMemo(
    () => (mediaData?.media ?? []).filter((m) => !items.some((item) => item.media.id === m.id)),
    [mediaData?.media, items]
  );

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/galleries/${galleryId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: selectedMediaId, caption: captionDraft || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add photo");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Photo added");
      setSelectedMediaId("");
      setCaptionDraft("");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/admin/galleries/${galleryId}/items/${itemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove photo");
    },
    onSuccess: () => {
      toast.success("Photo removed");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: GalleryItemRow[]) => {
      const res = await fetch(`/api/admin/galleries/${galleryId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((item, index) => ({
            id: item.id,
            order: index,
            caption: item.caption,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reorder");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery", galleryId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const captionMutation = useMutation({
    mutationFn: async ({ itemId, caption }: { itemId: string; caption: string }) => {
      const res = await fetch(`/api/admin/galleries/${galleryId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update caption");
    },
    onSuccess: () => {
      toast.success("Caption saved");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery", galleryId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const reordered = [...items];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);
    reorderMutation.mutate(reordered);
  };

  return (
    <AdminPageShell
      title={gallery?.titleNp || gallery?.title || "Manage gallery"}
      description="Add, reorder, and caption gallery photos"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/galleries" className={adminBtnSecondary}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to galleries
        </Link>
      }
    >
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading gallery…</p>
      ) : !gallery ? (
        <p className="text-xs text-destructive">Gallery not found.</p>
      ) : (
        <div className="space-y-4">
          <AdminPanel title="Add photo from media library">
            <div className="grid gap-3 p-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <select
                  value={selectedMediaId}
                  onChange={(e) => setSelectedMediaId(e.target.value)}
                  className={adminInput}
                >
                  <option value="">Select image…</option>
                  {mediaOptions.map((media) => (
                    <option key={media.id} value={media.id}>
                      {media.filename}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Optional caption…"
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  className={adminInput}
                />
              </div>
              <button
                type="button"
                onClick={() => addMutation.mutate()}
                disabled={!selectedMediaId || addMutation.isPending}
                className={`${adminBtnPrimary} self-end`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add photo
              </button>
            </div>
          </AdminPanel>

          <div className={adminPanel}>
            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
              <p className="text-xs font-medium text-foreground">
                {items.length} photo{items.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={() => reorderMutation.mutate(items)}
                disabled={reorderMutation.isPending}
                className={adminBtnSecondary}
              >
                <Save className="h-3 w-3" />
                Save order
              </button>
            </div>

            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                No photos yet. Upload images in Media library, then add them here.
              </p>
            ) : (
              <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                  <div key={item.id} className="rounded-sm border border-border/70 bg-card p-2">
                    <div className="relative mb-2 aspect-video overflow-hidden bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.media.url}
                        alt={item.caption || item.media.filename}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-1 top-1 flex gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem(index, -1)}
                          className={adminBtnGhost}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => moveItem(index, 1)}
                          className={adminBtnGhost}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      defaultValue={item.caption || ""}
                      placeholder="Caption…"
                      onBlur={(e) => {
                        if (e.target.value !== (item.caption || "")) {
                          captionMutation.mutate({ itemId: item.id, caption: e.target.value });
                        }
                      }}
                      className={`${adminInput} mb-2 w-full text-xs`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Remove this photo from the gallery?")) {
                            removeMutation.mutate(item.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-[#C3272E] hover:underline"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
