"use client";

import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function AdminSystemRolesPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/roles");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  return (
    <AdminPageShell title="Roles & Permissions" icon={Shield} onRefresh={() => refetch()} isRefreshing={isFetching}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Module</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Editor</th>
                <th className="px-4 py-3 text-center">Author</th>
                <th className="px-4 py-3 text-center">Reader</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.matrix ?? []).map((row: { module: string; admin: boolean; editor: boolean; author: string | boolean; reader: boolean }) => (
                <tr key={row.module}>
                  <td className="px-4 py-3 font-medium">{row.module}</td>
                  <td className="px-4 py-3 text-center">{row.admin ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-center">{row.editor ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-center">{String(row.author)}</td>
                  <td className="px-4 py-3 text-center">{row.reader ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
}
