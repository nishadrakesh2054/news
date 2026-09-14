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
  /** When set, card becomes a clickable filter control. */
  onClick?: () => void;
  active?: boolean;
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
          const clickable = Boolean(stat.onClick);
          const className = `${adminStatCard}${
            clickable ? " cursor-pointer transition-colors hover:border-[#0C4EA0]/40" : ""
          }${stat.active ? " border-[#0C4EA0] bg-[#0C4EA0]/5" : ""}`;

          if (clickable) {
            return (
              <button
                key={stat.label}
                type="button"
                onClick={stat.onClick}
                className={`${className} w-full text-left`}
                aria-pressed={stat.active}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className={adminStatLabel}>{stat.label}</div>
                    <div className={adminStatValue}>{loading ? "—" : stat.value}</div>
                    {stat.hint ? (
                      <div className={adminStatHint}>{loading ? " " : stat.hint}</div>
                    ) : null}
                  </div>
                  {Icon ? (
                    <Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/55"
                      strokeWidth={1.75}
                    />
                  ) : null}
                </div>
              </button>
            );
          }

          return (
            <div key={stat.label} className={className}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={adminStatLabel}>{stat.label}</div>
                  <div className={adminStatValue}>{loading ? "—" : stat.value}</div>
                  {stat.hint ? (
                    <div className={adminStatHint}>{loading ? " " : stat.hint}</div>
                  ) : null}
                </div>
                {Icon ? (
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/55"
                    strokeWidth={1.75}
                  />
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
