/**
 * Real data-access layer for Clients — replaces the CLIENTS mock array.
 * Talks to Postgres via the `list_clients` / `get_client_detail` RPC
 * functions (see supabase migration `app_read_functions_for_topperonline_*`),
 * which do the heavy aggregation (last invoice, lifetime spend, invoice
 * items, contacts) in the database instead of shipping ~98k rows to Node.
 *
 * Server-only: imports supabaseAdmin (service_role key).
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { invoiceStatusMeta } from "./invoice-status";
import type { ClientType } from "@/lib/mock-data";

export interface ClientListRow {
  id: string;
  companyName: string | null;
  firstName: string;
  lastName: string;
  type: ClientType;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  lastInvoiceNumber: string | null;
  lastInvoiceDate: string | null;
  lastInvoiceAmount: number | null;
  lastInvoiceStatusLabel: string;
  lastInvoiceStatusVariant: ReturnType<typeof invoiceStatusMeta>["status"];
  totalInvoices: number;
  totalSpend: number;
}

export interface ClientListResult {
  clients: ClientListRow[];
  totalMatching: number;
}

function clientTypeOf(raw: string | null): ClientType {
  return (raw ?? "").toLowerCase().startsWith("company") ? "commercial" : "residential";
}

function clean(v: string | null | undefined): string {
  return (v ?? "").trim();
}

interface ListClientsRpcRow {
  id: number;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  client_type: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  last_invoice_number: string | null;
  last_invoice_date: string | null;
  last_invoice_amount: number | null;
  last_invoice_status: number | null;
  total_invoices: number;
  total_spend: number;
  total_matching: number;
}

export async function listClients(opts: {
  search?: string;
  type?: "commercial" | "residential" | "all";
  limit?: number;
  offset?: number;
} = {}): Promise<ClientListResult> {
  const { search, type = "all", limit = 200, offset = 0 } = opts;

  const { data, error } = await supabaseAdmin.rpc("list_clients", {
    p_search: search?.trim() || null,
    p_type: type === "all" ? null : type,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("[data/clients] listClients failed:", error.message);
    return { clients: [], totalMatching: 0 };
  }

  const rows = (data ?? []) as ListClientsRpcRow[];
  const clients: ClientListRow[] = rows.map((r) => {
    const statusMeta = invoiceStatusMeta(r.last_invoice_status);
    return {
      id: String(r.id),
      companyName: r.company_name,
      firstName: clean(r.first_name),
      lastName: clean(r.last_name),
      type: clientTypeOf(r.client_type),
      phone: clean(r.phone),
      email: clean(r.email),
      address: clean(r.address),
      city: clean(r.city),
      state: clean(r.state),
      zip: clean(r.zip),
      notes: clean(r.notes),
      lastInvoiceNumber: r.last_invoice_number,
      lastInvoiceDate: r.last_invoice_date,
      lastInvoiceAmount: r.last_invoice_amount,
      lastInvoiceStatusLabel: statusMeta.label,
      lastInvoiceStatusVariant: statusMeta.status,
      totalInvoices: Number(r.total_invoices ?? 0),
      totalSpend: Number(r.total_spend ?? 0),
    };
  });

  return { clients, totalMatching: rows[0]?.total_matching ?? 0 };
}

// ---------------------------------------------------------------------------
// Client detail (for the ClientDrawer) — fetched on demand via /api/clients/[id]
// ---------------------------------------------------------------------------

export interface ClientDetailInvoice {
  id: number;
  number: string;
  date: string | null;
  total: number | null;
  amountPaid: number;
  statusLabel: string;
  statusVariant: ReturnType<typeof invoiceStatusMeta>["status"];
}

export interface ClientDetailItem {
  id: number;
  invoiceId: number;
  description: string;
  color: string | null;
  price: number | null;
  manufacturer: string | null;
  category: string | null;
  itemStatus: string | null;
}

export interface ClientDetailContact {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  title: string | null;
}

export interface ClientDetail {
  client: {
    id: string;
    companyName: string | null;
    firstName: string;
    lastName: string;
    type: ClientType;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
    terms: string | null;
  };
  invoices: ClientDetailInvoice[];
  items: ClientDetailItem[];
  contacts: ClientDetailContact[];
}

interface ClientDetailRpcResult {
  client: {
    id: number;
    company_name: string | null;
    first_name: string | null;
    last_name: string | null;
    client_type: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    notes: string | null;
    terms: string | null;
  } | null;
  invoices: Array<{
    id: number;
    number: string;
    invoice_date: string | null;
    total_invoice: number | null;
    invoice_status: number | null;
    amount_paid: number;
  }>;
  items: Array<{
    id: number;
    invoice_id: number;
    description: string;
    color: string | null;
    price: number | null;
    item_status: string | null;
    manufacturer: string | null;
    category: string | null;
  }>;
  contacts: Array<{
    id: number;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    title: string | null;
  }>;
}

export async function getClientDetail(id: number): Promise<ClientDetail | null> {
  const { data, error } = await supabaseAdmin.rpc("get_client_detail", { p_client_id: id });

  if (error) {
    console.error("[data/clients] getClientDetail failed:", error.message);
    return null;
  }

  const result = data as ClientDetailRpcResult | null;
  if (!result?.client) return null;

  const c = result.client;
  return {
    client: {
      id: String(c.id),
      companyName: c.company_name,
      firstName: clean(c.first_name),
      lastName: clean(c.last_name),
      type: clientTypeOf(c.client_type),
      phone: clean(c.phone),
      email: clean(c.email),
      address: clean(c.address),
      city: clean(c.city),
      state: clean(c.state),
      zip: clean(c.zip),
      notes: clean(c.notes),
      terms: c.terms,
    },
    invoices: (result.invoices ?? []).map((i) => {
      const meta = invoiceStatusMeta(i.invoice_status);
      return {
        id: i.id,
        number: i.number,
        date: i.invoice_date,
        total: i.total_invoice,
        amountPaid: Number(i.amount_paid ?? 0),
        statusLabel: meta.label,
        statusVariant: meta.status,
      };
    }),
    items: (result.items ?? []).map((it) => ({
      id: it.id,
      invoiceId: it.invoice_id,
      description: it.description,
      color: it.color,
      price: it.price,
      manufacturer: it.manufacturer,
      category: it.category,
      itemStatus: it.item_status,
    })),
    contacts: (result.contacts ?? []).map((ct) => ({
      id: ct.id,
      firstName: clean(ct.first_name),
      lastName: clean(ct.last_name),
      phone: ct.phone,
      email: ct.email,
      title: ct.title,
    })),
  };
}
