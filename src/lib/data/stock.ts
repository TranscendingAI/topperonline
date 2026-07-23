/**
 * Real data-access layer for the Stock page — replaces STOCK_ORDERS,
 * TRADE_INS, and INVENTORY mock arrays.
 *
 * Honest mapping notes (the legacy dealer system doesn't model these
 * exactly like the Phase 1 mockup assumed):
 *   - "In House Orders" -> invoice_items with a manufacturer order status
 *     (Sent to Mfg / Confirmed by Mfg / Recvd with Conditions). The old
 *     system tracks ordering per invoice line, not as standalone POs.
 *   - "Trade-In" -> items.trade_in = 1 is real tracked data. There's no
 *     "condition" (Excellent/Good/Fair/Poor) field in the source data, so
 *     that column is dropped rather than invented.
 *   - "Inventory" -> items.amount_in_stock / restocking_level are real
 *     tracked fields. There's no per-location breakdown in the source data
 *     (one shared stock number dealer-wide), so the location column is
 *     dropped rather than invented.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface InHouseOrderRow {
  id: number;
  invoiceNumber: string;
  orderDate: string | null;
  deliveryDate: string | null;
  description: string;
  color: string | null;
  price: number | null;
  itemStatus: string;
  poNumber: string | null;
}

export async function listInHouseOrders(limit = 100): Promise<InHouseOrderRow[]> {
  const { data, error } = await supabaseAdmin.rpc("stock_in_house_orders", { p_limit: limit });
  if (error) {
    console.error("[data/stock] listInHouseOrders failed:", error.message);
    return [];
  }
  return (data ?? []).map((r: {
    id: number; invoice_number: string; order_date: string | null; delivery_date: string | null;
    description: string; color: string | null; price: number | null; item_status: string; po_number: string | null;
  }) => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    orderDate: r.order_date,
    deliveryDate: r.delivery_date,
    description: r.description,
    color: r.color,
    price: r.price,
    itemStatus: r.item_status,
    poNumber: r.po_number,
  }));
}

export interface TradeInRow {
  id: number;
  partNumber: string | null;
  description: string;
  color: string | null;
  retailPrice: number | null;
  cost: number | null;
  sold: boolean;
}

export async function listTradeIns(limit = 100): Promise<TradeInRow[]> {
  const { data, error } = await supabaseAdmin.rpc("stock_trade_ins", { p_limit: limit });
  if (error) {
    console.error("[data/stock] listTradeIns failed:", error.message);
    return [];
  }
  return (data ?? []).map((r: {
    id: number; part_number: string | null; description: string; color: string | null;
    retail_price: number | null; cost: number | null; sold: boolean | null;
  }) => ({
    id: r.id,
    partNumber: r.part_number,
    description: r.description,
    color: r.color,
    retailPrice: r.retail_price,
    cost: r.cost,
    sold: !!r.sold,
  }));
}

export interface InventoryRow {
  id: number;
  partNumber: string | null;
  description: string;
  manufacturer: string | null;
  amountInStock: number;
  restockingLevel: number | null;
}

export async function listInventory(limit = 300): Promise<InventoryRow[]> {
  const { data, error } = await supabaseAdmin.rpc("stock_inventory", { p_limit: limit });
  if (error) {
    console.error("[data/stock] listInventory failed:", error.message);
    return [];
  }
  return (data ?? []).map((r: {
    id: number; part_number: string | null; description: string; manufacturer: string | null;
    amount_in_stock: number; restocking_level: number | null;
  }) => ({
    id: r.id,
    partNumber: r.part_number,
    description: r.description,
    manufacturer: r.manufacturer,
    amountInStock: r.amount_in_stock,
    restockingLevel: r.restocking_level,
  }));
}
