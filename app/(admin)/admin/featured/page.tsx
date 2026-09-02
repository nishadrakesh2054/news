"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ExternalLink, Pencil, Save } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ArticleSearchPicker } from "@/components/admin/ArticleSearchPicker";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminPanel,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
} from "@/constants/admin-layout";

type FeaturedArticle = {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  featuredOrder: number | null;
  category: { name: string };
  author: { name: string };
};

export default function AdminFeaturedPage() {
  const queryClient = useQueryClient();

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery<FeaturedArticle[]>({
    queryKey: ["admin-featured"],
    queryFn: async () => {
      const res = await fetch("/api/admin/featured");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, isFeatured: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Article added to featured");
      queryClient.invalidateQueries({ queryKey: ["admin-featured"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, isFeatured: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
    },
    onSuccess: () => {
      toast.success("Removed from featured");
      queryClient.invalidateQueries({ queryKey: ["admin-featured"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async (articleIds: string[]) => {
      const res = await fetch("/api/admin/featured/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
    },
    onSuccess: () => {
      toast.success("Featured order saved");
      queryClient.invalidateQueries({ queryKey: ["admin-featured"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= data.length) return;
    const reordered = [...data];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);
    reorderMutation.mutate(reordered.map((article) => article.id));
  };

  return (
    <AdminPageShell
      title="Featured news"
      description="Curate lead stories for the homepage hero"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/articles" className={adminBtnSecondary}>
          Browse articles
        </Link>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Featured stories", value: data.length },
          { label: "Lead slot", value: data[0]?.titleNp || data[0]?.title || "—" },
          { label: "With order", value: data.filter((a) => a.featuredOrder != null).length },
          { label: "Status", value: data.length > 0 ? "Active" : "Empty" },
        ]}
      />

      <section className={adminPanel}>
        <div className="border-b border-border/70 px-3 py-2">
          <p className="text-xs font-medium text-foreground">Add featured story</p>
          <p className="text-[10px] text-muted-foreground">
            Search published articles — no need to copy IDs manually.
          </p>
        </div>
        <div className="p-3">
          <ArticleSearchPicker
            excludeIds={data.map((article) => article.id)}
            onSelect={(article) => addMutation.mutate(article.id)}
          />
        </div>
      </section>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading featured stories…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load featured stories.</p>
        ) : data.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No featured stories yet.</p>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Order saved automatically when you move stories up or down.
              </p>
              <button
                type="button"
                onClick={() => reorderMutation.mutate(data.map((a) => a.id))}
                disabled={reorderMutation.isPending}
                className={adminBtnPrimary}
              >
                <Save className="h-3 w-3" />
                Save order
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className={adminTable}>
                <thead className={adminTableHead}>
                  <tr>
                    <th className={adminTableHeadCell}>Order</th>
                    <th className={adminTableHeadCell}>Title</th>
                    <th className={adminTableHeadCell}>Category</th>
                    <th className={adminTableHeadCell}>Author</th>
                    <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((article, index) => (
                    <tr key={article.id} className={adminTableRow}>
                      <td className={adminTableCell}>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {article.featuredOrder ?? index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === 0 || reorderMutation.isPending}
                            onClick={() => moveItem(index, -1)}
                            className={adminBtnGhost}
                            title="Move up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === data.length - 1 || reorderMutation.isPending}
                            onClick={() => moveItem(index, 1)}
                            className={adminBtnGhost}
                            title="Move down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className={adminTableCell}>
                        <p className="max-w-md truncate font-medium text-foreground">
                          {article.titleNp || article.title}
                        </p>
                        {index === 0 ? (
                          <span className="mt-0.5 inline-flex rounded-sm border border-[#0C4EA0]/30 bg-[#0C4EA0]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0C4EA0]">
                            Lead story
                          </span>
                        ) : null}
                      </td>
                      <td className={adminTableCell}>
                        <span className={adminBadgeMuted}>{article.category.name}</span>
                      </td>
                      <td className={`${adminTableCell} text-muted-foreground`}>{article.author.name}</td>
                      <td className={`${adminTableCell} text-right`}>
                        <div className="inline-flex items-center">
                          <a
                            href={`/article/${article.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={adminBtnGhost}
                            title="View"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className={adminBtnGhost}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeMutation.mutate(article.id)}
                            disabled={removeMutation.isPending}
                            className="inline-flex h-7 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminPageShell>
  );
}
