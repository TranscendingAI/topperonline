/**
 * Stock — top-level page with 3 tabs.
 *
 * Per DESIGN.md Section 5 + Scope A:
 *   - In House Orders: 12 items (mock data, status badges, cost + ETA)
 *   - Trade-In: 6 used toppers (condition, asking price, days on lot)
 *   - Inventory: 10 items (qty, location, reorder level)
 *
 * Skipped for now (Scope B):
 *   - Edit stock item modal
 *   - Receive shipment flow (barcode scan)
 *   - Allocate to invoice flow
 *   - Real-time inventory sync
 */

"use client";

import { Suspense, useState, useMemo, type ReactNode } from "react";
import { Plus, Download, Package, ArrowDownToLine, Boxes, Search, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PageHeader,
  Button,
  DataTable,
  Tabs,
  type TabItem,
} from "@/components/ui";
import {
  textColumn,
  dateColumn,
  currencyColumn,
  statusBadgeColumn,
  statusVariantAdapter,
  statusLabelAdapter,
  defaultRowActions,
} from "@/lib/columns";
import {
  STOCK_ORDERS,
  TRADE_INS,
  INVENTORY,
  type StockOrder,
  type TradeIn,
  type InventoryItem,
} from "@/lib/mock-data";

const LOCATION_LABEL: Record<InventoryItem["location"], string> = {
  suburban: "Suburban Toppers",
  south: "Suburban Toppers - South",
  warehouse: "Warehouse",
};

const CONDITION_VARIANT: Record<TradeIn["condition"], "green" | "blue" | "amber" | "red"> = {
  Excellent: "green",
  Good: "blue",
  Fair: "amber",
  Poor: "red",
};

export default function StockPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers CRM" }, { label: "Stock" }]}
        title="Stock"
        actions={
          <>
            <Button variant="outlined" leadingIcon={<Download size={16} strokeWidth={2} />}>
              Export
            </Button>
            <Button variant="outlined" leadingIcon={<ArrowDownToLine size={16} strokeWidth={2} />}>
              Receive Shipment
            </Button>
            <Button variant="filled" leadingIcon={<Plus size={16} strokeWidth={2} />}>
              New Order
            </Button>
          </>
        }
      />

      <div style={{ padding: "0 32px 32px 32px" }}>
        <Suspense fallback={<TabFallback />}>
          <Tabs
            tabs={[
              {
                value: "in_house",
                label: "In House Orders",
                count: STOCK_ORDERS.length,
                content: <InHouseOrdersTab />,
              },
            {
              value: "trade_in",
              label: "Trade-In",
              count: TRADE_INS.length,
              content: <TradeInTab />,
            },
            {
              value: "inventory",
              label: "Inventory",
              count: INVENTORY.length,
              content: <InventoryTab />,
            },
          ]}
          />
        </Suspense>
      </div>
    </div>
  );
}

// ============================================================================
// In House Orders tab
// ============================================================================

function InHouseOrdersTab() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return STOCK_ORDERS;
    return STOCK_ORDERS.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.color.toLowerCase().includes(q)
    );
  }, [search]);

  const columns: ColumnDef<StockOrder>[] = useMemo(
    () => [
      textColumn<StockOrder>({ key: "orderNumber", header: "PO #" }),
      dateColumn<StockOrder>({ key: "orderDate", header: "Order Date" }),
      {
        id: "description",
        header: "Description",
        accessorKey: "description",
        cell: (info) => {
          const order = info.row.original;
          return (
            <div>
              <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                {order.description}
              </div>
              <span
                className="rounded-md text-graphite"
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  background: "var(--color-chalk)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginTop: "4px",
                }}
              >
                {order.color}
              </span>
            </div>
          );
        },
      },
      currencyColumn<StockOrder>({ key: "estimatedCost", header: "Est. Cost" }),
      dateColumn<StockOrder>({ key: "expectedDate", header: "ETA" }),
      statusBadgeColumn<StockOrder>({
        header: "Status",
        accessor: (o) => o.status,
        getVariant: statusVariantAdapter,
        getLabel: statusLabelAdapter,
      }),
      defaultRowActions<StockOrder>(),
    ],
    []
  );

  return (
    <StockTableShell
      title={`In House Orders (${STOCK_ORDERS.length})`}
      icon={<Package size={16} strokeWidth={2} />}
      search={search}
      onSearchChange={setSearch}
      filteredCount={filtered.length}
      totalCount={STOCK_ORDERS.length}
    >
      <DataTable<StockOrder>
        data={filtered}
        columns={columns}
        emptyTitle="No stock orders"
        emptyDescription="Stock orders placed with manufacturers will appear here."
      />
    </StockTableShell>
  );
}

