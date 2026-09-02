import { adminStatCell, adminStatGrid, adminStatLabel, adminStatValue } from "@/constants/admin-layout";

type StatItem = {
  label: string;
  value: string | number;
};

type AdminStatsStripProps = {
  stats: StatItem[];
  loading?: boolean;
};

export function AdminStatsStrip({ stats, loading }: AdminStatsStripProps) {
  return (
    <div className={adminStatGrid}>
      {stats.map((stat) => (
        <div key={stat.label} className={adminStatCell}>
          <div className={adminStatLabel}>{stat.label}</div>
          <div className={adminStatValue}>{loading ? "—" : stat.value}</div>
        </div>
      ))}
    </div>
  );
}
