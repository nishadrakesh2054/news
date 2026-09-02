"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminBtnPrimary, adminBtnSecondary } from "@/constants/admin-layout";

const NAV_ITEMS = [
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/website/seo", label: "SEO" },
  { href: "/admin/website/menus", label: "Menus" },
  { href: "/admin/website/redirects", label: "Redirects" },
] as const;

export function WebsiteSectionNav() {
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
