"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminBtnPrimary, adminBtnSecondary } from "@/constants/admin-layout";

const NAV_ITEMS = [
  { href: "/admin/analytics", label: "Overview", exact: true },
  { href: "/admin/analytics/articles", label: "Articles" },
  { href: "/admin/analytics/traffic", label: "Traffic" },
] as const;

export function AnalyticsSectionNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {NAV_ITEMS.map((item) => {
        const active =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
