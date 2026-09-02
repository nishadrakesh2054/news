"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { WebsiteSectionNav } from "@/components/admin/WebsiteSectionNav";

type MenuRow = { id: string; name: string; label: string };

export default function AdminWebsiteMenusPage() {
  return (
    <AdminResourcePage<MenuRow>
        title="Menus"
        description="Header, footer, and navigation menus"
        queryKey="admin-menus"
        apiPath="/api/admin/website/menus"
        createFields={[
          { name: "name", label: "System name", placeholder: "header" },
          { name: "label", label: "Display label", placeholder: "Main header" },
        ]}
        buildCreatePayload={(v) => ({
          name: v.name,
          label: v.label,
          items: [{ label: "Home", url: "/" }],
        })}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (row) => <span className="font-mono text-xs">{row.name}</span>,
          },
          { key: "label", label: "Label" },
        ]}
        headerSlot={<WebsiteSectionNav />}
      />
  );
}
