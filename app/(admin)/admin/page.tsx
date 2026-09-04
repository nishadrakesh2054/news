"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Plus, Zap } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  AdminDataTable,
  AdminPanel,
  AdminStatsStrip,
} from "@/components/admin/content";
import { adminBtnPrimary, adminBtnSecondary } from "@/constants/admin-layout";

const SHORTCUTS = [
  { href: "/admin/articles/new", label: "New article" },
  { href: "/admin/breaking", label: "Breaking news" },
  { href: "/admin/live", label: "Live coverage" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/articles", label: "All articles" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

interface TopArticleItem {
  id: string;
  title: string;
  views: number;
  category?: { name: string };
}

export default function AdminDashboardPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
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
  const topArticles: TopArticleItem[] = data?.topArticles ?? [];

  return (
    <AdminPageShell
      title="Overview"
      description="Newsroom activity and publishing summary"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/articles/new" className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New article
        </Link>
      }
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          {
            label: "Published",
            value: publishedCount,
            hint: "Live on site",
            icon: Eye,
          },
          {
            label: "Total articles",
            value: totalArticles,
            hint: "All statuses",
            icon: FileText,
          },
          {
            label: "Total views",
            value: totalViews.toLocaleString(),
            hint: "All-time readership",
            icon: Eye,
          },
          {
            label: "Breaking stories",
            value: breakingCount,
            hint: "Active breaking flag",
            icon: Zap,
          },
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
        <AdminDataTable<TopArticleItem>
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
    </AdminPageShell>
  );
}
