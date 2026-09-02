"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/content";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
} from "@/constants/admin-layout";
import type { LucideIcon } from "lucide-react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
};

type AdminResourcePageProps<T extends { id: string }> = {
  title: string;
  icon?: LucideIcon;
  description?: string;
  queryKey: string;
  apiPath: string;
  columns: Column<T>[];
  emptyMessage?: string;
  createFields?: { name: string; label: string; placeholder?: string }[];
  buildCreatePayload: (values: Record<string, string>) => object;
  headerSlot?: React.ReactNode;
};

export function AdminResourcePage<T extends { id: string }>({
  title,
  description,
  queryKey,
  apiPath,
  columns,
  emptyMessage = "No records found.",
  createFields = [],
  buildCreatePayload,
  headerSlot,
}: AdminResourcePageProps<T>) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(apiPath);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: object) => {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Created successfully");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setShowForm(false);
      setFormValues({});
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
    },
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPageShell
      title={title}
      description={description}
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        createFields.length > 0 ? (
          <button
            type="button"
            className={adminBtnPrimary}
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        ) : undefined
      }
    >
      {headerSlot}

      {showForm && createFields.length > 0 ? (
        <div className={`${adminPanel} grid gap-3 p-3 sm:grid-cols-2`}>
          {createFields.map((f) => (
            <div key={f.name} className="space-y-1">
              <label className="text-xs font-medium text-foreground">{f.label}</label>
              <input
                className={adminInput}
                placeholder={f.placeholder}
                value={formValues[f.name] || ""}
                onChange={(e) => setFormValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="button"
              className={adminBtnPrimary}
              onClick={() => createMutation.mutate(buildCreatePayload(formValues))}
            >
              Save
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className={adminPanel}>
        {isError ? (
          <p className="px-3 py-6 text-xs text-destructive">
            {error?.message ?? "Failed to load data."}
          </p>
        ) : (
          <AdminDataTable
            loading={isLoading}
            rows={data}
            rowKey={(row) => row.id}
            emptyMessage={emptyMessage}
            columns={[
              ...columns.map((c) => ({
                key: String(c.key),
                label: c.label,
                align: c.align,
                render: c.render,
              })),
              {
                key: "actions",
                label: "Actions",
                align: "right" as const,
                render: (row: T) => (
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-destructive hover:bg-muted"
                    onClick={() => deleteMutation.mutate(row.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ),
              },
            ]}
          />
        )}
      </div>
    </AdminPageShell>
  );
}
