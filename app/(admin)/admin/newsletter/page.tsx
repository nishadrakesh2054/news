"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnGhost,
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
  name: string | null;
  locale: string;
  status: string;
  source: string | null;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-newsletter", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load subscribers");
      return json.data as {
        subscribers: SubscriberItem[];
        stats: { activeCount: number; pushCount: number; total: number };
      };
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

  return (
    <AdminPageShell
      title="Newsletter & push"
      description="Email subscribers and web push audience"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        stats={[
          { label: "Active email subs", value: data?.stats.activeCount ?? 0 },
          { label: "Push subscribers", value: data?.stats.pushCount ?? 0 },
          { label: "Showing", value: subscribers.length },
          { label: "Total matched", value: data?.stats.total ?? 0 },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
            placeholder="Search email or name…"
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
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading subscribers…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load subscribers.</p>
        ) : subscribers.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No subscribers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Email</th>
                  <th className={adminTableHeadCell}>Name</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={adminTableHeadCell}>Source</th>
                  <th className={adminTableHeadCell}>Joined</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.id} className={adminTableRow}>
                    <td className={adminTableCell}>{sub.email}</td>
                    <td className={`${adminTableCell} text-muted-foreground`}>{sub.name || "—"}</td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>{sub.status}</span>
                    </td>
                    <td className={`${adminTableCell} text-muted-foreground`}>{sub.source || "—"}</td>
                    <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center gap-1">
                        {sub.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => unsubscribeMutation.mutate(sub.id)}
                            className={adminBtnGhost}
                          >
                            Unsubscribe
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this subscriber?")) deleteMutation.mutate(sub.id);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
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
