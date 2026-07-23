"use client";

/**
 * Thin client wrapper around DataTable for the dashboard's "Ready for
 * Install" table. Same reason as RevenueChart.tsx — DataTable's `columns`
 * and `getRowId` props are functions, which can't cross the Server ->
 * Client Component boundary, so this wrapper builds them locally from
 * plain data passed down by the (server) dashboard page.
 */

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui";
import { textColumn, currencyColumn } from "@/lib/columns";
import type { DashboardReadyItem } from "@/lib/data/dashboard";

export function ReadyForInstallTable({ items }: { items: DashboardReadyItem[] }) {
  const columns: ColumnDef<DashboardReadyItem>[] = [
    textColumn({
      header: "Invoice",
      sortKey: (it) => it.invoiceNumber,
      render: (it) => (
        <span style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "var(--color-slate)" }}>
          {it.invoiceNumber}
        </span>
      ),
    }),
    textColumn({
      header: "Client",
      sortKey: (it) => it.clientName,
      render: (it) => <span style={{ fontWeight: 500 }}>{it.clientName}</span>,
    }),
    textColumn({ header: "Description", render: (it) => it.description }),
    currencyColumn({ key: "price", header: "Price" }),
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(it) => String(it.id)}
      emptyTitle="No items ready for install"
      enablePagination={false}
    />
  );
}
