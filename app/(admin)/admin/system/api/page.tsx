"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plug, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

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
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      setRawKey(data.rawKey);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      toast.success("API key created — copy it now");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPageShell title="API Management" icon={Plug} onRefresh={() => refetch()} isRefreshing={isFetching}>
      <div className="rounded-xl border bg-card p-4 flex gap-2">
        <input
          className="flex-1 h-9 rounded-md border px-3 text-sm"
          placeholder="Key name (e.g. Cron job)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={!name}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create Key
        </Button>
      </div>

      {rawKey ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-mono break-all">
          New key (copy now): {rawKey}
        </div>
      ) : null}

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">{error?.message ?? "Failed to load API keys. Admin access required."}</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Prefix</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3">{k.name}</td>
                  <td className="px-4 py-3 font-mono">{k.keyPrefix}...</td>
                  <td className="px-4 py-3">{k.isActive ? "Active" : "Disabled"}</td>
                  <td className="px-4 py-3">{new Date(k.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
