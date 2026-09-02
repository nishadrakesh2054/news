"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ADMIN_BRAND } from "@/constants/admin-layout";

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans text-sm">
      <AdminHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
        <main
          id="main-content"
          className="relative z-10 flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden"
          style={{ backgroundColor: ADMIN_BRAND.surface }}
        >
          <div className="min-h-full px-4 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
