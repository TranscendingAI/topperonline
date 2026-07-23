"use client";

/**
 * Thin client wrapper around AreaChartCard for the dashboard's Monthly
 * Revenue chart. Exists because Next.js Server Components can't pass
 * functions (like `formatValue`) as props into Client Components — the
 * dashboard page is now a Server Component (it fetches real data), so this
 * wrapper owns the function locally instead.
 */

import { AreaChartCard, type AreaSeriesPoint } from "@/components/charts/AreaChartCard";

export function RevenueChart({ data }: { data: AreaSeriesPoint[] }) {
  return (
    <AreaChartCard
      title="Monthly Revenue"
      subtitle="Trailing 12 months"
      data={data}
      periods={["12M"]}
      defaultPeriod="12M"
      formatValue={(n) => `$${(n / 1000).toFixed(0)}k`}
      height={240}
    />
  );
}
