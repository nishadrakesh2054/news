"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPanel } from "@/components/admin/content";

const BRAND_BLUE = "#0C4EA0";

export type MonthlyPoint = {
  month: string;
  users: number;
};

export type PublishedPoint = {
  month: string;
  articles: number;
};

export type CategoryPoint = {
  name: string;
  articles: number;
};

type AnalyticsChartsSectionProps = {
  loading?: boolean;
  monthlyUserGrowth: MonthlyPoint[];
  articlesPublished: PublishedPoint[];
  articlesByCategory: CategoryPoint[];
};

function ChartPlaceholder({ loading }: { loading?: boolean }) {
  return (
    <div className="flex h-full min-h-56 items-center justify-center text-xs text-muted-foreground">
      {loading ? "Loading chart…" : "No data for this period."}
    </div>
  );
}

function chartTooltipStyle() {
  return {
    fontSize: 11,
    borderRadius: 4,
    border: "1px solid rgba(148, 163, 184, 0.4)",
  };
}

export function AnalyticsChartsSection({
  loading,
  monthlyUserGrowth,
  articlesPublished,
  articlesByCategory,
}: AnalyticsChartsSectionProps) {
  const categoryChartHeight = Math.max(220, articlesByCategory.length * 36 + 48);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title="Monthly user growth">
          <div className="h-64 p-3 pt-1">
            {!loading && monthlyUserGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyUserGrowth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle()}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    formatter={(value: number) => [value, "New users"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke={BRAND_BLUE}
                    strokeWidth={2}
                    dot={{ r: 3, fill: BRAND_BLUE, strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder loading={loading} />
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Articles published">
          <div className="h-64 p-3 pt-1">
            {!loading && articlesPublished.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={articlesPublished} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle()}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    formatter={(value: number) => [value, "Published"]}
                  />
                  <Bar dataKey="articles" fill={BRAND_BLUE} radius={[2, 2, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder loading={loading} />
            )}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="Articles by category">
        <div className="p-3 pt-1" style={{ height: categoryChartHeight }}>
          {!loading && articlesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={articlesByCategory}
                margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle()}
                  formatter={(value: number) => [value, "Articles"]}
                />
                <Bar dataKey="articles" fill={BRAND_BLUE} radius={[0, 2, 2, 0]} barSize={16}>
                  <LabelList dataKey="articles" position="right" style={{ fontSize: 10, fill: "#64748b" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder loading={loading} />
          )}
        </div>
      </AdminPanel>
    </div>
  );
}
