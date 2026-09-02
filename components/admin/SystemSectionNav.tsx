"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminBtnPrimary, adminBtnSecondary } from "@/constants/admin-layout";

const NAV_ITEMS = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/system/roles", label: "Roles" },
  { href: "/admin/system/audit-logs", label: "Audit logs" },
  { href: "/admin/system/api", label: "API keys" },
  { href: "/admin/system/maintenance", label: "Maintenance" },
] as const;

export function SystemSectionNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? adminBtnPrimary : adminBtnSecondary}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
