"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ADMIN_NAV_SECTIONS, isAdminNavItemActive } from "@/constants/admin-navigation";
import {
  ADMIN_SIDEBAR_WIDTH_COLLAPSED,
  ADMIN_SIDEBAR_WIDTH_EXPANDED,
} from "@/constants/admin-layout";

type AdminSidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
};

function SidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex h-5 w-5 items-center justify-center border-0 bg-transparent p-0 text-white/55 hover:text-white outline-none focus:outline-none focus-visible:outline-none transition-colors"
    >
      {collapsed ? (
        <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={2} />
      ) : (
        <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={2} />
      )}
    </button>
  );
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`z-20 h-full hidden md:flex flex-col min-h-0 shrink-0 bg-[#0C4EA0] text-white select-none transition-[width] duration-200 ease-out ${
        collapsed ? ADMIN_SIDEBAR_WIDTH_COLLAPSED : ADMIN_SIDEBAR_WIDTH_EXPANDED
      }`}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1.5 pt-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/35">
        {collapsed && onToggle ? (
          <div className="mb-2 flex justify-center">
            <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
          </div>
        ) : null}

        <div className="space-y-2.5">
          {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-0.5">
              {!collapsed && (
                <div className="flex items-center justify-between gap-1 px-1.5">
                  <h2 className="text-[8px] font-bold tracking-[0.14em] text-white/50 uppercase truncate">
                    {section.title}
                  </h2>
                  {sectionIndex === 0 && onToggle ? (
                    <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
                  ) : null}
                </div>
              )}

              <nav className="flex flex-col gap-px">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isAdminNavItemActive(pathname, item.href, item.exactMatch);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group flex min-h-7.5 items-center rounded-sm ${
                        collapsed ? "justify-center px-1" : "gap-2 px-2"
                      } py-1 text-[11.5px] leading-tight transition-colors duration-150 ${
                        isActive
                          ? "bg-[#C3272E] text-white font-semibold"
                          : "text-white/75 hover:text-white hover:bg-white/10 font-medium"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-white" : "text-white/75 group-hover:text-white"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate text-left">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
