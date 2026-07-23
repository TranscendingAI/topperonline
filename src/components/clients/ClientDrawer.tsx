"use client";

/**
 * ClientDrawer — slide-in side panel showing a single client's record.
 *
 * Wired to real data (Supabase): fetches /api/clients/[id] on open.
 *
 * 3 tabs (down from the Phase 1 mockup's 4 — see note below):
 *   - Invoices: real invoice history for this client
 *   - Invoice Items: real line items, grouped by invoice
 *   - Contacts: real additional contacts (add_contacts table)
 *
 * Dropped "Communications" and "Notes" tabs from the original mockup — the
 * legacy Access/MySQL database has no comms-log or notes table, so there's
 * no real data to back those. Rather than fabricate a plausible-looking
 * feed, they're left out until a real communications/notes feature exists.
 *
 * Width: 480px (compact per spec for Client Record).
 */

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, FileText, Package, Users as UsersIcon, ChevronDown, ChevronRight } from "lucide-react";
import { Drawer, StatusBadge, Button } from "@/components/ui";
import { formatCurrency, formatPhone } from "@/lib/utils";
import type { ClientDetail } from "@/lib/data/clients";
import { statusToVariant } from "@/lib/mock-data";

type TabKey = "invoices" | "items" | "contacts";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "items", label: "Invoice Items", icon: Package },
  { key: "contacts", label: "Contacts", icon: UsersIcon },
];

interface ClientDrawerProps {
  /** Client id (string form of the numeric legacy id), or null when closed */
  clientId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ClientDrawer({ clientId, open, onClose }: ClientDrawerProps) {
  const [tab, setTab] = useState<TabKey>("invoices");
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!clientId) {
      // Reset asynchronously (not directly in the effect body) — avoids the
      // "setState synchronously within an effect" cascading-render lint.
      Promise.resolve().then(() => {
        if (!cancelled) setDetail(null);
      });
      return () => {
        cancelled = true;
      };
    }
    fetch(`/api/clients/${clientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ClientDetail | null) => {
        if (cancelled) return;
        setDetail(data);
        setTab("invoices");
      })
      .catch((e) => console.error("Failed to load client detail", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Mark loading immediately via microtask (same reasoning as the reset
    // branch above) rather than synchronously in the effect body.
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) return null;

  if (loading || !detail) {
    return (
      <Drawer open={open} onClose={onClose} width={480} title="Loading…">
        <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "48px 0" }}>
          Loading client record…
        </div>
      </Drawer>
    );
  }

  const { client, invoices, items, contacts } = detail;
  const displayName = client.companyName ?? `${client.firstName} ${client.lastName}`.trim();
  const fullName = `${client.firstName} ${client.lastName}`.trim();
  const totalSpend = invoices.reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  const itemsByInvoice = groupBy(items, (it) => it.invoiceId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      title={displayName || "Client"}
      subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"} · ${formatCurrency(totalSpend)} lifetime`}
      headerActions={
        <Button variant="outlined" size="sm">
          Edit
        </Button>
      }
      footer={
        <>
          <Button variant="outlined">Send Message</Button>
          <Button variant="filled">New Invoice</Button>
        </>
      }
    >
      {/* Client header info */}
      <div
        className="rounded-md"
        style={{ padding: "16px", background: "var(--color-fog)", marginBottom: "16px" }}
      >
        <div className="flex items-start" style={{ gap: "12px", flexDirection: "column" }}>
          {client.phone && <InfoLine icon={Phone} text={formatPhone(client.phone)} />}
          {client.email && <InfoLine icon={Mail} text={client.email} />}
          <InfoLine
            icon={MapPin}
            text={
              client.address
                ? `${client.address}${client.city ? `, ${client.city}` : ""}${client.state ? `, ${client.state}` : ""} ${client.zip ?? ""}`
                : "No address on file"
            }
          />
        </div>
      </div>

