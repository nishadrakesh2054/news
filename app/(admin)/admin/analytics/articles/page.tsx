"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

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

  return (
    <AdminPageShell title="Article Analytics" icon={FileText} onRefresh={() => refetch()} isRefreshing={isFetching}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-bold mb-3">Top Articles by Views</h3>
            <table className="w-full text-xs">
              <tbody className="divide-y">
                {(data?.topArticles ?? []).map((a: { id: string; title: string; views: number }) => (
                  <tr key={a.id}>
                    <td className="py-2 pr-2">{a.title}</td>
                    <td className="py-2 text-right font-mono">{a.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-bold mb-3">Views by Category</h3>
            <table className="w-full text-xs">
              <tbody className="divide-y">
                {(data?.categoryStats ?? []).map((c: { id: string; name: string; views: number; articles: number }) => (
                  <tr key={c.id}>
                    <td className="py-2">{c.name}</td>
                    <td className="py-2 text-right">{c.articles} articles</td>
                    <td className="py-2 text-right font-mono">{c.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
