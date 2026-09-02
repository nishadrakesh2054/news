export type MonthBucket = {
  key: string;
  label: string;
};

export function getRecentMonthBuckets(months: number): MonthBucket[] {
  const result: MonthBucket[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: toMonthKey(date),
      label: date.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  return result;
}

export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function startOfMonthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - (months - 1));
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function countByMonth<T>(
  items: T[],
  getDate: (item: T) => Date,
  buckets: MonthBucket[]
): Record<string, number> {
  const counts = Object.fromEntries(buckets.map((bucket) => [bucket.key, 0])) as Record<
    string,
    number
  >;

  for (const item of items) {
    const key = toMonthKey(getDate(item));
    if (key in counts) {
      counts[key] += 1;
    }
  }

  return counts;
}
