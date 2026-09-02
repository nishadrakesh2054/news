"use client";

import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

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
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery<AuditRow[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/audit-logs");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  return (
    <AdminPageShell title="Audit Logs" icon={ScrollText} onRefresh={() => refetch()} isRefreshing={isFetching}>
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">{error?.message ?? "Failed to load audit logs."}</p>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No audit logs yet. Actions will appear here.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Entity</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.user?.name ?? "System"}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">{log.entity}</td>
                  <td className="px-4 py-3 truncate max-w-xs">{log.details ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
