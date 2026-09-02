"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AnalyticsSectionNav } from "@/components/admin/AnalyticsSectionNav";
import { AnalyticsChartsSection } from "@/components/admin/analytics/AnalyticsChartsSection";
import {
  AdminDataTable,
  AdminPanel,
  AdminStatsStrip,
} from "@/components/admin/content";
import { adminBadge, adminBadgeMuted } from "@/constants/admin-layout";

interface TopArticleItem {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  views: number;
  category: { name: string; nameNp?: string | null };
  author: { name: string };
}

interface CategoryStatItem {
  id: string;
  name: string;
  articlesCount: number;
  views: number;
  percentage: number;
}

interface DeviceItem {
  name: string;
  percentage: number;
  views: number;
}

interface PeakHourItem {
  time: string;
  label: string;
  volume: string;
}

function volumeBadge(volume: string) {
  const normalized = volume.toLowerCase();
  if (normalized === "peak" || normalized === "high") {
    return adminBadge;
  }
  if (normalized === "medium") {
    return adminBadgeMuted;
  }
  return adminBadgeMuted;
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch analytics");
      return json.data;
    },
  });

  const totalViews = data?.totalViews ?? 0;
  const topArticles: TopArticleItem[] = data?.topArticles ?? [];
  const rankedArticles = topArticles.map((article, index) => ({
    ...article,
    rank: index + 1,
  }));
  const categoryStats: CategoryStatItem[] = data?.categoryStats ?? [];
  const deviceBreakdown: DeviceItem[] = data?.deviceBreakdown ?? [];
  const peakHours: PeakHourItem[] = data?.peakHours ?? [];
  const monthlyUserGrowth = data?.monthlyUserGrowth ?? [];
  const articlesPublished = data?.articlesPublished ?? [];
  const articlesByCategory = data?.articlesByCategory ?? [];

  return (
    <AdminPageShell
      title="Analytics"
      description="Readership overview and portal performance"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total views", value: totalViews.toLocaleString() },
          { label: "Total articles", value: data?.totalArticles ?? 0 },
          { label: "Published", value: data?.publishedCount ?? 0 },
          { label: "Breaking", value: data?.breakingCount ?? 0 },
        ]}
      />

      <AnalyticsSectionNav />

      <AnalyticsChartsSection
        loading={isLoading}
        monthlyUserGrowth={monthlyUserGrowth}
        articlesPublished={articlesPublished}
        articlesByCategory={articlesByCategory}
      />

      <AdminPanel
        title="Top articles by views"
        action={
          <Link
            href="/admin/analytics/articles"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Full article report
          </Link>
        }
      >
        <AdminDataTable
          loading={isLoading}
          rows={rankedArticles}
          rowKey={(row) => row.id}
          emptyMessage="No readership data yet."
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
              render: (row) => row.category.nameNp || row.category.name,
            },
            {
              key: "author",
              label: "Author",
              render: (row) => row.author.name,
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

      <AdminPanel title="Views by category">
        <AdminDataTable
          loading={isLoading}
          rows={categoryStats}
          rowKey={(row) => row.id}
          emptyMessage="No category data yet."
          columns={[
            { key: "name", label: "Category" },
            {
              key: "articlesCount",
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
              key: "percentage",
              label: "Share",
              align: "right",
              cellClassName: "font-mono tabular-nums text-muted-foreground",
              render: (row) => `${row.percentage}%`,
            },
          ]}
        />
      </AdminPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Device breakdown">
          <AdminDataTable
            loading={isLoading}
            rows={deviceBreakdown}
            rowKey={(row) => row.name}
            emptyMessage="No device data."
            columns={[
              { key: "name", label: "Device" },
              {
                key: "percentage",
                label: "Share",
                align: "right",
                cellClassName: "font-mono tabular-nums",
                render: (row) => `${row.percentage}%`,
              },
              {
                key: "views",
                label: "Est. views",
                align: "right",
                cellClassName: "font-mono tabular-nums text-muted-foreground",
                render: (row) => row.views.toLocaleString(),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel title="Peak traffic hours">
          <AdminDataTable
            loading={isLoading}
            rows={peakHours}
            rowKey={(row) => row.time}
            emptyMessage="No peak hour data."
            columns={[
              { key: "time", label: "Time window" },
              {
                key: "label",
                label: "Period",
                render: (row) => row.label,
              },
              {
                key: "volume",
                label: "Volume",
                align: "right",
                render: (row) => (
                  <span className={volumeBadge(row.volume)}>{row.volume}</span>
                ),
              },
            ]}
          />
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
