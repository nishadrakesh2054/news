"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar collapsed={collapsed} />
        <main className="relative flex-1 overflow-visible bg-[#f7f7f7] p-3 md:p-4">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute left-1.5 top-1.5 z-50 flex h-5 w-5 items-center justify-center rounded-sm bg-transparent p-0 text-[#0C4EA0] transition hover:text-[#C3272E]"
          >
            {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </button>

          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
