"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Search, Images } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBadgeSuccess,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
} from "@/constants/admin-layout";

interface GalleryItem {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  _count: {
    items: number;
  };
}

export default function AdminGalleriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [titleNp, setTitleNp] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const { data: galleries = [], isLoading, isError, refetch, isFetching } = useQuery<GalleryItem[]>({
    queryKey: ["admin-galleries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/galleries");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch galleries");
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      titleNp?: string;
      slug?: string;
      description?: string;
      coverUrl?: string;
      isPublished: boolean;
    }) => {
      const res = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create gallery");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Gallery created");
      queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        title: string;
        titleNp?: string;
        description?: string;
        coverUrl?: string;
        isPublished: boolean;
      };
    }) => {
      const res = await fetch(`/api/admin/galleries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update gallery");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Gallery updated");
      queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/galleries/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete gallery");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Gallery deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreateModal = () => {
    setEditingGallery(null);
    setTitle("");
    setTitleNp("");
    setSlug("");
    setDescription("");
    setCoverUrl("");
    setIsPublished(false);
    setIsModalOpen(true);
  };

  const openEditModal = (gallery: GalleryItem) => {
    setEditingGallery(gallery);
    setTitle(gallery.title);
    setTitleNp(gallery.titleNp || "");
    setSlug(gallery.slug);
    setDescription(gallery.description || "");
    setCoverUrl(gallery.coverUrl || "");
    setIsPublished(gallery.isPublished);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGallery(null);
  };

  const autoSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingGallery && !slug) setSlug(autoSlug(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Gallery title is required");
      return;
    }

    if (editingGallery) {
      updateMutation.mutate({
        id: editingGallery.id,
        payload: {
          title: title.trim(),
          titleNp: titleNp.trim() || undefined,
          description: description.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          isPublished,
        },
      });
    } else {
      createMutation.mutate({
        title: title.trim(),
        titleNp: titleNp.trim() || undefined,
        slug: autoSlug(slug || title),
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        isPublished,
      });
    }
  };

  const filteredGalleries = galleries.filter((gallery) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      gallery.title.toLowerCase().includes(term) ||
      (gallery.titleNp && gallery.titleNp.includes(term)) ||
      gallery.slug.toLowerCase().includes(term)
    );
  });

  const publishedCount = galleries.filter((g) => g.isPublished).length;
  const draftCount = galleries.length - publishedCount;
  const totalItems = galleries.reduce((sum, g) => sum + g._count.items, 0);

  return (
    <AdminPageShell
      title="Galleries"
      description="Photo galleries and visual stories"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New gallery
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total galleries", value: galleries.length },
          { label: "Published", value: publishedCount },
          { label: "Draft", value: draftCount },
          { label: "Gallery items", value: totalItems },
        ]}
      />

      <div className={adminToolbarRow}>
        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title or slug…"
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
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading galleries…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load galleries.</p>
        ) : filteredGalleries.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {search ? "No galleries match your search." : "No galleries yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Title</th>
                  <th className={adminTableHeadCell}>Nepali title</th>
                  <th className={adminTableHeadCell}>Slug</th>
                  <th className={adminTableHeadCell}>Items</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGalleries.map((gallery) => (
                  <tr key={gallery.id} className={adminTableRow}>
                    <td className={`${adminTableCell} font-medium text-foreground`}>{gallery.title}</td>
                    <td className={`${adminTableCell} text-muted-foreground`}>
                      {gallery.titleNp || "—"}
                    </td>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                      /{gallery.slug}
                    </td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>{gallery._count.items}</span>
                    </td>
                    <td className={adminTableCell}>
                      <span
                        className={gallery.isPublished ? adminBadgeSuccess : adminBadgeMuted}
                      >
                        {gallery.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <Link
                          href={`/admin/galleries/${gallery.id}`}
                          className={adminBtnGhost}
                          title="Manage photos"
                        >
                          <Images className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(gallery)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete gallery "${gallery.title}"?`)) {
                              deleteMutation.mutate(gallery.id);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-md`}>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                {editingGallery ? "Edit gallery" : "New gallery"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 p-4">
              <div className="space-y-1">
                <label htmlFor="gallery-title-np" className="text-xs font-medium text-foreground">
                  Nepali title
                </label>
                <input
                  id="gallery-title-np"
                  type="text"
                  placeholder="ग्यालरी शीर्षक…"
                  value={titleNp}
                  onChange={(e) => setTitleNp(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="gallery-title" className="text-xs font-medium text-foreground">
                  English title <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  id="gallery-title"
                  type="text"
                  required
                  placeholder="Photo gallery title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              {!editingGallery ? (
                <div className="space-y-1">
                  <label htmlFor="gallery-slug" className="text-xs font-medium text-foreground">
                    Slug
                  </label>
                  <input
                    id="gallery-slug"
                    type="text"
                    placeholder="photo-gallery"
                    value={slug}
                    onChange={(e) => setSlug(autoSlug(e.target.value))}
                    className={`${adminInput} w-full font-mono`}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave blank to auto-generate from title
                  </p>
                </div>
              ) : (
                <div className="rounded-sm border border-border/70 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
                  Slug: <span className="font-mono text-foreground">/{editingGallery.slug}</span>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="gallery-cover" className="text-xs font-medium text-foreground">
                  Cover image URL
                </label>
                <input
                  id="gallery-cover"
                  type="url"
                  placeholder="https://…"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="gallery-description" className="text-xs font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="gallery-description"
                  rows={2}
                  placeholder="Optional gallery description…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${adminInput} min-h-16 w-full resize-y py-2`}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-border accent-[#0C4EA0]"
                />
                Publish gallery on site
              </label>

              <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
                <button type="button" onClick={closeModal} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={adminBtnPrimary}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingGallery ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
