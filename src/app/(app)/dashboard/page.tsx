/**
 * Dashboard (Home) — wired to real Suburban Toppers data (Supabase).
 *
 * Server Component: fetches everything server-side via getDashboardData()
 * (which bypasses RLS using the service_role key — see src/lib/supabase/admin.ts)
 * and passes plain, serializable data down to the (already client-side)
 * chart components.
 *
 * Honesty notes (see src/lib/data/dashboard.ts for the full explanation):
 *   - Invoices/revenue/sales figures are real and current (data through
 *     ~Jul 2026).
 *   - The install *schedule* (`appointments` table) hasn't been used since
 *     2014 — this dealer moved scheduling elsewhere years ago. "Today's
 *     Installs" is therefore relabeled "Most Recent Scheduled Installs
 *     (Legacy Data)" and shows the last day that actually has rows, not
 *     literally today. Real live scheduling is Phase 2a on the roadmap
 *     (Google Calendar sync).
 *   - "Stock vs. Custom Order" from the old mockup was dropped — there's no
 *     confident real analog for that distinction in the source data.
 */

import Link from "next/link";
import { ArrowRight, FileText, AlertCircle, TrendingUp, Wrench } from "lucide-react";
import { PageHeader, KpiCard, Card } from "@/components/ui";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ReadyForInstallTable } from "@/components/dashboard/ReadyForInstallTable";
import { DonutChartCard, type DonutDatum } from "@/components/charts/DonutChartCard";
import { SalesBreakdownCard } from "@/components/charts/SalesBreakdownCard";
import { MorningBriefingCard } from "@/components/dashboard/MorningBriefingCard";
import { getDashboardData, type DashboardInstall, type SalesBreakdownRow } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";

const DONUT_COLORS = [
  "var(--color-signal-orange)",
  "var(--color-sienna-bronze)",
  "var(--color-graphite)",
  "var(--color-slate)",
  "var(--color-chalk)",
];

function toDonutData(rows: SalesBreakdownRow[]): DonutDatum[] {
  const total = rows.reduce((sum, r) => sum + r.revenue, 0);
  if (total === 0) return [];
  const top = rows.slice(0, 4);
  const rest = rows.slice(4);
  const restRevenue = rest.reduce((sum, r) => sum + r.revenue, 0);
  const entries = restRevenue > 0 ? [...top, { key: "Other", count: 0, revenue: restRevenue }] : top;
  return entries.map((r, i) => ({
    name: r.key,
    value: Math.round((r.revenue / total) * 1000) / 10,
    color: DONUT_COLORS[i] ?? DONUT_COLORS[DONUT_COLORS.length - 1],
  }));
}

function formatDataDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const donutData = toDonutData(data.salesByManufacturer);
  const topManufacturer = donutData[0];

  // Month-over-month revenue delta (real, computed from the trailing series)
  const months = data.monthlyRevenue;
  const thisMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];
  const momDeltaPct =
    thisMonth && lastMonth && lastMonth.value > 0
      ? Math.round(((thisMonth.value - lastMonth.value) / lastMonth.value) * 1000) / 10
      : null;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Dashboard" }]}
        title="Dashboard"
      />

      <div style={{ padding: "0 32px 32px 32px" }}>
        {/* === Section A: KPI Row (real data) === */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}
        >
          <KpiCard
            label="Open Invoices"
            value={data.openInvoiceCount.toLocaleString()}
            icon={FileText}
            iconAccent="orange"
            contextLabel="not yet closed out"
          />
          <KpiCard
            label="Open Balance"
            value={formatCurrency(data.openInvoiceBalance)}
            icon={AlertCircle}
            iconAccent="bronze"
            tone="bad"
            contextLabel="across all open invoices"
          />
          <KpiCard
            label="This Month's Revenue"
            value={thisMonth ? formatCurrency(thisMonth.value) : "—"}
            icon={TrendingUp}
            iconAccent="orange"
            deltaDirection={momDeltaPct == null ? undefined : momDeltaPct >= 0 ? "up" : "down"}
            deltaValue={momDeltaPct == null ? undefined : `${momDeltaPct > 0 ? "+" : ""}${momDeltaPct}%`}
            contextLabel="vs. last month"
          />
          <KpiCard
            label="Most Recent Installs"
            value={data.installs.length}
            icon={Wrench}
            iconAccent="orange"
            contextLabel={`legacy schedule data — ${formatDataDate(data.recentInstallDate)}`}
          />
        </div>

        {/* === Section B: Charts Row (60/40) === */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "3fr 2fr", gap: "20px", marginBottom: "32px" }}
        >
          <RevenueChart data={data.monthlyRevenue.map((m) => ({ label: m.month, value: m.value }))} />
          {donutData.length > 0 && (
            <DonutChartCard
              title="Sales by Manufacturer"
              data={donutData}
              centerValue={`${topManufacturer?.value ?? 0}%`}
              centerLabel={topManufacturer?.name ?? ""}
            />
          )}
        </div>

        {/* === Section C: Most Recent Scheduled Installs (legacy data) === */}
        <Card padding={0} className="mb-32">
          <div
            className="flex items-center justify-between"
            style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-chalk)" }}
          >
            <div>
              <h3
                className="text-carbon"
                style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, lineHeight: 1.2 }}
              >
                Most Recent Scheduled Installs
              </h3>
              <p className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                From legacy scheduling data ({formatDataDate(data.recentInstallDate)}) — live schedule sync is
                planned (Roadmap Phase 2a).
              </p>
            </div>
            <Link
              href="/schedule"
              className="text-signal-orange inline-flex items-center shrink-0"
              style={{ fontSize: "14px", fontWeight: 500, gap: "4px" }}
            >
              View Schedule
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <InstallList installs={data.installs} />
        </Card>

        {/* === Section D: Ready for Install === */}
        <div className="mb-32">
          <ReadyForInstallTable items={data.readyForInstall} />
        </div>

        {/* === Section E: Sales by Manufacturer / Truck Brand / Model === */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "32px" }}
        >
          <SalesBreakdownCard
            title="Sales by Truck Brand"
            subtitle="units sold, trailing data"
            rows={data.salesByTruckBrand}
          />
          <SalesBreakdownCard
            title="Sales by Truck Model"
            subtitle="top 6"
            rows={data.salesByTruckModel}
            maxRows={6}
            barColor="var(--color-sienna-bronze)"
          />
          <SalesBreakdownCard
            title="Sales by Manufacturer"
            subtitle="top 8, all-time"
            rows={data.salesByManufacturer}
            barColor="var(--color-graphite)"
          />
        </div>

        {/* === Section F: Morning Briefing (Phase 2c agent) === */}
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <MorningBriefingCard />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: recent-installs list (single list now — legacy data no
// longer maps cleanly to the two-location split the mockup assumed, since
// most rows in this old table don't have a location set).
// ============================================================================

function InstallList({ installs }: { installs: DashboardInstall[] }) {
  if (installs.length === 0) {
    return (
      <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
        No installs in the legacy schedule data.
      </div>
    );
  }
  return (
    <div style={{ padding: "20px 24px" }}>
      <div className="flex flex-col" style={{ gap: "8px" }}>
        {installs.map((inst) => (
          <div
            key={inst.id}
            className="bg-paper rounded-md"
            style={{
              padding: "10px 12px",
              borderLeft: "3px solid var(--color-signal-orange)",
              background: "var(--color-fog)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-carbon truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                {inst.clientName}
              </div>
              <div className="text-slate truncate" style={{ fontSize: "12px", lineHeight: 1.2 }}>
                {inst.status ?? "No status"} {inst.locationName ? `· ${inst.locationName.trim()}` : ""}
              </div>
            </div>
            <div className="text-slate shrink-0" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
              {inst.completed ? "Completed" : "Not completed"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
