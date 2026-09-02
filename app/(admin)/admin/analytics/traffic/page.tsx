"use client";

import { useQuery } from "@tanstack/react-query";
import { LineChart } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function AdminAnalyticsTrafficPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-analytics-traffic"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/traffic");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  return (
    <AdminPageShell title="Traffic Analytics" icon={LineChart} onRefresh={() => refetch()} isRefreshing={isFetching}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-[10px] uppercase text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{data?.totalViews ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-[10px] uppercase text-muted-foreground">Published Articles</p>
            <p className="text-2xl font-bold">{data?.publishedArticles ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 sm:col-span-2">
            <p className="text-[10px] uppercase text-muted-foreground mb-2">Device Split</p>
            <div className="space-y-1 text-xs">
              {(data?.devices ?? []).map((d: { name: string; percentage: number }) => (
                <div key={d.name} className="flex justify-between">
                  <span>{d.name}</span>
                  <span className="font-mono">{d.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
