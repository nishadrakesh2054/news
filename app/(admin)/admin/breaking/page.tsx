"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Zap,
  RefreshCw,
  Search,
  Pencil,
  ExternalLink,
  ImageIcon,
  X,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BreakingItem {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  coverImage: string | null;
  status: string;
  updatedAt: string;
  isBreaking: boolean;
  category: {
    name: string;
    nameNp: string | null;
  };
}

export default function AdminBreakingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const { data: breakingArticles = [], isLoading, isError, refetch, isFetching } = useQuery<BreakingItem[]>({
    queryKey: ["admin-breaking"],
    queryFn: async () => {
      const res = await fetch("/api/admin/breaking");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch breaking news");
      return json.data;
    },
  });

  const toggleBreakingMutation = useMutation({
    mutationFn: async ({ articleId, isBreaking }: { articleId: string; isBreaking: boolean }) => {
      const res = await fetch("/api/admin/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, isBreaking }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update breaking ticker");
      return json.data;
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.isBreaking
          ? "Added to Breaking News ticker"
          : "Removed from Breaking News ticker"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-breaking"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Client-side filtering
  const filteredArticles = breakingArticles.filter((art) => {
    const matchesSearch =
      search.trim() === "" ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      (art.titleNp && art.titleNp.includes(search));
    const matchesCategory =
      categoryFilter === "ALL" || art.category.name.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Categories list extracted dynamically
  const categoriesList = Array.from(
    new Set(breakingArticles.map((a) => a.category.nameNp || a.category.name))
  );

  return (
    <div className="w-full space-y-6 px-6 py-4 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-serif flex items-center gap-2">
              <Zap className="h-6 w-6 text-rose-600 animate-pulse" />
              <span>Breaking Ticker Manager</span>
            </h1>
            <span className="text-xs font-bold bg-rose-500/10 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              {breakingArticles.length} Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Real-time breaking headlines broadcasting on top portal ticker
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 text-xs rounded-xl border-border font-medium hover:bg-muted"
            title="Refresh breaking news"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-rose-600" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/articles">
            <Button size="sm" variant="outline" className="text-xs font-semibold px-4 h-9 rounded-xl border-border">
              <span>View All Articles</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Ticker Items</p>
            <p className="text-xl font-extrabold text-rose-600 mt-0.5">{breakingArticles.length}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Zap className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Portal Broadcast</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">LIVE</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Auto Refresh</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">30s Sync</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Single Unified Filter Toolbar */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search breaking headline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-8 pr-7 py-1 text-xs text-foreground outline-none focus:border-rose-500 transition-colors"
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

          {/* Category Filter */}
          {categoriesList.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1 text-xs font-semibold text-foreground outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {(search || categoryFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
              }}
              className="text-xs text-rose-600 hover:underline font-bold px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Breaking Articles Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <div className="h-5 w-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading breaking news ticker items...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-rose-500 font-semibold">
            Failed to load breaking news.
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold">No active breaking news items matching criteria.</p>
            <p className="text-[11px]">To add breaking news, edit an article and turn on &quot;Add to Breaking Ticker&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-slate-50/80 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-4 py-3">Headline Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Broadcast Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredArticles.map((art) => (
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
                            <span className="text-[9px] font-extrabold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded animate-pulse">
                              ⚡ BREAKING TICKER
                            </span>
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

                    {/* Broadcast Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                        <Radio className="h-3 w-3 animate-pulse text-rose-500" />
                        <span>LIVE ON TICKER</span>
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-muted-foreground">
                      {new Date(art.updatedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
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
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-[#027081]"
                          title="Edit Story"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={toggleBreakingMutation.isPending}
                        onClick={() =>
                          toggleBreakingMutation.mutate({ articleId: art.id, isBreaking: false })
                        }
                        className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-500/10"
                        title="Remove from Breaking Ticker"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