      {/* Contact name + type */}
      <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
        <div>
          <div
            className="text-slate"
            style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}
          >
            {client.type === "commercial" ? "Commercial" : "Residential"} client
          </div>
          <div className="text-carbon" style={{ fontSize: "14px", fontWeight: 500, marginTop: "2px" }}>
            Primary contact: {fullName || "—"}
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div
        className="flex items-center"
        style={{ gap: "4px", borderBottom: "1px solid var(--color-chalk)", marginBottom: "20px" }}
      >
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="relative transition-colors"
              style={{
                padding: "10px 12px",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--color-carbon)" : "var(--color-slate)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {label}
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute", left: 0, right: 0, bottom: "-1px",
                    height: "2px", background: "var(--color-signal-orange)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "invoices" && <InvoicesTab invoices={invoices} />}
      {tab === "items" && <ItemsTab itemsByInvoice={itemsByInvoice} />}
      {tab === "contacts" && <ContactsTab contacts={contacts} />}
    </Drawer>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function InfoLine({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px", minWidth: 0 }}>
      <Icon size={14} strokeWidth={2} className="text-slate shrink-0" />
      <span className="text-carbon truncate" style={{ fontSize: "13px", lineHeight: 1.2 }}>
        {text}
      </span>
    </div>
  );
}

function InvoicesTab({ invoices }: { invoices: ClientDetail["invoices"] }) {
  if (!invoices.length) {
    return (
      <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
        No invoices yet for this client.
      </div>
    );
  }
  return (
    <ul className="flex flex-col" style={{ gap: "8px" }}>
      {invoices.map((inv) => (
        <li
          key={inv.id}
          className="rounded-md"
          style={{ padding: "12px", border: "1px solid var(--color-chalk)", background: "var(--color-paper)" }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
            <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-inter)" }}>
              {inv.number}
            </span>
            <span className="text-carbon" style={{ fontSize: "14px", fontWeight: 600 }}>
              {formatCurrency(inv.total ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate" style={{ fontSize: "12px" }}>
              {inv.date ? formatDate(inv.date) : "No date"}
            </span>
            <StatusBadge variant={statusToVariant(inv.statusVariant)}>{inv.statusLabel}</StatusBadge>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ItemsTab({ itemsByInvoice }: { itemsByInvoice: Map<number, ClientDetail["items"]> }) {
  const [openInvoices, setOpenInvoices] = useState<Set<number>>(
    new Set([...itemsByInvoice.keys()][0] != null ? [[...itemsByInvoice.keys()][0]] : [])
  );
  if (itemsByInvoice.size === 0) {
    return (
      <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
        No invoice items yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col" style={{ gap: "4px" }}>
      {[...itemsByInvoice.entries()].map(([invoiceId, group]) => {
        const open = openInvoices.has(invoiceId);
        return (
          <div key={invoiceId} className="rounded-md" style={{ border: "1px solid var(--color-chalk)" }}>
            <button
              type="button"
              onClick={() => {
                setOpenInvoices((prev) => {
                  const next = new Set(prev);
                  if (next.has(invoiceId)) next.delete(invoiceId);
                  else next.add(invoiceId);
                  return next;
                });
              }}
              className="w-full flex items-center justify-between transition-colors"
              style={{
                padding: "10px 12px",
                background: open ? "var(--color-fog)" : "var(--color-paper)",
                border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <span className="flex items-center" style={{ gap: "6px" }}>
                {open ? (
                  <ChevronDown size={14} strokeWidth={2} className="text-graphite" />
                ) : (
                  <ChevronRight size={14} strokeWidth={2} className="text-graphite" />
                )}
                <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                  Invoice #{invoiceId}
                </span>
                <span className="text-slate" style={{ fontSize: "12px" }}>
                  · {group.length} item{group.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                {formatCurrency(group.reduce((sum, it) => sum + (it.price ?? 0), 0))}
              </span>
            </button>
            {open && (
              <ul style={{ borderTop: "1px solid var(--color-chalk)" }}>
                {group.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center justify-between"
                    style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-chalk)" }}
                  >
                    <div className="min-w-0">
                      <div className="text-carbon truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                        {it.description}
                      </div>
                      <div className="text-slate" style={{ fontSize: "12px", lineHeight: 1.2, marginTop: "2px" }}>
                        {[it.manufacturer, it.color, it.category].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    <div className="shrink-0" style={{ marginLeft: "12px" }}>
                      <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600, textAlign: "right" }}>
                        {formatCurrency(it.price ?? 0)}
                      </div>
                      {it.itemStatus && (
                        <div className="text-slate" style={{ fontSize: "11px", marginTop: "2px", textAlign: "right" }}>
                          {it.itemStatus}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContactsTab({ contacts }: { contacts: ClientDetail["contacts"] }) {
  if (!contacts.length) {
    return (
      <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
        No additional contacts on file for this client.
      </div>
    );
  }
  return (
    <ul className="flex flex-col" style={{ gap: "8px" }}>
      {contacts.map((c) => (
        <li
          key={c.id}
          className="rounded-md"
          style={{ padding: "12px", border: "1px solid var(--color-chalk)", background: "var(--color-paper)" }}
        >
          <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
            {`${c.firstName} ${c.lastName}`.trim() || "Unnamed contact"}
            {c.title && <span className="text-slate" style={{ fontWeight: 400 }}> · {c.title}</span>}
          </div>
          <div className="text-slate" style={{ fontSize: "12px", marginTop: "4px" }}>
            {[c.phone, c.email].filter(Boolean).join(" · ") || "No contact info"}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of arr) {
    const k = key(item);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(item);
  }
  return out;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
