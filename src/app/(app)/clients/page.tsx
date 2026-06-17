/**
 * Phase 3 showcase: replace the Clients placeholder with a real-looking
 * DataTable using mock data. This stays as the Clients list page in
 * Phase 4b (where we'll wire up the real drawer etc.).
 *
 * Exercises:
 *   - SectionCard with title + actions
 *   - DataTable with all the column types
 *   - Search input
 *   - Filter pills
 *   - Status badges
 *   - Selection
 *   - Sorting
 *   - Pagination
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Download, Filter, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Button,
  SearchInput,
  DataTable,
  PageHeader,
} from "@/components/ui";
import { ClientDrawer } from "@/components/clients/ClientDrawer";
import {
  CLIENTS,
  getClientById,
  type Client,
} from "@/lib/mock-data";
import {
  textColumn,
  dateColumn,
  currencyColumn,
  statusBadgeColumn,
  statusVariantAdapter,
  statusLabelAdapter,
} from "@/lib/columns";
import { formatPhone } from "@/lib/utils";
import type { Status } from "@/lib/mock-data";

const FILTERS: { key: "all" | "commercial" | "residential"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "commercial", label: "Commercial" },
  { key: "residential", label: "Residential" },
];

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "commercial" | "residential">("all");

  // Drawer state — driven by ?id=C-1234 in the URL
  const openClientId = searchParams.get("id");
  const openClient = openClientId ? getClientById(openClientId) ?? null : null;

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    const qs = params.toString();
    router.push(qs ? `/clients?${qs}` : "/clients");
  };

  // Close drawer on Escape (defense in depth — Drawer does this too)
  useEffect(() => {
    if (!openClient) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClient]);

  const filteredData = CLIENTS.filter((c) => {
    if (filter !== "all" && c.type !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.companyName ?? "").toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const columns: ColumnDef<Client>[] = [
    textColumn<Client>({
      key: "companyName",
      header: "Company Name",
      sortKey: (c) => c.companyName ?? `${c.firstName} ${c.lastName}`,
      render: (c) => (
        <span style={{ fontWeight: 500, color: "var(--color-carbon)" }}>
          {c.companyName ?? `${c.firstName} ${c.lastName}`}
        </span>
      ),
    }),
    textColumn<Client>({
      key: "lastName",
      header: "Last Name",
      sortKey: (c) => c.lastName,
    }),
    textColumn<Client>({
      key: "phone",
      header: "Phone",
      render: (c) => formatPhone(c.phone),
    }),
    currencyColumn<Client>({
      key: "lastInvoiceAmount",
      header: "Last Invoice",
    }),
    dateColumn<Client>({
      key: "lastInvoiceDate",
      header: "Last Invoice Date",
    }),
    statusBadgeColumn<Client>({
      header: "Status",
      accessor: (c) => c.lastInvoiceStatus as Status,
      getVariant: statusVariantAdapter,
      getLabel: statusLabelAdapter,
    }),
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers CRM" }, { label: "Clients" }]}
        title="Clients"
        actions={
          <>
            <Button
              variant="outlined"
              leadingIcon={<Download size={16} strokeWidth={2} />}
            >
              Export
            </Button>
            <Button
              variant="filled"
              leadingIcon={<Plus size={16} strokeWidth={2} />}
            >
              New Client
            </Button>
          </>
        }
      />

      <div style={{ padding: "0 32px 32px 32px" }}>
        <div
          className="bg-paper rounded-md overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--color-chalk)",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div className="flex items-center min-w-0" style={{ gap: "16px" }}>
              <h2
                className="text-carbon"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                All Clients
                <span
                  className="text-slate"
                  style={{ fontSize: "13px", fontWeight: 400, marginLeft: "8px" }}
                >
                  ({filteredData.length})
                </span>
              </h2>
            </div>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <SearchInput
                placeholder="Search by name, phone, company…"
                value={search}
                onChange={setSearch}
                style={{ width: "280px" }}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div
            className="flex items-center"
            style={{
              padding: "12px 24px",
              borderBottom: "1px solid var(--color-chalk)",
              gap: "8px",
            }}
          >
            <Filter size={14} strokeWidth={2} className="text-slate" />
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="rounded-xl transition-colors"
                style={{
                  height: "28px",
                  padding: "0 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  background: filter === f.key ? "var(--color-carbon)" : "var(--color-fog)",
                  color: filter === f.key ? "var(--color-paper)" : "var(--color-graphite)",
                  border: filter === f.key ? "1px solid var(--color-carbon)" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredData}
            getRowId={(c) => c.id}
            onRowClick={(c) => router.push(`/clients?id=${encodeURIComponent(c.id)}`)}
            emptyIcon={Users}
            emptyTitle="No clients found"
            emptyDescription="Try a different search term or filter."
          />
        </div>
      </div>

      {/* Client Record drawer */}
      <ClientDrawer
        client={openClient}
        open={!!openClient}
        onClose={closeDrawer}
      />
    </div>
  );
}
