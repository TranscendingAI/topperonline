/**
 * Real data-access layer for the Dashboard — replaces DASHBOARD_METRICS,
 * TODAY_INSTALLS, INVOICE_ITEMS, CLIENTS, and the getSalesBy* mock helpers.
 *
 * IMPORTANT — read before changing anything below:
 * `invoices` is live/current data (through ~Jul 2026), but `appointments`
 * (the install schedule) hasn't been used since 2014 — this dealer clearly
 * moved scheduling to something outside this database years ago. So there
 * is no real "today's installs." `dashboard_summary()` returns the most
 * recent day that actually has appointment rows (`recentInstallDate`) and
 * that day's installs, which this file surfaces honestly as "most recent
 * scheduled day in the legacy data," not "today." Once the roadmap's Google
 * Calendar sync (Phase 2a) lands, that becomes the real schedule source.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface DashboardInstall {
  id: number;
  apptDate: string;
  apptTime: string;
  status: string | null;
  completed: boolean;
  locationName: string | null;
  clientName: string;
}

export interface DashboardReadyItem {
  id: number;
  invoiceNumber: string;
  clientName: string;
  description: string;
  price: number | null;
}

export interface SalesBreakdownRow {
  key: string;
  count: number;
  revenue: number;
}

export interface DashboardData {
  dataMaxDate: string | null;
  recentInstallDate: string | null;
  installs: DashboardInstall[];
  openInvoiceCount: number;
  openInvoiceBalance: number;
  monthlyRevenue: Array<{ month: string; value: number }>;
  salesByManufacturer: SalesBreakdownRow[];
  salesByTruckBrand: SalesBreakdownRow[];
  salesByTruckModel: SalesBreakdownRow[];
  readyForInstall: DashboardReadyItem[];
}

interface RpcResult {
  dataMaxDate: string | null;
  recentInstallDate: string | null;
  installs: Array<{
    id: number; appt_date: string; appt_time: string; status: string | null;
    completed: number; location_name: string | null; client_name: string;
  }>;
  openInvoiceCount: number;
  openInvoiceBalance: number;
  monthlyRevenue: Array<{ month: string; value: number }>;
  salesByManufacturer: Array<{ name: string; units: number; revenue: number }>;
  salesByTruckBrand: Array<{ brand: string; units: number; revenue: number }>;
  salesByTruckModel: Array<{ model: string; units: number; revenue: number }>;
  readyForInstall: Array<{ id: number; invoice_number: string; client_name: string; description: string; price: number | null }>;
}

const EMPTY: DashboardData = {
  dataMaxDate: null,
  recentInstallDate: null,
  installs: [],
  openInvoiceCount: 0,
  openInvoiceBalance: 0,
  monthlyRevenue: [],
  salesByManufacturer: [],
  salesByTruckBrand: [],
  salesByTruckModel: [],
  readyForInstall: [],
};

export async function getDashboardData(): Promise<DashboardData> {
  const { data, error } = await supabaseAdmin.rpc("dashboard_summary");
  if (error) {
    console.error("[data/dashboard] getDashboardData failed:", error.message);
    return EMPTY;
  }

  const r = data as RpcResult;

  return {
    dataMaxDate: r.dataMaxDate,
    recentInstallDate: r.recentInstallDate,
    installs: (r.installs ?? []).map((i) => ({
      id: i.id,
      apptDate: i.appt_date,
      apptTime: i.appt_time,
      status: i.status,
      completed: i.completed === 1,
      locationName: i.location_name,
      clientName: i.client_name?.trim() || "Unknown",
    })),
    openInvoiceCount: Number(r.openInvoiceCount ?? 0),
    openInvoiceBalance: Number(r.openInvoiceBalance ?? 0),
    monthlyRevenue: r.monthlyRevenue ?? [],
    salesByManufacturer: (r.salesByManufacturer ?? []).map((m) => ({
      key: m.name, count: Number(m.units), revenue: Number(m.revenue),
    })),
    salesByTruckBrand: (r.salesByTruckBrand ?? []).map((b) => ({
      key: b.brand, count: Number(b.units), revenue: Number(b.revenue),
    })),
    salesByTruckModel: (r.salesByTruckModel ?? []).map((m) => ({
      key: m.model, count: Number(m.units), revenue: Number(m.revenue),
    })),
    readyForInstall: (r.readyForInstall ?? []).map((it) => ({
      id: it.id,
      invoiceNumber: it.invoice_number,
      clientName: it.client_name?.trim() || "Unknown",
      description: it.description,
      price: it.price,
    })),
  };
}
