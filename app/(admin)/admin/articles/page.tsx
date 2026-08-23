"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  ImageIcon,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
  Zap,
  Radio,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStatus, ArticleType } from "@prisma/client";

interface ArticleItem {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: ArticleStatus;
  type: ArticleType;
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    nameNp: string | null;
  };
}

interface CategoryOption {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
}

type SortField = "title" | "views" | "createdAt" | "status";

export default function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch Categories for Filter Dropdown
  const { data: categoriesData = [] } = useQuery<CategoryOption[]>({
    queryKey: ["admin-categories-filter"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return json.data;
    },
  });

  // Fetch Articles with Server Query Params
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-articles", search, statusFilter, typeFilter, categoryFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (categoryFilter !== "ALL") params.append("categoryId", categoryFilter);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch articles");
      return json.data;
    },
  });

  // Toggle status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ArticleStatus }) => {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update article status");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete article");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const sortedArticles = useMemo(() => {
    const rawArticles: ArticleItem[] = data?.articles || [];
    return [...rawArticles].sort((a, b) => {
      let valA: string | number = a[sortField as keyof ArticleItem] as string | number;
      let valB: string | number = b[sortField as keyof ArticleItem] as string | number;

      if (sortField === "title") {
        valA = (a.titleNp || a.title).toLowerCase();
        valB = (b.titleNp || b.title).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data?.articles, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setPage(1);
    toast.success("Filters reset");
  };

  const isFiltered =
    search.trim() !== "" || statusFilter !== "ALL" || typeFilter !== "ALL" || categoryFilter !== "ALL";

  const pagination = data?.pagination;
  const totalCount = pagination?.total || sortedArticles.length;
  const publishedCount = sortedArticles.filter((a) => a.status === ArticleStatus.PUBLISHED).length;
  const draftCount = sortedArticles.filter((a) => a.status === ArticleStatus.DRAFT).length;
  const totalViews = sortedArticles.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const getTypeBadge = (type: ArticleType) => {
    switch (type) {
      case ArticleType.BREAKING:
        return {
          icon: <Zap className="h-3 w-3 text-rose-500" />,
          label: "Breaking",
          style: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400",
        };
      case ArticleType.LIVE:
        return {
          icon: <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />,
          label: "Live",
          style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-400",
        };
      case ArticleType.OPINION:
        return {
          icon: <MessageSquare className="h-3 w-3 text-purple-500" />,
          label: "Opinion",
          style: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-950/30 dark:text-purple-400",
        };
      case ArticleType.FEATURE:
        return {
          icon: <Sparkles className="h-3 w-3 text-amber-500" />,
          label: "Feature",
          style: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-400",
        };
      default:
        return {
          icon: <FileText className="h-3 w-3 text-slate-500" />,
          label: "Standard",
          style: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-800 dark:text-slate-300",
        };
    }
  };

  return (
    <div className="w-full space-y-6 px-6 py-4 pb-12">
      {/* Top Header & New Story Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-serif">
              Article Library
            </h1>
            <span className="text-xs font-bold bg-[#027081]/10 text-[#027081] px-2.5 py-0.5 rounded-full border border-[#027081]/20">
              {totalCount} Stories
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Manage, filter, and publish stories across all news categories
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 text-xs rounded-xl border-border font-medium hover:bg-muted"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-[#027081]" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/articles/new">
            <Button size="sm" className="bg-[#027081] hover:bg-[#025c6a] text-white text-xs font-bold px-4 h-9 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all">
              <Plus className="h-4 w-4" />
              <span>Create Story</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Sleek Compact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Stories</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{totalCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Published</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{publishedCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Drafts</p>
            <p className="text-xl font-extrabold text-amber-600 mt-0.5">{draftCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Readership Views</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">{totalViews.toLocaleString()}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <Eye className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Unified Minimal Filter Toolbar */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-75">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/60">
            {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-[#027081] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-50 flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search story..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-background border rounded-lg pl-8 pr-7 py-1 text-xs text-foreground outline-none focus:border-[#027081] transition-colors"
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

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-background border rounded-lg px-3 py-1 text-xs font-semibold text-foreground outline-none focus:border-[#027081] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoriesData.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameNp || cat.name}
              </option>
            ))}
          </select>

          {/* Format Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-background border rounded-lg px-3 py-1 text-xs font-semibold text-foreground outline-none focus:border-[#027081] cursor-pointer"
          >
            <option value="ALL">All Formats</option>
            <option value="STANDARD">Standard</option>
            <option value="BREAKING">Breaking</option>
            <option value="LIVE">Live</option>
            <option value="OPINION">Opinion</option>
            <option value="FEATURE">Feature</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:underline font-bold px-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right Controls: Rows per page */}
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-medium">
          <span>Rows:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-[#027081]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Professional Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <div className="h-5 w-5 border-2 border-[#027081] border-t-transparent rounded-full animate-spin" />
            <span>Loading stories...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-rose-500 font-semibold">
            Failed to load articles.
          </div>
        ) : sortedArticles.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold">No stories found matching your criteria.</p>
            {isFiltered && (
              <Button variant="link" onClick={resetFilters} className="text-[#027081] text-xs">
                Clear filters to show all
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-slate-50/80 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Story Title</span>
                      {sortField === "title" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-[#027081]" /> : <ArrowDown className="h-3 w-3 text-[#027081]" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Format</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === "status" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-[#027081]" /> : <ArrowDown className="h-3 w-3 text-[#027081]" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Views</span>
                      {sortField === "views" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-[#027081]" /> : <ArrowDown className="h-3 w-3 text-[#027081]" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedArticles.map((art) => {
                  const typeInfo = getTypeBadge(art.type);
                  return (
                    <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      {/* Title & Cover Thumbnail */}
                      <td className="px-4 py-3 max-w-md">
                        <div className="flex items-center space-x-3">
                          {art.coverImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={art.coverImage}
                              alt={art.title}
                              className="h-10 w-10 object-cover rounded-xl border border-border shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-center text-muted-foreground shrink-0">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              {art.isFeatured && (
                                <span className="text-[9px] font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                  LEAD
                                </span>
                              )}
                              {art.isBreaking && (
                                <span className="text-[9px] font-extrabold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded animate-pulse">
                                  BREAKING
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-xs text-foreground truncate">
                              {art.titleNp || art.title}
                            </p>
                            {art.titleNp && (
                              <p className="text-[11px] text-muted-foreground truncate font-mono">
                                {art.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-xs text-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50">
                          {art.category.nameNp || art.category.name}
                        </span>
                      </td>

                      {/* Format */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeInfo.style}`}>
                          {typeInfo.icon}
                          <span>{typeInfo.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={art.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: art.id,
                              status: e.target.value as ArticleStatus,
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-extrabold outline-none cursor-pointer ${
                            art.status === ArticleStatus.PUBLISHED
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                              : art.status === ArticleStatus.DRAFT
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-800"
                              : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200"
                          }`}
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-muted-foreground">
                        {art.views.toLocaleString()}
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-medium">
                        {art.author.name}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <a
                          href={`/article/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-[#027081] hover:bg-[#027081]/10"
                            title="View Public Page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>

                        <Link href={`/admin/articles/${art.id}/edit`}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-[#027081] hover:bg-[#027081]/10"
                            title="Edit Story"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete article "${art.title}"?`)) {
                              deleteMutation.mutate(art.id);
                            }
                          }}
                          className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10"
                          title="Delete Story"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground pt-1 gap-3">
          <div>
            Showing <strong className="text-foreground">{(page - 1) * limit + 1}</strong>–
            <strong className="text-foreground">{Math.min(page * limit, pagination.total)}</strong> of{" "}
            <strong className="text-foreground">{pagination.total}</strong> stories
          </div>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 text-xs px-3 rounded-lg border-border"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            <span className="px-2 font-bold text-foreground">
              {page} / {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 text-xs px-3 rounded-lg border-border"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
