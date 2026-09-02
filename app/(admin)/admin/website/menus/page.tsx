"use client";

import { Menu } from "lucide-react";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

type MenuRow = { id: string; name: string; label: string };

export default function AdminWebsiteMenusPage() {
  return (
    <AdminResourcePage<MenuRow>
      title="Menus"
      icon={Menu}
      description="Header, footer, and navigation menus"
      queryKey="admin-menus"
      apiPath="/api/admin/website/menus"
      createFields={[
        { name: "name", label: "System name", placeholder: "header" },
        { name: "label", label: "Display label", placeholder: "Main Header" },
      ]}
      buildCreatePayload={(v) => ({
        name: v.name,
        label: v.label,
        items: [{ label: "Home", url: "/" }],
      })}
      columns={[
        { key: "name", label: "Name" },
        { key: "label", label: "Label" },
      ]}
    />
  );
}
