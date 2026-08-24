"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Search, FolderTree, RefreshCw, Layers, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Form state
  const [name, setName] = useState("");
  const [nameNp, setNameNp] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);

  // Fetch categories using TanStack Query
  const { data: categories = [], isLoading, isError, refetch, isFetching } = useQuery<CategoryItem[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch categories");
      return json.data;
    },
  });

  // Create Category Mutation
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
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      closeModal();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Update Category Mutation
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
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      closeModal();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete category");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
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

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory && !slug) {
      setSlug(autoSlug(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Name and Slug are required");
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

  // Search filter
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

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-[#027081]" />
            <span>Categories & Navigation Sections</span>
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
            <span>Add New Category</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Categories</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{categories.length}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categorized Stories</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{totalArticles}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Header Menu Items</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">{categories.length}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <FolderTree className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search category name or slug..."
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
      </div>

      {/* Category Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <div className="h-5 w-5 border-2 border-[#027081] border-t-transparent rounded-full animate-spin" />
            <span>Loading categories...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-rose-500 font-semibold">
            Failed to load categories.
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold">No categories found matching search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-slate-50/80 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Nepali Name</th>
                  <th className="px-4 py-3">English Name / Slug</th>
                  <th className="px-4 py-3">Articles Count</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-mono font-bold">
                        #{cat.order}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-sm text-foreground">
                        {cat.nameNp || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-xs text-foreground">{cat.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">/{cat.slug}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-500/20">
                        {cat._count.articles} articles
                      </span>
                    </td>

                    {/* Icon-Only Actions (No text labels) */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(cat)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-[#027081] hover:bg-[#027081]/10"
                        title="Edit Category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={cat._count.articles > 0 || deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                            deleteMutation.mutate(cat.id);
                          }
                        }}
                        className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10 disabled:opacity-30"
                        title={cat._count.articles > 0 ? "Cannot delete category with active articles" : "Delete Category"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-foreground">
                {editingCategory ? "Edit Category" : "Create New Category"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Nepali Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Politics"
                    value={nameNp}
                    onChange={(e) => setNameNp(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-xs outline-none focus:border-[#027081]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Politics"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-xs outline-none focus:border-[#027081]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="politics"
                    value={slug}
                    onChange={(e) => setSlug(autoSlug(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-xs outline-none focus:border-[#027081] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-xs outline-none focus:border-[#027081]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Category overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background px-3 py-2 text-xs outline-none focus:border-[#027081]"
                />
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
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
