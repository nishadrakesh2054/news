"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ExternalLink, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
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
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";

interface AdminComment {
  id: string;
  content: string;
  authorName: string | null;
  authorEmail: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  createdAt: string;
  article: {
    id: string;
    title: string;
    titleNp: string | null;
    slug: string;
  };
  author?: {
    name: string;
    email: string;
  } | null;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SPAM", label: "Spam" },
];

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-comments", statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/comments?status=${statusFilter}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load comments");
      return json.data as { comments: AdminComment[]; pagination: { total: number } };
    },
  });

  const comments = data?.comments ?? [];
  const total = data?.pagination?.total ?? comments.length;

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update");
    },
    onSuccess: () => {
      toast.success("Comment updated");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete");
    },
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = comments.filter((comment) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      comment.content.toLowerCase().includes(term) ||
      (comment.authorName && comment.authorName.toLowerCase().includes(term)) ||
      comment.article.title.toLowerCase().includes(term) ||
      (comment.article.titleNp && comment.article.titleNp.includes(term))
    );
  });

  return (
    <AdminPageShell
      title="Comments"
      description="Moderate reader comments on published stories"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        stats={[
          { label: "Queue", value: statusFilter.toLowerCase() },
          { label: "Total in view", value: total },
          { label: "Showing", value: filtered.length },
          { label: "Status filter", value: STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ?? "—" },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={adminToolbarSelectStatus}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search comment, author, or story…"
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
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading comments…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load comments.</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No comments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Author</th>
                  <th className={adminTableHeadCell}>Comment</th>
                  <th className={adminTableHeadCell}>Story</th>
                  <th className={adminTableHeadCell}>Date</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comment) => (
                  <tr key={comment.id} className={adminTableRow}>
                    <td className={`${adminTableCell} whitespace-nowrap`}>
                      <p className="font-medium text-foreground">
                        {comment.author?.name || comment.authorName || "Anonymous"}
                      </p>
                      {(comment.author?.email || comment.authorEmail) && (
                        <p className="text-[11px] text-muted-foreground">
                          {comment.author?.email || comment.authorEmail}
                        </p>
                      )}
                    </td>
                    <td className={`${adminTableCell} max-w-md`}>
                      <p className="line-clamp-3 text-foreground">{comment.content}</p>
                    </td>
                    <td className={adminTableCell}>
                      <a
                        href={`/article/${comment.article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-[180px] items-center gap-1 truncate text-xs font-medium text-[#0C4EA0] hover:underline"
                      >
                        <span className="truncate">
                          {comment.article.titleNp || comment.article.title}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center gap-1">
                        {statusFilter !== "APPROVED" ? (
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: comment.id, status: "APPROVED" })}
                            className={adminBtnSecondary}
                            title="Approve"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        ) : null}
                        {statusFilter !== "REJECTED" ? (
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: comment.id, status: "REJECTED" })}
                            className={adminBtnGhost}
                            title="Reject"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        ) : null}
                        {statusFilter !== "SPAM" ? (
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: comment.id, status: "SPAM" })}
                            className={adminBtnGhost}
                            title="Mark spam"
                          >
                            <ShieldAlert className="h-3 w-3" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this comment?")) deleteMutation.mutate(comment.id);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
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
    </AdminPageShell>
  );
}
