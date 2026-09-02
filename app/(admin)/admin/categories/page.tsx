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

interface CategoryItem {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  description: string | null;
  order: number;
  createdAt: string;
  _count: {
    articles: number;
  };
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [nameNp, setNameNp] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);

  const { data: categories = [], isLoading, isError, refetch, isFetching } = useQuery<CategoryItem[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch categories");
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; nameNp?: string; slug: string; description?: string; order: number }) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create category");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Category created");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CategoryItem> }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update category");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Category updated");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete category");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setNameNp("");
    setSlug("");
    setDescription("");
    setOrder((categories.length || 0) + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryItem) => {
    setEditingCategory(category);
    setName(category.name);
    setNameNp(category.nameNp || "");
    setSlug(category.slug);
    setDescription(category.description || "");
    setOrder(category.order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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
    if (!editingCategory && !slug) setSlug(autoSlug(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }

    const payload = {
      name,
      nameNp: nameNp || undefined,
      slug: autoSlug(slug),
      description: description || undefined,
      order: Number(order),
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      (cat.nameNp && cat.nameNp.includes(term)) ||
      cat.slug.toLowerCase().includes(term)
    );
  });

  const totalArticles = categories.reduce((sum, cat) => sum + cat._count.articles, 0);
  const withArticles = categories.filter((cat) => cat._count.articles > 0).length;
  const emptyCategories = categories.length - withArticles;

  return (
    <AdminPageShell
      title="Categories"
      description="Manage navigation sections and story groupings"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New category
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total categories", value: categories.length },
          { label: "Categorized articles", value: totalArticles },
          { label: "With articles", value: withArticles },
          { label: "Empty", value: emptyCategories },
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
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading categories…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load categories.</p>
        ) : filteredCategories.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {search ? "No categories match your search." : "No categories yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Order</th>
                  <th className={adminTableHeadCell}>Nepali name</th>
                  <th className={adminTableHeadCell}>English name</th>
                  <th className={adminTableHeadCell}>Slug</th>
                  <th className={adminTableHeadCell}>Articles</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className={adminTableRow}>
                    <td className={`${adminTableCell} font-mono tabular-nums text-muted-foreground`}>
                      {cat.order}
                    </td>
                    <td className={`${adminTableCell} font-medium text-foreground`}>
                      {cat.nameNp || "—"}
                    </td>
                    <td className={`${adminTableCell} font-medium text-foreground`}>{cat.name}</td>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>/{cat.slug}</td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>{cat._count.articles}</span>
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={cat._count.articles > 0 || deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete category "${cat.name}"?`)) {
                              deleteMutation.mutate(cat.id);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted disabled:opacity-40"
                          title={
                            cat._count.articles > 0
                              ? "Cannot delete — category has articles"
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
          <div className="w-full max-w-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                {editingCategory ? "Edit category" : "New category"}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Nepali name</label>
                  <input
                    type="text"
                    placeholder="e.g. राजनीति"
                    value={nameNp}
                    onChange={(e) => setNameNp(e.target.value)}
                    className={adminInput}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    English name <span className="text-[#C3272E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Politics"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={adminInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Slug <span className="text-[#C3272E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="politics"
                    value={slug}
                    onChange={(e) => setSlug(autoSlug(e.target.value))}
                    className={`${adminInput} font-mono`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Display order</label>
                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    className={adminInput}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional category description…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${adminInput} h-auto min-h-[72px] py-2`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={closeModal} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={adminBtnPrimary}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory ? "Save changes" : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
