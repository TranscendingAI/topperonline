/**
 * Legacy `invoices.invoice_status` is an unlabeled integer column — the old
 * Access/MySQL system never shipped a lookup table for it. This mapping was
 * reverse-engineered by cross-referencing each status code against
 * `final_payment_date`, `deposit_confirmed`, and average amount paid vs.
 * total:
 *
 *   0 (18,246 rows) — almost never has a final payment, low avg total → "Open / Quote"
 *   1 ( 2,680 rows) — ~40% have a final payment, partial avg paid    → "In Progress"
 *   2 (   128 rows) — high deposit-confirmed rate, ~88% paid         → "Partial Payment"
 *   3 (    39 rows) — tiny bucket, avg paid > avg total (credits?)   → "Cancelled" (least confident mapping)
 *   4 (147,553 rows) — 99.9% have a final payment, highest avg total → "Paid / Complete"
 *
 * Status 4 and 0 are confident (they're the two big, clearly-opposite
 * buckets). 1/2/3 are small and inferred — treat those labels as
 * best-effort, not verified against real business definitions.
 */

import type { Status } from "@/lib/mock-data";

export function invoiceStatusMeta(code: number | null): { label: string; status: Status } {
  switch (code) {
    case 0:
      return { label: "Open / Quote", status: "pending" };
    case 1:
      return { label: "In Progress", status: "sent" };
    case 2:
      return { label: "Partial Payment", status: "partial" };
    case 3:
      return { label: "Cancelled", status: "cancelled" };
    case 4:
      return { label: "Paid / Complete", status: "paid" };
    default:
      return { label: "Unknown", status: "pending" };
  }
}
