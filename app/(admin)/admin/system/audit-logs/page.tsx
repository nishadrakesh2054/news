"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";

type AuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user?: { name: string; email: string };
};

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery<AuditRow[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/audit-logs");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const entities = useMemo(() => {
    const unique = [...new Set(data.map((log) => log.entity))].sort();
    return unique;
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((log) => {
      const matchesEntity = entityFilter === "ALL" || log.entity === entityFilter;
      const matchesSearch =
        term === "" ||
        log.action.toLowerCase().includes(term) ||
        log.entity.toLowerCase().includes(term) ||
        (log.details ?? "").toLowerCase().includes(term) ||
        (log.user?.name ?? "").toLowerCase().includes(term) ||
        (log.user?.email ?? "").toLowerCase().includes(term);
      return matchesEntity && matchesSearch;
    });
  }, [data, search, entityFilter]);

  const hasFilters = search.trim() !== "" || entityFilter !== "ALL";

  return (
    <AdminPageShell
      title="Audit logs"
      description="System activity and administrative actions"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total entries", value: data.length },
          { label: "Filtered", value: isLoading ? "—" : filtered.length },
          { label: "Entity types", value: entities.length || "—" },
          { label: "Latest", value: data[0] ? new Date(data[0].createdAt).toLocaleDateString() : "—" },
        ]}
      />

      <SystemSectionNav />

      <div className={adminToolbarRow}>
        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, user, or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-sm border border-border bg-card pl-8 pr-7 text-xs outline-none focus:border-[#0C4EA0]/50"
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

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className={adminToolbarSelectStatus}
        >
          <option value="ALL">All entities</option>
          {entities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setEntityFilter("ALL");
            }}
            className={adminBtnGhost}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <AdminPanel title="Activity log">
        {isError ? (
          <p className="px-3 py-6 text-xs text-destructive">
            {error?.message ?? "Failed to load audit logs."}
          </p>
        ) : (
          <AdminDataTable
            loading={isLoading}
            rows={filtered}
            rowKey={(row) => row.id}
            emptyMessage="No audit logs yet."
            columns={[
              {
                key: "createdAt",
                label: "Time",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => new Date(row.createdAt).toLocaleString(),
              },
              {
                key: "user",
                label: "User",
                render: (row) => row.user?.name ?? "System",
              },
              { key: "action", label: "Action" },
              { key: "entity", label: "Entity" },
              {
                key: "details",
                label: "Details",
                cellClassName: "max-w-xs truncate text-muted-foreground",
                render: (row) => row.details ?? "—",
              },
            ]}
          />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
