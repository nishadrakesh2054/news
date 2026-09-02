"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  AdminDataTable,
  AdminPanel,
  AdminStatsStrip,
} from "@/components/admin/content";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminPageContainer,
  adminPageDescription,
  adminPageHeader,
  adminPageTitle,
} from "@/constants/admin-layout";

const SHORTCUTS = [
  { href: "/admin/articles/new", label: "New article" },
  { href: "/admin/breaking", label: "Breaking news" },
  { href: "/admin/live", label: "Live coverage" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/articles", label: "All articles" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const publishedCount = data?.publishedCount ?? 0;
  const totalArticles = data?.totalArticles ?? 0;
  const breakingCount = data?.breakingCount ?? 0;
  const totalViews = data?.totalViews ?? 0;
  const topArticles = data?.topArticles ?? [];

  return (
    <div className={adminPageContainer}>
      <header className={adminPageHeader}>
        <div>
          <h1 className={adminPageTitle}>Overview</h1>
          <p className={adminPageDescription}>
            Newsroom activity and publishing summary
          </p>
        </div>
        <Link href="/admin/articles/new" className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New article
        </Link>
      </header>

      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Published", value: publishedCount },
          { label: "Total articles", value: totalArticles },
          { label: "Total views", value: totalViews.toLocaleString() },
          { label: "Breaking stories", value: breakingCount },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map((item) => (
          <Link key={item.href} href={item.href} className={adminBtnSecondary}>
            {item.label}
          </Link>
        ))}
      </div>

      <AdminPanel
        title="Top articles by views"
        action={
          <Link
            href="/admin/analytics"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            View analytics
          </Link>
        }
      >
        <AdminDataTable
          loading={isLoading}
          rows={topArticles}
          rowKey={(row) => row.id}
          emptyMessage="No published articles yet."
          columns={[
            {
              key: "title",
              label: "Title",
              render: (row) => (
                <Link
                  href={`/admin/articles/${row.id}/edit`}
                  className="font-medium text-foreground hover:underline"
                >
                  {row.title}
                </Link>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (row) => row.category?.name ?? "—",
            },
            {
              key: "views",
              label: "Views",
              align: "right",
              cellClassName: "font-mono tabular-nums text-muted-foreground",
              render: (row) => row.views.toLocaleString(),
            },
          ]}
        />
      </AdminPanel>
    </div>
  );
}
