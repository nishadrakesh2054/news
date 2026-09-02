"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AnalyticsSectionNav } from "@/components/admin/AnalyticsSectionNav";
import {
  AdminDataTable,
  AdminPanel,
  AdminStatsStrip,
} from "@/components/admin/content";
import { adminBadgeMuted } from "@/constants/admin-layout";

interface ArticleRow {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  views: number;
  status: string;
  type: string;
  publishedAt: string | null;
  category: { name: string };
  author: { name: string };
}

interface CategoryRow {
  id: string;
  name: string;
  articles: number;
  views: number;
}

export default function AdminAnalyticsArticlesPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-analytics-articles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/articles");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const topArticles: ArticleRow[] = data?.topArticles ?? [];
  const categoryStats: CategoryRow[] = data?.categoryStats ?? [];

  const totalViews = useMemo(
    () => topArticles.reduce((sum, article) => sum + article.views, 0),
    [topArticles]
  );

  const rankedArticles = topArticles.map((article, index) => ({
    ...article,
    rank: index + 1,
  }));

  const sortedCategories = [...categoryStats].sort((a, b) => b.views - a.views);

  return (
    <AdminPageShell
      title="Article analytics"
      description="Published article performance and category breakdown"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Top articles", value: topArticles.length },
          { label: "Combined views", value: totalViews.toLocaleString() },
          { label: "Categories", value: categoryStats.length },
          {
            label: "Avg. views / article",
            value:
              topArticles.length > 0
                ? Math.round(totalViews / topArticles.length).toLocaleString()
                : "—",
          },
        ]}
      />

      <AnalyticsSectionNav />

      <AdminPanel
        title="Top published articles"
        action={
          <Link
            href="/admin/articles"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Manage articles
          </Link>
        }
      >
        <AdminDataTable
          loading={isLoading}
          rows={rankedArticles}
          rowKey={(row) => row.id}
          emptyMessage="No published articles yet."
          columns={[
            {
              key: "rank",
              label: "#",
              cellClassName: "w-8 font-mono text-muted-foreground",
              render: (row) => row.rank,
            },
            {
              key: "title",
              label: "Title",
              render: (row) => (
                <Link
                  href={`/admin/articles/${row.id}/edit`}
                  className="font-medium text-foreground hover:underline"
                >
                  {row.titleNp || row.title}
                </Link>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (row) => row.category.name,
            },
            {
              key: "author",
              label: "Author",
              render: (row) => row.author.name,
            },
            {
              key: "type",
              label: "Format",
              render: (row) => (
                <span className={adminBadgeMuted}>{row.type}</span>
              ),
            },
            {
              key: "publishedAt",
              label: "Published",
              cellClassName: "whitespace-nowrap text-muted-foreground",
              render: (row) =>
                row.publishedAt
                  ? new Date(row.publishedAt).toLocaleDateString()
                  : "—",
            },
            {
              key: "views",
              label: "Views",
              align: "right",
              cellClassName: "font-mono tabular-nums",
              render: (row) => row.views.toLocaleString(),
            },
          ]}
        />
      </AdminPanel>

      <AdminPanel title="Views by category">
        <AdminDataTable
          loading={isLoading}
          rows={sortedCategories}
          rowKey={(row) => row.id}
          emptyMessage="No category data yet."
          columns={[
            { key: "name", label: "Category" },
            {
              key: "articles",
              label: "Articles",
              align: "right",
              cellClassName: "font-mono tabular-nums",
            },
            {
              key: "views",
              label: "Views",
              align: "right",
              cellClassName: "font-mono tabular-nums",
              render: (row) => row.views.toLocaleString(),
            },
            {
              key: "share",
              label: "Share",
              align: "right",
              cellClassName: "font-mono tabular-nums text-muted-foreground",
              render: (row) =>
                totalViews > 0
                  ? `${((row.views / totalViews) * 100).toFixed(1)}%`
                  : "—",
            },
          ]}
        />
      </AdminPanel>
    </AdminPageShell>
  );
}
