"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, ImageIcon, Pencil, Search, X } from "lucide-react";
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
  adminToolbarSelectMd,
} from "@/constants/admin-layout";

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
    onSuccess: (_data, variables) => {
      toast.success(variables.isBreaking ? "Added to ticker" : "Removed from ticker");
      queryClient.invalidateQueries({ queryKey: ["admin-breaking"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const categoriesList = useMemo(
    () => Array.from(new Set(breakingArticles.map((a) => a.category.nameNp || a.category.name))),
    [breakingArticles]
  );

  const filteredArticles = useMemo(() => {
    return breakingArticles.filter((art) => {
      const matchesSearch =
        search.trim() === "" ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        (art.titleNp && art.titleNp.includes(search));
      const catName = art.category.nameNp || art.category.name;
      const matchesCategory = categoryFilter === "ALL" || catName === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [breakingArticles, search, categoryFilter]);

  const isFiltered = search.trim() !== "" || categoryFilter !== "ALL";

  return (
    <AdminPageShell
      title="Breaking news"
      description="Manage stories shown in the site breaking ticker"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/articles" className={adminBtnSecondary}>
          All articles
        </Link>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Active ticker items", value: breakingArticles.length },
          { label: "Showing", value: filteredArticles.length },
          { label: "Categories", value: categoriesList.length },
          { label: "Status", value: breakingArticles.length > 0 ? "Live" : "Empty" },
        ]}
      />

      <div className={adminToolbarRow}>
        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search headlines…"
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

        {categoriesList.length > 0 ? (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={adminToolbarSelectMd}
          >
            <option value="ALL">All categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        ) : null}

        {isFiltered ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter("ALL");
            }}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Reset
          </button>
        ) : null}

        <Link href="/admin/articles/new" className={`${adminBtnPrimary} ml-auto shrink-0`}>
          New article
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        To add breaking news, edit an article and enable &quot;Breaking&quot; or set format to Breaking.
      </p>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading breaking news…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load breaking news.</p>
        ) : filteredArticles.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            No breaking items match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Headline</th>
                  <th className={adminTableHeadCell}>Category</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={adminTableHeadCell}>Updated</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => (
                  <tr key={art.id} className={adminTableRow}>
                    <td className={`${adminTableCell} max-w-md`}>
                      <div className="flex items-center gap-2.5">
                        {art.coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={art.coverImage}
                            alt=""
                            className="h-8 w-8 shrink-0 border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-dashed border-border bg-muted/20 text-muted-foreground">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="mb-0.5 inline-flex items-center rounded-sm border border-[#C3272E]/30 bg-[#C3272E]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#C3272E]">
                            Breaking
                          </span>
                          <p className="truncate font-medium text-foreground">
                            {art.titleNp || art.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>
                        {art.category.nameNp || art.category.name}
                      </span>
                    </td>
                    <td className={`${adminTableCell} text-muted-foreground`}>{art.status}</td>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                      {new Date(art.updatedAt).toLocaleString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <a
                          href={`/article/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={adminBtnGhost}
                          title="View"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <Link href={`/admin/articles/${art.id}/edit`} className={adminBtnGhost} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          disabled={toggleBreakingMutation.isPending}
                          onClick={() =>
                            toggleBreakingMutation.mutate({ articleId: art.id, isBreaking: false })
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
                          title="Remove from ticker"
                        >
                          <X className="h-3.5 w-3.5" />
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
    </AdminPageShell>
  );
}
