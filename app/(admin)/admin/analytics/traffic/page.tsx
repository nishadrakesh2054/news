"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AnalyticsSectionNav } from "@/components/admin/AnalyticsSectionNav";
import {
  AdminDataTable,
  AdminPanel,
  AdminStatsStrip,
} from "@/components/admin/content";
import {
  adminBadge,
  adminBadgeMuted,
  adminBtnPrimary,
  adminInput,
} from "@/constants/admin-layout";

interface DeviceItem {
  name: string;
  percentage: number;
  views?: number;
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
  return adminBadgeMuted;
}

function TrackingTagsForm({
  initial,
  onSaved,
}: {
  initial: { ga4Id: string; gtmId: string; fbPixelId: string };
  onSaved: () => void;
}) {
  const [ga4Id, setGa4Id] = useState(initial.ga4Id);
  const [gtmId, setGtmId] = useState(initial.gtmId);
  const [fbPixelId, setFbPixelId] = useState(initial.fbPixelId);

  const handleSaveTags = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/analytics/traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ga4Id, gtmId, fbPixelId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      toast.success("Tracking configuration saved.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSaveTags} className="space-y-3 p-3">
      <p className="text-xs text-muted-foreground">
        Google Analytics, Tag Manager, and Meta Pixel IDs for the public site.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            GA4 measurement ID
          </label>
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={ga4Id}
            onChange={(e) => setGa4Id(e.target.value)}
            className={`${adminInput} w-full font-mono`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            GTM container ID
          </label>
          <input
            type="text"
            placeholder="GTM-XXXXXXX"
            value={gtmId}
            onChange={(e) => setGtmId(e.target.value)}
            className={`${adminInput} w-full font-mono`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Meta pixel ID
          </label>
          <input
            type="text"
            placeholder="Pixel ID"
            value={fbPixelId}
            onChange={(e) => setFbPixelId(e.target.value)}
            className={`${adminInput} w-full font-mono`}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-3">
        <button type="submit" className={adminBtnPrimary}>
          <Save className="h-3 w-3" />
          Save tags
        </button>
      </div>
    </form>
  );
}

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

  const devices: DeviceItem[] = data?.devices ?? [];
  const peakHours: PeakHourItem[] = data?.peakHours ?? [];
  const totalViews = data?.totalViews ?? 0;

  const deviceRows = devices.map((device) => ({
    ...device,
    estViews: device.views ?? Math.round(totalViews * (device.percentage / 100)),
  }));

  const trackingKey = data
    ? `${data.ga4Id ?? ""}-${data.gtmId ?? ""}-${data.fbPixelId ?? ""}`
    : "loading";

  return (
    <AdminPageShell
      title="Traffic analytics"
      description="Audience devices, peak hours, and tracking tags"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total views", value: totalViews.toLocaleString() },
          { label: "Published articles", value: data?.publishedArticles ?? 0 },
          { label: "Device types", value: devices.length || "—" },
          { label: "Peak windows", value: peakHours.length || "—" },
        ]}
      />

      <AnalyticsSectionNav />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Device breakdown">
          <AdminDataTable
            loading={isLoading}
            rows={deviceRows}
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
                key: "estViews",
                label: "Views",
                align: "right",
                cellClassName: "font-mono tabular-nums text-muted-foreground",
                render: (row) => row.estViews.toLocaleString(),
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
              { key: "time", label: "Time" },
              { key: "label", label: "Period" },
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

      <AdminPanel title="Tracking tags">
        {data ? (
          <TrackingTagsForm
            key={trackingKey}
            initial={{
              ga4Id: data.ga4Id ?? "",
              gtmId: data.gtmId ?? "",
              fbPixelId: data.fbPixelId ?? "",
            }}
            onSaved={() => refetch()}
          />
        ) : (
          <p className="px-3 py-6 text-xs text-muted-foreground">Loading tracking settings…</p>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