// ============================================================================
// Trade-In tab
// ============================================================================

function TradeInTab() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return TRADE_INS;
    return TRADE_INS.filter(
      (t) =>
        t.stockNumber.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.color.toLowerCase().includes(q) ||
        t.condition.toLowerCase().includes(q)
    );
  }, [search]);

  const columns: ColumnDef<TradeIn>[] = useMemo(
    () => [
      textColumn<TradeIn>({ key: "stockNumber", header: "Stock #" }),
      dateColumn<TradeIn>({ key: "dateAdded", header: "Date Added" }),
      {
        id: "description",
        header: "Description",
        accessorKey: "description",
        cell: (info) => {
          const t = info.row.original;
          return (
            <div>
              <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                {t.description}
              </div>
              <span
                className="rounded-md text-graphite"
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  background: "var(--color-chalk)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginTop: "4px",
                }}
              >
                {t.color}
              </span>
            </div>
          );
        },
      },
      {
        id: "condition",
        header: "Condition",
        accessorKey: "condition",
        enableSorting: true,
        cell: (info) => {
          const condition = info.getValue() as TradeIn["condition"];
          const variant = CONDITION_VARIANT[condition];
          return (
            <div
              className="rounded-full"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 500,
                padding: "3px 10px",
                background: `color-mix(in srgb, var(--color-status-${variant}) 12%, transparent)`,
                color: `var(--color-status-${variant})`,
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  background: `var(--color-status-${variant})`,
                }}
              />
              {condition}
            </div>
          );
        },
      },
      currencyColumn<TradeIn>({ key: "askingPrice", header: "Asking Price" }),
      defaultRowActions<TradeIn>(),
    ],
    []
  );

  return (
    <StockTableShell
      title={`Trade-In (${TRADE_INS.length})`}
      icon={<ArrowDownToLine size={16} strokeWidth={2} />}
      search={search}
      onSearchChange={setSearch}
      filteredCount={filtered.length}
      totalCount={TRADE_INS.length}
    >
      <DataTable<TradeIn>
        data={filtered}
        columns={columns}
        emptyTitle="No trade-ins"
        emptyDescription="Customer trade-in vehicles will appear here."
      />
    </StockTableShell>
  );
}

// ============================================================================
// Inventory tab
// ============================================================================

