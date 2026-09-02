"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Pencil } from "lucide-react";
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
} from "@/constants/admin-layout";

type FeaturedArticle = {
  id: string;
  title: string;
  slug: string;
  featuredOrder: number | null;
  category: { name: string };
  author: { name: string };
};

export default function AdminFeaturedPage() {
  const queryClient = useQueryClient();
  const [articleId, setArticleId] = useState("");

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
    mutationFn: async () => {
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
      toast.success("Article featured");
      setArticleId("");
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
          { label: "Slots used", value: data.length },
          { label: "With order", value: data.filter((a) => a.featuredOrder != null).length },
          { label: "Status", value: data.length > 0 ? "Active" : "Empty" },
        ]}
      />

      <div className={adminToolbarRow}>
        <input
          className={`${adminInput} min-w-[200px] flex-1 max-w-md`}
          placeholder="Article ID to feature"
          value={articleId}
          onChange={(e) => setArticleId(e.target.value)}
        />
        <button
          type="button"
          onClick={() => addMutation.mutate()}
          disabled={!articleId.trim() || addMutation.isPending}
          className={adminBtnPrimary}
        >
          Add featured
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Copy an article ID from the Articles list, or feature stories from the article editor.
      </p>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading featured stories…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load featured stories.</p>
        ) : data.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No featured stories yet.</p>
        ) : (
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
                {data.map((article) => (
                  <tr key={article.id} className={adminTableRow}>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                      {article.featuredOrder ?? "—"}
                    </td>
                    <td className={adminTableCell}>
                      <p className="max-w-md truncate font-medium text-foreground">{article.title}</p>
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
        )}
      </div>
    </AdminPageShell>
  );
}
