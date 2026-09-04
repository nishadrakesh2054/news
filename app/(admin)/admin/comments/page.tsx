"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ExternalLink, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBadgeSuccess,
  adminBadgeWarning,
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
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SPAM", label: "Spam" },
];

function statusBadgeClass(status: AdminComment["status"]) {
  switch (status) {
    case "APPROVED":
      return adminBadgeSuccess;
    case "PENDING":
      return adminBadgeWarning;
    case "SPAM":
      return "inline-flex items-center rounded-sm border border-[#C3272E]/30 bg-[#C3272E]/10 px-1.5 py-1 text-[10px] font-medium leading-relaxed text-[#C3272E]";
    default:
      return adminBadgeMuted;
  }
}

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();
  // Default ALL — admin/editor posts auto-approve and were invisible under Pending-only.
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-comments", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "30" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/comments?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load comments");
      return json.data as {
        comments: AdminComment[];
        counts?: { pending: number; approved: number; rejected: number; spam: number; all: number };
        pagination: { total: number };
      };
    },
  });

  const comments = data?.comments ?? [];
  const total = data?.pagination?.total ?? comments.length;
  const counts = data?.counts;

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

  const bulkMutation = useMutation({
    mutationFn: async ({
      ids,
      action,
      status,
    }: {
      ids: string[];
      action: "update" | "delete";
      status?: string;
    }) => {
      const res = await fetch("/api/admin/comments/bulk", {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "delete" ? { ids } : { ids, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Bulk action failed");
    },
    onSuccess: () => {
      toast.success("Bulk action completed");
      setSelectedIds([]);
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.id));
    }
  };

  return (
    <AdminPageShell
      title="Comments"
      description="Moderate reader comments on published stories"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        stats={[
          { label: "All", value: counts?.all ?? total },
          { label: "Pending", value: counts?.pending ?? "—" },
          { label: "Approved", value: counts?.approved ?? "—" },
          { label: "Spam / rejected", value: (counts?.spam ?? 0) + (counts?.rejected ?? 0) },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setSelectedIds([]);
          }}
          className={adminToolbarSelectStatus}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.value === "PENDING" && counts ? ` (${counts.pending})` : ""}
              {option.value === "APPROVED" && counts ? ` (${counts.approved})` : ""}
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

        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
            <button
              type="button"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, action: "update", status: "APPROVED" })}
              className={adminBtnSecondary}
            >
              Approve all
            </button>
            <button
              type="button"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, action: "update", status: "REJECTED" })}
              className={adminBtnGhost}
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, action: "update", status: "SPAM" })}
              className={adminBtnGhost}
            >
              Mark spam
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${selectedIds.length} comments?`)) {
                  bulkMutation.mutate({ ids: selectedIds, action: "delete" });
                }
              }}
              className="text-xs font-medium text-[#C3272E] hover:underline"
            >
              Delete selected
            </button>
          </div>
        ) : null}
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading comments…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load comments.</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {statusFilter === "PENDING"
              ? "No pending comments. Switch to All or Approved to see published ones."
              : "No comments found."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className={adminTableHeadCell}>Author</th>
                  <th className={adminTableHeadCell}>Comment</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={adminTableHeadCell}>Story</th>
                  <th className={adminTableHeadCell}>Date</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comment) => (
                  <tr key={comment.id} className={adminTableRow}>
                    <td className={adminTableCell}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                        aria-label="Select comment"
                      />
                    </td>
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
                      <p className="line-clamp-3 leading-relaxed text-foreground">{comment.content}</p>
                    </td>
                    <td className={adminTableCell}>
                      <span className={statusBadgeClass(comment.status)}>{comment.status}</span>
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
                        {comment.status !== "APPROVED" ? (
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: comment.id, status: "APPROVED" })}
                            className={adminBtnSecondary}
                            title="Approve"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        ) : null}
                        {comment.status !== "REJECTED" ? (
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: comment.id, status: "REJECTED" })}
                            className={adminBtnGhost}
                            title="Reject"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        ) : null}
                        {comment.status !== "SPAM" ? (
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
