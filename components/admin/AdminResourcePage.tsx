"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import type { LucideIcon } from "lucide-react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type AdminResourcePageProps<T extends { id: string }> = {
  title: string;
  icon: LucideIcon;
  description?: string;
  queryKey: string;
  apiPath: string;
  columns: Column<T>[];
  emptyMessage?: string;
  createFields?: { name: string; label: string; placeholder?: string }[];
  buildCreatePayload: (values: Record<string, string>) => object;
};

export function AdminResourcePage<T extends { id: string }>({
  title,
  icon,
  description,
  queryKey,
  apiPath,
  columns,
  emptyMessage = "No records found.",
  createFields = [],
  buildCreatePayload,
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
      icon={icon}
      description={description}
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        createFields.length > 0 ? (
          <Button size="sm" className="h-8 text-xs" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        ) : undefined
      }
    >
      {showForm && createFields.length > 0 ? (
        <div className="rounded-xl border bg-card p-4 grid gap-3 sm:grid-cols-2">
          {createFields.map((f) => (
            <div key={f.name} className="space-y-1">
              <label className="text-xs font-medium">{f.label}</label>
              <input
                className="w-full h-9 rounded-md border px-3 text-sm"
                placeholder={f.placeholder}
                value={formValues[f.name] || ""}
                onChange={(e) => setFormValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex gap-2">
            <Button size="sm" onClick={() => createMutation.mutate(buildCreatePayload(formValues))}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">{error?.message ?? "Failed to load data."}</p>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={String(c.key)} className="px-4 py-3 font-bold">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-4 py-3">
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-destructive"
                      onClick={() => deleteMutation.mutate(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
