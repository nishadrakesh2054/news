import type { LucideIcon } from "lucide-react";
import {
  adminStatCard,
  adminStatCardsGrid,
  adminStatCell,
  adminStatGrid,
  adminStatHint,
  adminStatLabel,
  adminStatValue,
} from "@/constants/admin-layout";

export type AdminStatItem = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
};

type AdminStatsStripProps = {
  stats: AdminStatItem[];
  loading?: boolean;
  layout?: "strip" | "cards";
};

export function AdminStatsStrip({
  stats,
  loading,
  layout = "cards",
}: AdminStatsStripProps) {
  if (layout === "cards") {
    return (
      <div className={adminStatCardsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={adminStatCard}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={adminStatLabel}>{stat.label}</div>
                  <div className={adminStatValue}>{loading ? "—" : stat.value}</div>
                  {stat.hint ? (
                    <div className={adminStatHint}>{loading ? " " : stat.hint}</div>
                  ) : null}
                </div>
                {Icon ? (
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/55" strokeWidth={1.75} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={adminStatGrid}>
      {stats.map((stat) => (
        <div key={stat.label} className={adminStatCell}>
          <div className={adminStatLabel}>{stat.label}</div>
          <div className={adminStatValue}>{loading ? "—" : stat.value}</div>
          {stat.hint ? <div className={adminStatHint}>{loading ? " " : stat.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
