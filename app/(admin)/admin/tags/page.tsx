"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
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

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: {
    articles: number;
  };
}

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data: tags = [], isLoading, isError, refetch, isFetching } = useQuery<TagItem[]>({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tags");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch tags");
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; slug?: string }) => {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create tag");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Tag created");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { name: string; slug: string } }) => {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update tag");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Tag updated");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete tag");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Tag deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreateModal = () => {
    setEditingTag(null);
    setName("");
    setSlug("");
    setIsModalOpen(true);
  };

  const openEditModal = (tag: TagItem) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const autoSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingTag && !slug) setSlug(autoSlug(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: autoSlug(slug || name),
    };

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredTags = tags.filter((tag) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return tag.name.toLowerCase().includes(term) || tag.slug.toLowerCase().includes(term);
  });

  const totalArticles = tags.reduce((sum, tag) => sum + tag._count.articles, 0);
  const withArticles = tags.filter((tag) => tag._count.articles > 0).length;
  const emptyTags = tags.length - withArticles;

  return (
    <AdminPageShell
      title="Tags"
      description="Manage article tags and SEO keywords"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New tag
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total tags", value: tags.length },
          { label: "Tagged articles", value: totalArticles },
          { label: "In use", value: withArticles },
          { label: "Unused", value: emptyTags },
        ]}
      />

      <div className={adminToolbarRow}>
        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or slug…"
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
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading tags…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load tags.</p>
        ) : filteredTags.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {search ? "No tags match your search." : "No tags yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Name</th>
                  <th className={adminTableHeadCell}>Slug</th>
                  <th className={adminTableHeadCell}>Articles</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className={adminTableRow}>
                    <td className={`${adminTableCell} font-medium text-foreground`}>{tag.name}</td>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>/{tag.slug}</td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>{tag._count.articles}</span>
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(tag)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={tag._count.articles > 0 || deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete tag "${tag.name}"?`)) {
                              deleteMutation.mutate(tag.id);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted disabled:opacity-40"
                          title={
                            tag._count.articles > 0
                              ? "Cannot delete — tag is in use"
                              : "Delete"
                          }
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
                {editingTag ? "Edit tag" : "New tag"}
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
                <label htmlFor="tag-name" className="text-xs font-medium text-foreground">
                  Tag name <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  id="tag-name"
                  type="text"
                  required
                  placeholder="Politics"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tag-slug" className="text-xs font-medium text-foreground">
                  Slug
                </label>
                <input
                  id="tag-slug"
                  type="text"
                  placeholder="politics"
                  value={slug}
                  onChange={(e) => setSlug(autoSlug(e.target.value))}
                  className={`${adminInput} w-full font-mono`}
                />
                <p className="text-[10px] text-muted-foreground">
                  Leave blank to auto-generate from name
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
                <button type="button" onClick={closeModal} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={adminBtnPrimary}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingTag ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
