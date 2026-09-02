"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import { adminBadge, adminBadgeMuted } from "@/constants/admin-layout";

type MatrixRow = {
  module: string;
  admin: boolean;
  editor: boolean;
  author: string | boolean;
  reader: boolean;
};

function accessCell(value: string | boolean) {
  if (value === true) {
    return <span className={adminBadge}>Yes</span>;
  }
  if (value === false) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className={adminBadgeMuted}>{String(value)}</span>;
}

export default function AdminSystemRolesPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/roles");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data as {
        roles: string[];
        matrix: MatrixRow[];
      };
    },
  });

  const matrix = data?.matrix ?? [];
  const roles = data?.roles ?? [];

  return (
    <AdminPageShell
      title="Roles & permissions"
      description="Access matrix by role — assign roles on the Users page"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Roles", value: roles.length || "—" },
          { label: "Modules", value: matrix.length || "—" },
          { label: "Admin access", value: "Full" },
          { label: "Reader access", value: "None" },
        ]}
      />

      <SystemSectionNav />

      <AdminPanel title="Permission matrix">
        <AdminDataTable
          loading={isLoading}
          rows={matrix}
          rowKey={(row) => row.module}
          emptyMessage="No permission data."
          columns={[
            { key: "module", label: "Module" },
            {
              key: "admin",
              label: "Admin",
              align: "right",
              render: (row) => accessCell(row.admin),
            },
            {
              key: "editor",
              label: "Editor",
              align: "right",
              render: (row) => accessCell(row.editor),
            },
            {
              key: "author",
              label: "Author",
              align: "right",
              render: (row) => accessCell(row.author),
            },
            {
              key: "reader",
              label: "Reader",
              align: "right",
              render: (row) => accessCell(row.reader),
            },
          ]}
        />
      </AdminPanel>
    </AdminPageShell>
  );
}
