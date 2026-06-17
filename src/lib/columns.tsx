/**
 * Reusable column definitions for TanStack Table v8.
 *
 * Each factory returns a ColumnDef that handles:
 *   - The right header styling (Inter 13px weight 500 Slate, uppercase, letter-spacing 0.04em)
 *   - Cell rendering for the given data type
 *   - Sort accessor
 *   - Right-align for numbers/currency
 *
 * Use these as building blocks for DataTable pages:
 *
 *   const columns: ColumnDef<Client>[] = [
 *     textColumn({ key: "companyName", header: "Company Name" }),
 *     textColumn({ key: "phone", header: "Phone", render: (c) => formatPhone(c.phone) }),
 *     currencyColumn({ key: "lastInvoiceAmount", header: "Last Invoice" }),
 *     statusBadgeColumn({ header: "Status", accessor: (c) => c.lastInvoiceStatus }),
 *     actionsColumn<Client>([
 *       { icon: Eye, label: "View", onClick: (c) => router.push(`/clients/${c.id}`) },
 *     ]),
 *   ];
 */

import type { ColumnDef, Row, RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GhostIconButton } from "@/components/ui/GhostIconButton";
import { statusToVariant as _statusToVariant, statusLabel as _statusLabel, type Status } from "./mock-data";
import type { StatusVariant } from "@/components/ui/StatusBadge";
import { formatCurrency, formatPhone } from "./utils";
// statusToVariant / statusLabel are imported by callers and passed to
// statusBadgeColumn. They are NOT used directly in this file anymore.
// The unused alias prevents accidental removal of the import.
void _statusToVariant;
void _statusLabel;

declare module "@tanstack/react-table" {
  // Allow `meta` to be passed to columns for custom config
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right" | "center";
    mono?: boolean; // monospace-style text
    /** If true, hide this column on smaller screens */
    hideOnMobile?: boolean;
  }
}

interface TextColumnOpts<T> {
  key?: keyof T & string;
  header: string;
  /** Custom cell renderer. If omitted, uses key as accessor. */
  render?: (row: T) => React.ReactNode;
  /** Custom sort accessor — defaults to using key */
  sortKey?: (row: T) => string | number;
  /** Custom CSS class for the cell */
  className?: string;
}

export function textColumn<T>(opts: TextColumnOpts<T>): ColumnDef<T> {
  return {
    id: opts.key,
    accessorKey: opts.key as string,
    header: opts.header,
    cell: ({ row }) => {
      const value = opts.render ? opts.render(row.original) : (row.original as Record<string, unknown>)[opts.key as string];
      return <span className={opts.className}>{value as React.ReactNode}</span>;
    },
    sortingFn: opts.sortKey
      ? (a, b) => {
          const av = opts.sortKey!(a.original);
          const bv = opts.sortKey!(b.original);
          return av < bv ? -1 : av > bv ? 1 : 0;
        }
      : "alphanumeric",
  };
}

interface NumberColumnOpts<T> {
  key: keyof T & string;
  header: string;
  /** Optional formatter (e.g. add currency symbol) */
  format?: (n: number) => string;
  className?: string;
}

export function numberColumn<T>(opts: NumberColumnOpts<T>): ColumnDef<T> {
  return {
    accessorKey: opts.key,
    header: opts.header,
    cell: ({ row }) => {
      const v = row.original[opts.key] as number;
      const formatted = opts.format ? opts.format(v) : v.toLocaleString();
      return <span className={opts.className}>{formatted}</span>;
    },
    meta: { align: "right", mono: true },
  };
}

export function currencyColumn<T>(opts: { key: keyof T & string; header: string; className?: string }): ColumnDef<T> {
  return numberColumn({ ...opts, format: formatCurrency });
}

interface DateColumnOpts<T> {
  key: keyof T & string;
  header: string;
  format?: (iso: string) => string;
}

const DEFAULT_DATE_FMT = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export function dateColumn<T>(opts: DateColumnOpts<T>): ColumnDef<T> {
  return {
    accessorKey: opts.key,
    header: opts.header,
    cell: ({ row }) => {
      const v = row.original[opts.key] as string;
      if (!v) return null;
      return opts.format ? opts.format(v) : DEFAULT_DATE_FMT(v);
    },
  };
}

interface StatusColumnOpts<T> {
  header: string;
  /** Accessor returning the raw status value */
  accessor: (row: T) => string;
  /** Maps the raw status to a StatusVariant (green/amber/red/blue/purple) */
  getVariant: (status: string) => StatusVariant;
  /** Maps the raw status to a display label */
  getLabel: (status: string) => string;
}

export function statusBadgeColumn<T>(opts: StatusColumnOpts<T>): ColumnDef<T> {
  return {
    id: "status",
    header: opts.header,
    cell: ({ row }) => {
      const status = opts.accessor(row.original);
      return <StatusBadge variant={opts.getVariant(status)}>{opts.getLabel(status)}</StatusBadge>;
    },
    sortingFn: (a, b) => {
      const sa = opts.accessor(a.original);
      const sb = opts.accessor(b.original);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    },
  };
}

// ============================================================================
// Adapter helpers — for callers using the strict Status type
// ============================================================================
// The `statusToVariant` and `statusLabel` functions in mock-data accept
// a strict `Status` union, but this column helper accepts `string` (because
// different data sources may use different status vocabularies). These
// adapters cast the strict type into the wider string-accepting shape.

/** Wrap a strict (s: Status) => X function to accept (s: string) => X */
function widen<T extends string, R>(fn: (s: T) => R): (s: string) => R {
  return (s: string) => fn(s as T);
}

/** Use with statusToVariant from mock-data */
export const statusVariantAdapter = widen<Status, StatusVariant>(_statusToVariant);
/** Use with statusLabel from mock-data */
export const statusLabelAdapter = widen<Status, string>(_statusLabel);

interface ActionsColumnAction<T> {
  icon: LucideIcon;
  label: string;
  onClick?: (row: T) => void;
  /** If provided, render as a link instead of a button */
  href?: (row: T) => string;
  /** Color override (defaults to Graphite) */
  color?: string;
}

export function actionsColumn<T>(actions: ActionsColumnAction<T>[]): ColumnDef<T> {
  return {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div
        className="flex items-center justify-end"
        style={{ gap: "4px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((a, i) => (
          <GhostIconButton
            key={i}
            size="sm"
            aria-label={a.label}
            onClick={() => a.onClick?.(row.original)}
            style={a.color ? { color: a.color } : undefined}
          >
            <a.icon size={16} strokeWidth={2} />
          </GhostIconButton>
        ))}
      </div>
    ),
    meta: { align: "right" },
  };
}

/** Standard view/edit/delete action set, used on most list pages. */
export function defaultRowActions<T>(opts?: {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  viewHref?: (row: T) => string;
}): ColumnDef<T> {
  return actionsColumn<T>([
    { icon: Eye, label: "View", onClick: opts?.onView, href: opts?.viewHref },
    { icon: Pencil, label: "Edit", onClick: opts?.onEdit },
    { icon: Trash2, label: "Delete", onClick: opts?.onDelete, color: "var(--color-status-red)" },
  ]);
}

export { formatPhone };
export type { Row };