function InventoryTab() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return INVENTORY;
    return INVENTORY.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.item.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }, [search]);

  const columns: ColumnDef<InventoryItem>[] = useMemo(
    () => [
      textColumn<InventoryItem>({ key: "id", header: "Item #" }),
      {
        id: "item",
        header: "Item",
        accessorKey: "item",
        cell: (info) => {
          const item = info.row.original;
          return (
            <div>
              <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                {item.item}
              </div>
              <div className="text-slate" style={{ fontSize: "11px", lineHeight: 1.3, marginTop: "2px" }}>
                {item.description}
              </div>
            </div>
          );
        },
      },
      {
        id: "location",
        header: "Location",
        accessorKey: "location",
        cell: (info) => {
          const loc = info.getValue() as InventoryItem["location"];
          return (
            <span
              className="rounded-md text-graphite"
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 500,
                padding: "3px 10px",
                background: "var(--color-fog)",
                whiteSpace: "nowrap",
              }}
            >
              {LOCATION_LABEL[loc]}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        id: "qtyInStock",
        header: "On Hand",
        accessorKey: "qtyInStock",
        cell: (info) => {
          const item = info.row.original;
          const qty = info.getValue() as number;
          const low = qty <= item.reorderLevel;
          return (
            <span
              className={low ? "text-status-red" : "text-carbon"}
              style={{
                fontSize: "13px",
                fontWeight: low ? 600 : 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {qty}
            </span>
          );
        },
        enableSorting: true,
        meta: { align: "right" },
      },
      {
        id: "reorderLevel",
        header: "Reorder At",
        accessorKey: "reorderLevel",
        cell: (info) => (
          <span
            className="text-slate"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {info.getValue() as number}
          </span>
        ),
        enableSorting: true,
        meta: { align: "right" },
      },
      defaultRowActions<InventoryItem>(),
    ],
    []
  );

  // Items at or below their reorder level — surfaced as a banner above the table
  const lowStockCount = INVENTORY.filter((i) => i.qtyInStock <= i.reorderLevel).length;

  return (
    <StockTableShell
      title={`Inventory (${INVENTORY.length})`}
      icon={<Boxes size={16} strokeWidth={2} />}
      search={search}
      onSearchChange={setSearch}
      filteredCount={filtered.length}
      totalCount={INVENTORY.length}
      rightSlot={
        lowStockCount > 0 ? (
          <div
            className="rounded-md"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "color-mix(in srgb, var(--color-status-red) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-status-red) 30%, transparent)",
              color: "var(--color-status-red)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span
              className="rounded-full"
              style={{ width: "6px", height: "6px", background: "var(--color-status-red)" }}
            />
            {lowStockCount} item{lowStockCount === 1 ? "" : "s"} at or below reorder level
          </div>
        ) : null
      }
    >
      <DataTable<InventoryItem>
        data={filtered}
        columns={columns}
        emptyTitle="No inventory items"
        emptyDescription="Stock items will appear here once added to inventory."
      />
    </StockTableShell>
  );
}

// ============================================================================
// StockTableShell — shared card wrapper for the 3 stock tabs
// ============================================================================

/** Skeleton shown while the Tabs component reads URL search params during SSR. */
function TabFallback() {
  return (
    <div
      className="rounded-md"
      style={{
        height: "56px",
        background: "var(--color-paper)",
        border: "1px solid var(--color-chalk)",
        boxShadow: "var(--shadow-card)",
      }}
      aria-label="Loading…"
    />
  );
}

function StockTableShell({
  title,
  icon,
  search,
  onSearchChange,
  filteredCount,
  totalCount,
  rightSlot,
  children,
}: {
  title: string;
  icon: ReactNode;
  search: string;
  onSearchChange: (v: string) => void;
  filteredCount: number;
  totalCount: number;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="bg-paper rounded-md"
      style={{ boxShadow: "var(--shadow-card)", overflow: "hidden" }}
    >
      {/* Header row: title + (optional right slot) + search */}
      <div
        className="flex items-center"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--color-chalk)",
          gap: "16px",
        }}
      >
        <div className="flex items-center text-carbon shrink-0" style={{ gap: "8px" }}>
          <span className="text-graphite">{icon}</span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          {filteredCount !== totalCount && (
            <span className="text-slate" style={{ fontSize: "12px", fontWeight: 500 }}>
              ({filteredCount} of {totalCount})
            </span>
          )}
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        <div className="flex-1" />
        <div className="relative">
          <Search
            size={14}
            strokeWidth={2}
            className="text-slate"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-md"
            style={{
              height: "32px",
              width: "240px",
              paddingLeft: "32px",
              paddingRight: search ? "32px" : "12px",
              border: "1px solid var(--color-chalk)",
              fontSize: "13px",
              color: "var(--color-carbon)",
              outline: "none",
              background: "var(--color-paper)",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-slate)",
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
