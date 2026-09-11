"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminBtnSecondary,
  adminSelect,
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

type AuditPayload = {
  logs: AuditRow[];
  entities: string[];
  retentionDays: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 25;

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, entityFilter]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<AuditPayload>({
    queryKey: ["admin-audit-logs", page, debouncedSearch, entityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (entityFilter !== "ALL") params.set("entity", entityFilter);
      const res = await fetch(`/api/admin/system/audit-logs?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data as AuditPayload;
    },
  });

  const logs = data?.logs ?? [];
  const entities = data?.entities ?? [];
  const pagination = data?.pagination;
  const retentionDays = data?.retentionDays ?? 30;
  const hasFilters = search.trim() !== "" || entityFilter !== "ALL";

  return (
    <AdminPageShell
      title="Audit logs"
      description={`Admin activity · kept ${retentionDays} days`}
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Matching", value: pagination?.total ?? "—" },
          { label: "Page", value: pagination ? `${pagination.page} / ${pagination.totalPages}` : "—" },
          { label: "Entity types", value: entities.length || "—" },
          { label: "Retention", value: `${retentionDays}d` },
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
            className={`${adminSelect} w-full pl-8 pr-7`}
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
            rows={logs}
            rowKey={(row) => row.id}
            emptyMessage="No audit logs in this period."
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

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div>
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={adminBtnSecondary}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="font-medium text-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className={adminBtnSecondary}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
