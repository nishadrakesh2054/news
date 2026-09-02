"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBadgeSuccess,
  adminBtnPrimary,
  adminInput,
  adminPanel,
} from "@/constants/admin-layout";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminApiManagementPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery<ApiKeyRow[]>({
    queryKey: ["admin-api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/api-keys");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/system/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (created) => {
      setRawKey(created.rawKey);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      toast.success("API key created — copy it now");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeCount = data.filter((key) => key.isActive).length;

  return (
    <AdminPageShell
      title="API keys"
      description="Create and manage programmatic access keys"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total keys", value: data.length },
          { label: "Active", value: activeCount },
          { label: "Disabled", value: data.length - activeCount },
          {
            label: "Latest",
            value: data[0] ? new Date(data[0].createdAt).toLocaleDateString() : "—",
          },
        ]}
      />

      <SystemSectionNav />

      <div className={`${adminPanel} flex flex-wrap items-center gap-2 p-3`}>
        <input
          className={`${adminInput} min-w-[200px] flex-1`}
          placeholder="Key name (e.g. Cron job)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className={adminBtnPrimary}
          onClick={() => createMutation.mutate()}
          disabled={!name.trim() || createMutation.isPending}
        >
          <Plus className="h-3 w-3" />
          Create key
        </button>
      </div>

      {rawKey ? (
        <div className="border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            New key — copy now, it will not be shown again
          </p>
          <p className="mt-1 break-all font-mono text-amber-800 dark:text-amber-300">{rawKey}</p>
        </div>
      ) : null}

      <AdminPanel title="API keys">
        {isError ? (
          <p className="px-3 py-6 text-xs text-destructive">
            {error?.message ?? "Failed to load API keys."}
          </p>
        ) : (
          <AdminDataTable
            loading={isLoading}
            rows={data}
            rowKey={(row) => row.id}
            emptyMessage="No API keys yet."
            columns={[
              { key: "name", label: "Name" },
              {
                key: "keyPrefix",
                label: "Prefix",
                render: (row) => (
                  <span className="font-mono text-muted-foreground">{row.keyPrefix}…</span>
                ),
              },
              {
                key: "isActive",
                label: "Status",
                render: (row) => (
                  <span className={row.isActive ? adminBadgeSuccess : adminBadgeMuted}>
                    {row.isActive ? "Active" : "Disabled"}
                  </span>
                ),
              },
              {
                key: "createdAt",
                label: "Created",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
            ]}
          />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
