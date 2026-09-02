"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ExternalLink, Pencil, X, Clock } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
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

interface ReviewArticle {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  author: { name: string; email: string };
  category: { name: string; nameNp: string | null };
}

export default function AdminArticleReviewPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-review-queue", page],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "PENDING",
        limit: "20",
        page: String(page),
      });
      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load review queue");
      return json.data as {
        articles: ReviewArticle[];
        pagination: { total: number; totalPages: number };
      };
    },
  });

  const articles = data?.articles ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "PUBLISHED" | "DRAFT" }) => {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update article");
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === "PUBLISHED" ? "Article approved and published" : "Sent back to draft"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AdminPageShell
      title="Editorial review"
      description="Approve or reject articles awaiting publication"
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
          { label: "Pending review", value: total },
          { label: "On this page", value: articles.length },
          { label: "Page", value: `${page} / ${totalPages}` },
          { label: "Queue", value: total > 0 ? "Active" : "Clear" },
        ]}
      />

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading review queue…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load review queue.</p>
        ) : articles.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            No articles pending review.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Headline</th>
                  <th className={adminTableHeadCell}>Author</th>
                  <th className={adminTableHeadCell}>Category</th>
                  <th className={adminTableHeadCell}>Submitted</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className={adminTableRow}>
                    <td className={`${adminTableCell} max-w-md`}>
                      <p className="truncate font-medium text-foreground">
                        {article.titleNp || article.title}
                      </p>
                      {article.scheduledAt ? (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Scheduled {new Date(article.scheduledAt).toLocaleString()}
                        </p>
                      ) : null}
                    </td>
                    <td className={adminTableCell}>
                      <p className="text-foreground">{article.author.name}</p>
                      <p className="text-[11px] text-muted-foreground">{article.author.email}</p>
                    </td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>
                        {article.category.nameNp || article.category.name}
                      </span>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                      {new Date(article.createdAt).toLocaleString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => reviewMutation.mutate({ id: article.id, status: "PUBLISHED" })}
                          disabled={reviewMutation.isPending}
                          className={adminBtnPrimary}
                          title="Approve & publish"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewMutation.mutate({ id: article.id, status: "DRAFT" })}
                          disabled={reviewMutation.isPending}
                          className={adminBtnSecondary}
                          title="Send back to draft"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                        <Link href={`/admin/articles/${article.id}/edit`} className={adminBtnGhost} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href={`/article/${article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={adminBtnGhost}
                          title="Preview"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={adminBtnSecondary}
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={adminBtnSecondary}
          >
            Next
          </button>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
