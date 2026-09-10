"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, UserX, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBadgeSuccess,
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

interface SubscriberItem {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface NewsletterData {
  subscribers: SubscriberItem[];
  stats: { activeCount: number; unsubscribedCount: number; total: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function formatJoined(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminNewsletterPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-newsletter", statusFilter, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load subscribers");
      return json.data as NewsletterData;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
    },
    onSuccess: () => {
      toast.success("Subscriber removed");
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "UNSUBSCRIBED" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
    },
    onSuccess: () => {
      toast.success("Subscriber unsubscribed");
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const subscribers = data?.subscribers ?? [];
  const pagination = data?.pagination;
  const busy = deleteMutation.isPending || unsubscribeMutation.isPending;

  return (
    <AdminPageShell
      title="Newsletter"
      description="Email subscribers from the public signup form"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        stats={[
          { label: "Active", value: data?.stats.activeCount ?? 0 },
          { label: "Unsubscribed", value: data?.stats.unsubscribedCount ?? 0 },
          { label: "On this page", value: subscribers.length },
          { label: "Matched", value: data?.stats.total ?? 0 },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={adminToolbarSelectStatus}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="UNSUBSCRIBED">Unsubscribed</option>
        </select>

        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${adminInput} w-full pl-7 pr-7`}
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {search || statusFilter !== "ALL" ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setPage(1);
            }}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading subscribers…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load subscribers.</p>
        ) : subscribers.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {search || statusFilter !== "ALL"
              ? "No subscribers match your filters."
              : "No newsletter subscribers yet."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={adminTable}>
                <thead className={adminTableHead}>
                  <tr>
                    <th className={`${adminTableHeadCell} w-12`}>#</th>
                    <th className={adminTableHeadCell}>Email</th>
                    <th className={`${adminTableHeadCell} w-32`}>Status</th>
                    <th className={`${adminTableHeadCell} w-32`}>Joined</th>
                    <th className={`${adminTableHeadCell} w-24 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, index) => {
                    const rowNumber = ((pagination?.page ?? page) - 1) * limit + index + 1;
                    const isActive = sub.status === "ACTIVE";
                    return (
                      <tr key={sub.id} className={adminTableRow}>
                        <td
                          className={`${adminTableCell} font-mono tabular-nums text-muted-foreground`}
                        >
                          {rowNumber}
                        </td>
                        <td className={adminTableCell}>
                          <a
                            href={`mailto:${sub.email}`}
                            className="break-all text-xs font-medium leading-[1.55] text-foreground hover:text-[#0C4EA0]"
                          >
                            {sub.email}
                          </a>
                        </td>
                        <td className={adminTableCell}>
                          <span className={isActive ? adminBadgeSuccess : adminBadgeMuted}>
                            {isActive ? "Active" : "Unsubscribed"}
                          </span>
                        </td>
                        <td
                          className={`${adminTableCell} whitespace-nowrap tabular-nums text-muted-foreground`}
                        >
                          {formatJoined(sub.createdAt)}
                        </td>
                        <td className={`${adminTableCell} text-right`}>
                          <div className="inline-flex items-center gap-1">
                            {isActive ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => unsubscribeMutation.mutate(sub.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#0C4EA0] hover:bg-[#0C4EA0]/10 disabled:opacity-40"
                                title="Unsubscribe"
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (confirm(`Delete ${sub.email}?`)) {
                                  deleteMutation.mutate(sub.id);
                                }
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-[#C3272E]/10 disabled:opacity-40"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 px-3 py-2.5 text-xs text-muted-foreground sm:flex-row">
                <div>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className={adminBtnSecondary}
                  >
                    Previous
                  </button>
                  <span className="tabular-nums">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className={adminBtnSecondary}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AdminPageShell>
  );
}
