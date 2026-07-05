/**
 * Dashboard (Home) — real widgets, not a UI showcase.
 *
 * Layout (per DESIGN.md Section 1):
 *   - PageHeader (no CTA)
 *   - Section A: 4 KPI cards (Today's Installs, Open Invoices, AR Overdue 30+, Pending Confirmations)
 *   - Section B: 60/40 charts row (Monthly Revenue area chart + Sales by Manufacturer donut)
 *   - Section C: Today's Schedule preview (full-width dual-location table)
 *   - Section D: 50/50 row (Ready for Install condensed table + AI Leads funnel)
 */

"use client";

import Link from "next/link";
import { ArrowRight, Wrench, FileText, Package, AlertCircle } from "lucide-react";
import { PageHeader, KpiCard, Card, DataTable } from "@/components/ui";
import { AreaChartCard } from "@/components/charts/AreaChartCard";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { FunnelCard } from "@/components/charts/FunnelCard";
import { MorningBriefingCard } from "@/components/dashboard/MorningBriefingCard";
import {
  DASHBOARD_METRICS,
  INVOICES,
  TODAY_INSTALLS,
  INVOICE_ITEMS,
  CLIENTS,
  PIPELINE_STAGE_LABELS,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { textColumn, dateColumn, currencyColumn, defaultRowActions } from "@/lib/columns";
import type { ColumnDef } from "@tanstack/react-table";

export default function DashboardPage() {
  // === Section A: KPI metrics ===
  const arOverdueDelta = DASHBOARD_METRICS.arOverdueDelta;
  // AR overdue is "bad when up" — flip the displayed direction
  // (Design: "Status Red delta if increased" — so when delta is positive, show red)
  const arDirection: "up" | "down" | "neutral" =
    arOverdueDelta > 0 ? "up" : arOverdueDelta < 0 ? "down" : "neutral";
  const arSign = arOverdueDelta > 0 ? "+" : arOverdueDelta < 0 ? "-" : "";

  // === Section C: Today's Installs (group by location) ===
  const suburbanInstalls = TODAY_INSTALLS.filter((i) => i.location === "suburban");
  const southInstalls = TODAY_INSTALLS.filter((i) => i.location === "south");

  // === Section D: Ready for Install (invoices with status "ordered" or "in_stock") ===
  const readyItems = INVOICE_ITEMS.filter((it) => it.status === "ordered" || it.status === "in_stock").slice(0, 5);
  const readyColumns: ColumnDef<(typeof readyItems)[0]>[] = [
    textColumn({
      header: "Invoice",
      sortKey: (it) => INVOICES.find((inv) => inv.id === it.invoiceId)?.number ?? "",
      render: (it) => {
        const inv = INVOICES.find((i) => i.id === it.invoiceId);
        return (
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "var(--color-slate)" }}>
            {inv?.number ?? it.invoiceId}
          </span>
        );
      },
    }),
    textColumn({
      header: "Client",
      sortKey: (it) => {
        const inv = INVOICES.find((i) => i.id === it.invoiceId);
        const c = inv ? CLIENTS.find((c) => c.id === inv.clientId) : null;
        return c?.companyName ?? `${c?.firstName ?? ""} ${c?.lastName ?? ""}`;
      },
      render: (it) => {
        const inv = INVOICES.find((i) => i.id === it.invoiceId);
        const c = inv ? CLIENTS.find((c) => c.id === inv.clientId) : null;
        const name = c?.companyName ?? `${c?.firstName ?? ""} ${c?.lastName ?? ""}`;
        return <span style={{ fontWeight: 500 }}>{name}</span>;
      },
    }),
    textColumn({
      header: "Description",
      render: (it) => it.description,
    }),
    currencyColumn({
      key: "price",
      header: "Price",
    }),
    defaultRowActions({
      onView: () => {},
      onEdit: () => {},
      onDelete: () => {},
    }),
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Dashboard" }]}
        title="Dashboard"
      />

      <div style={{ padding: "0 32px 32px 32px" }}>
        {/* === Section A: KPI Row === */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <KpiCard
            label="Today's Installs"
            value={DASHBOARD_METRICS.todaysInstalls}
            icon={Wrench}
            iconAccent="orange"
            deltaDirection="up"
            deltaValue="+3"
            contextLabel="vs. yesterday"
          />
          <KpiCard
            label="Open Invoices"
            value={DASHBOARD_METRICS.openInvoices}
            icon={FileText}
            iconAccent="orange"
            deltaDirection="down"
            deltaValue="-5"
            contextLabel="vs. last week"
          />
          <KpiCard
            label="AR Overdue 30+"
            value={formatCurrency(DASHBOARD_METRICS.arOverdue30)}
            icon={AlertCircle}
            iconAccent="bronze"
            tone="bad"
            deltaDirection={arDirection}
            deltaValue={`${arSign}${formatCurrency(Math.abs(arOverdueDelta))}`}
            contextLabel="vs. last month"
          />
          <KpiCard
            label="Pending Confirmations"
            value={DASHBOARD_METRICS.pendingConfirmations}
            icon={Package}
            iconAccent="orange"
            deltaDirection="neutral"
            deltaValue="0"
            contextLabel="this week"
          />
        </div>

        {/* === Section B: Charts Row (60/40) === */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "3fr 2fr",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <AreaChartCard
            title="Monthly Revenue"
            subtitle="Last 12 months"
            data={DASHBOARD_METRICS.monthlyRevenue.map((m) => ({ label: m.month, value: m.value }))}
            periods={["12M", "6M", "YTD"]}
            defaultPeriod="12M"
            formatValue={(n) => `$${(n / 1000).toFixed(0)}k`}
            height={240}
          />
          <DonutChartCard
            title="Sales by Manufacturer"
            data={DASHBOARD_METRICS.salesByManufacturer}
            centerValue="38%"
            centerLabel="ARE"
          />
        </div>

        {/* === Section C: Today's Schedule Preview === */}
        <Card padding={0} className="mb-32">
          <div
            className="flex items-center justify-between"
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--color-chalk)",
            }}
          >
            <h3
              className="text-carbon"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Today's Installs
            </h3>
            <Link
              href="/schedule"
              className="text-signal-orange inline-flex items-center"
              style={{ fontSize: "14px", fontWeight: 500, gap: "4px" }}
            >
              View Full Schedule
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <InstallColumn
              title="Suburban Toppers"
              installs={suburbanInstalls}
              borderRight
            />
            <InstallColumn
              title="Suburban Toppers - South"
              installs={southInstalls}
            />
          </div>
        </Card>

        {/* === Section D: 50/50 row === */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <DataTable
            columns={readyColumns}
            data={readyItems}
            getRowId={(it) => it.id}
            emptyTitle="No items ready for install"
            enablePagination={false}
          />
          <FunnelCard
            title="Lead Pipeline"
            subtitle={`${DASHBOARD_METRICS.pipelineCounts.new_lead + DASHBOARD_METRICS.pipelineCounts.ai_contacted + DASHBOARD_METRICS.pipelineCounts.responded + DASHBOARD_METRICS.pipelineCounts.appointment_set + DASHBOARD_METRICS.pipelineCounts.confirmed_sale} active leads`}
            stages={[
              { label: "New Lead", count: DASHBOARD_METRICS.pipelineCounts.new_lead, href: "/leads?stage=new_lead" },
              { label: "AI Contacted", count: DASHBOARD_METRICS.pipelineCounts.ai_contacted, href: "/leads?stage=ai_contacted" },
              { label: "Responded", count: DASHBOARD_METRICS.pipelineCounts.responded, href: "/leads?stage=responded" },
              { label: "Appointment Set", count: DASHBOARD_METRICS.pipelineCounts.appointment_set, href: "/leads?stage=appointment_set" },
              { label: "Confirmed Sale", count: DASHBOARD_METRICS.pipelineCounts.confirmed_sale, href: "/leads?stage=confirmed_sale" },
            ]}
          />
        </div>

        {/* === Section E: Morning Briefing (Phase 2c agent) === */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <MorningBriefingCard />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: dual-column install preview (one per location)
// ============================================================================

function InstallColumn({
  title,
  installs,
  borderRight,
}: {
  title: string;
  installs: typeof TODAY_INSTALLS;
  borderRight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderRight: borderRight ? "1px solid var(--color-chalk)" : undefined,
      }}
    >
      <h4
        className="text-carbon"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: "12px",
        }}
      >
        {title}
      </h4>

      {installs.length === 0 ? (
        <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
          No installs scheduled today.
        </div>
      ) : (
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
              <div
                className="text-carbon shrink-0"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "12px",
                  fontWeight: 600,
                  minWidth: "44px",
                }}
              >
                {inst.startTime}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-carbon truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {inst.clientName}
                </div>
                <div className="text-slate truncate" style={{ fontSize: "12px", lineHeight: 1.2 }}>
                  {inst.topperDescription}
                </div>
              </div>
              <div className="text-slate shrink-0" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                {inst.installer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
