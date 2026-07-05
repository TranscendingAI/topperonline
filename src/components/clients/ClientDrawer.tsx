"use client";

/**
 * ClientDrawer — slide-in side panel showing a single client's record.
 *
 * 4 tabs (per DESIGN.md Section 3):
 *   - Invoices: list of past + open invoices
 *   - Invoice Items: line items, grouped by invoice (collapsible)
 *   - Communications: SMS/email/call timeline
 *   - Notes: free-form notes log
 *
 * Width: 480px (compact per spec for Client Record).
 */

import { useState } from "react";
import { Phone, Mail, MapPin, FileText, Package, MessageSquare, StickyNote, ChevronDown, ChevronRight, Plus } from "lucide-react";
import {
  Drawer,
  StatusBadge,
  Button,
  type StatusVariant,
} from "@/components/ui";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  getInvoicesForClient,
  getInvoiceItemsForClient,
  getCommunicationsForClient,
  getNotesForClient,
  type Client,
  type Invoice,
  type InvoiceItem,
  type Communication,
  type Note,
  statusToVariant,
  statusLabel,
  itemStatusToVariant,
  itemStatusLabel,
} from "@/lib/mock-data";

type TabKey = "invoices" | "items" | "comms" | "notes";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "items", label: "Invoice Items", icon: Package },
  { key: "comms", label: "Communications", icon: MessageSquare },
  { key: "notes", label: "Notes", icon: StickyNote },
];

interface ClientDrawerProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}

export function ClientDrawer({ client, open, onClose }: ClientDrawerProps) {
  const [tab, setTab] = useState<TabKey>("invoices");

  if (!client) return null;

  const displayName = client.companyName ?? `${client.firstName} ${client.lastName}`;
  const fullName = `${client.firstName} ${client.lastName}`;
  const totalSpend = client.totalSpend ?? 0;
  const invoices = getInvoicesForClient(client.id);
  const items = getInvoiceItemsForClient(client.id);
  const comms = getCommunicationsForClient(client.id);
  const notes = getNotesForClient(client.id);

  // Group invoice items by invoice
  const itemsByInvoice = groupBy(items, (it) => it.invoiceId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      title={displayName}
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
        style={{
          padding: "16px",
          background: "var(--color-fog)",
          marginBottom: "16px",
        }}
      >
        <div className="flex items-start" style={{ gap: "12px", flexDirection: "column" }}>
          <InfoLine icon={Phone} text={formatPhone(client.phone)} />
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
            Primary contact: {fullName}
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div
        className="flex items-center"
        style={{
          gap: "4px",
          borderBottom: "1px solid var(--color-chalk)",
          marginBottom: "20px",
        }}
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
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: "-1px",
                    height: "2px",
                    background: "var(--color-signal-orange)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "invoices" && <InvoicesTab invoices={invoices} />}
      {tab === "items" && <ItemsTab items={items} itemsByInvoice={itemsByInvoice} />}
      {tab === "comms" && <CommsTab comms={comms} />}
      {tab === "notes" && <NotesTab notes={notes} />}
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

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
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
          style={{
            padding: "12px",
            border: "1px solid var(--color-chalk)",
            background: "var(--color-paper)",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
            <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-inter)" }}>
              {inv.number}
            </span>
            <span className="text-carbon" style={{ fontSize: "14px", fontWeight: 600 }}>
              {formatCurrency(inv.total)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate" style={{ fontSize: "12px" }}>
              {formatDate(inv.date)}
            </span>
            <StatusBadge variant={statusToVariant(inv.status)}>
              {statusLabel(inv.status)}
            </StatusBadge>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ItemsTab({
  items,
  itemsByInvoice,
}: {
  items: InvoiceItem[];
  itemsByInvoice: Map<string, InvoiceItem[]>;
}) {
  // Hook must precede any early return (rules of hooks)
  const [openInvoices, setOpenInvoices] = useState<Set<string>>(
    new Set([...itemsByInvoice.keys()][0] ?? "")
  );
  if (!items.length) {
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
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span className="flex items-center" style={{ gap: "6px" }}>
                {open ? (
                  <ChevronDown size={14} strokeWidth={2} className="text-graphite" />
                ) : (
                  <ChevronRight size={14} strokeWidth={2} className="text-graphite" />
                )}
                <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {invoiceId}
                </span>
                <span className="text-slate" style={{ fontSize: "12px" }}>
                  · {group.length} item{group.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                {formatCurrency(group.reduce((sum, it) => sum + it.price, 0))}
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
                        {it.manufacturer} {it.model} · {it.color} · {it.type}
                      </div>
                    </div>
                    <div className="shrink-0" style={{ marginLeft: "12px" }}>
                      <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600, textAlign: "right" }}>
                        {formatCurrency(it.price)}
                      </div>
                      <div style={{ marginTop: "2px" }}>
                        <StatusBadge variant={itemStatusToVariant(it.status)}>
                          {itemStatusLabel(it.status)}
                        </StatusBadge>
                      </div>
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

function CommsTab({ comms }: { comms: Communication[] }) {
  if (!comms.length) {
    return (
      <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
        No communications logged yet.
      </div>
    );
  }
  return (
    <ol className="flex flex-col" style={{ gap: "16px", position: "relative" }}>
      {/* Vertical timeline line */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "7px",
          top: "8px",
          bottom: "8px",
          width: "1px",
          background: "var(--color-chalk)",
        }}
      />
      {comms.map((c) => {
        const isInbound = c.direction === "inbound";
        return (
          <li key={c.id} className="flex" style={{ gap: "12px", position: "relative" }}>
            <span
              aria-hidden="true"
              style={{
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                background: isInbound ? "var(--color-paper)" : "var(--color-signal-orange)",
                border: isInbound ? "1px solid var(--color-graphite)" : "1px solid var(--color-signal-orange)",
                flexShrink: 0,
                marginTop: "3px",
                zIndex: 1,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                <span className="text-carbon" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {c.channel}
                </span>
                <span className="text-slate" style={{ fontSize: "12px" }}>
                  {isInbound ? "from " + c.from : "to " + c.to} · {formatDateTime(c.timestamp)}
                </span>
              </div>
              <div
                className="rounded-md text-carbon"
                style={{
                  padding: "10px 12px",
                  background: "var(--color-fog)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {c.body}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function NotesTab({ notes }: { notes: Note[] }) {
  return (
    <div className="flex flex-col" style={{ gap: "12px" }}>
      <button
        type="button"
        className="rounded-md w-full flex items-center justify-center text-graphite transition-colors"
        style={{
          height: "40px",
          background: "var(--color-fog)",
          border: "1px dashed var(--color-chalk)",
          fontSize: "13px",
          fontWeight: 500,
          gap: "6px",
          cursor: "pointer",
        }}
      >
        <Plus size={14} strokeWidth={2} />
        Add a note
      </button>
      {notes.length === 0 ? (
        <div className="text-slate" style={{ fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
          No notes yet for this client.
        </div>
      ) : (
        <ul className="flex flex-col" style={{ gap: "8px" }}>
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-md"
              style={{
                padding: "12px",
                background: "var(--color-paper)",
                border: "1px solid var(--color-chalk)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {n.author}
                </span>
                <span className="text-slate" style={{ fontSize: "12px" }}>
                  {formatDateTime(n.createdAt)}
                </span>
              </div>
              <p className="text-carbon" style={{ fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {n.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
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
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Silence unused-import warning for type-only re-imports
export type { StatusVariant };
