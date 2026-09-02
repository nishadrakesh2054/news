"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  ADMIN_NAV_SECTIONS,
  filterNavSectionsForRole,
  isAdminNavItemActive,
} from "@/constants/admin-navigation";
import {
  ADMIN_SIDEBAR_WIDTH_COLLAPSED,
  ADMIN_SIDEBAR_WIDTH_EXPANDED,
  adminSidebarNavIcon,
  adminSidebarNavLink,
  adminSidebarNavLinkActive,
  adminSidebarNavLinkInactive,
  adminSidebarSectionLabel,
  adminSidebarShell,
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
  const { data: session } = useSession();
  const navSections = filterNavSectionsForRole(ADMIN_NAV_SECTIONS, session?.user?.role);

  return (
    <aside
      className={`z-20 h-full hidden md:flex flex-col min-h-0 shrink-0 bg-[#0C4EA0] text-white select-none transition-[width] duration-200 ease-out ${adminSidebarShell} ${
        collapsed ? ADMIN_SIDEBAR_WIDTH_COLLAPSED : ADMIN_SIDEBAR_WIDTH_EXPANDED
      }`}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1.5 pt-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/35">
        {collapsed && onToggle ? (
          <div className="mb-2 flex justify-center">
            <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
          </div>
        ) : null}

        <div className="space-y-3">
          {navSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className={sectionIndex > 0 ? "space-y-0.5 border-t border-white/10 pt-2.5" : "space-y-0.5"}
            >
              {!collapsed && (
                <div className="flex items-center justify-between gap-1 px-2 pb-1">
                  <h2 className={`${adminSidebarSectionLabel} truncate`}>
                    {section.title}
                  </h2>
                  {sectionIndex === 0 && onToggle ? (
                    <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
                  ) : null}
                </div>
              )}

              <nav className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isAdminNavItemActive(pathname, item.href, item.exactMatch);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group flex min-h-8 items-center rounded-sm transition-colors duration-150 ${adminSidebarNavLink} ${
                        collapsed ? "justify-center px-1" : "gap-2.5 px-2"
                      } py-1 ${
                        isActive ? adminSidebarNavLinkActive : adminSidebarNavLinkInactive
                      }`}
                    >
                      <Icon
                        className={`${adminSidebarNavIcon} ${
                          isActive ? "text-white" : "text-white/80 group-hover:text-white"
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
