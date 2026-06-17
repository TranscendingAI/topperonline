/**
 * Generic "coming in Phase 4" placeholder for routes we haven't built yet.
 * Renders a proper page header (matching the design) and a card explaining
 * what's coming — this is realistic enough for the sidebar nav to work
 * without 404s during the build-up.
 */
import { Construction } from "lucide-react";
import { notFound } from "next/navigation";

const PHASE_MAP: Record<string, { title: string; phase: string; description: string }> = {
  "/clients": {
    title: "Clients",
    phase: "Phase 4b",
    description: "List of all clients with search, filters, and click-through to individual client records (invoices, items, communications, notes).",
  },
  "/leads": {
    title: "Leads & Outreach",
    phase: "Phase 4d",
    description: "AI-handled lead pipeline with funnel visualization, leads table, and 7-day outreach activity chart.",
  },
  "/stock": {
    title: "Stock",
    phase: "Phase 4e",
    description: "Three-tab view: In-House Orders, Trade-In, and Inventory.",
  },
  "/schedule": {
    title: "Schedule",
    phase: "Phase 4c",
    description: "Dual-location daily install calendar with 30-minute time slots from 7am-6pm.",
  },
  "/reports": {
    title: "Reports",
    phase: "Phase 4f",
    description: "Index of 9 report types (Ready for Install, Day End, Sales Analysis, AR, Confirmation, Manufacturer, Zip Code, Taxable/Non-Taxable, Labor).",
  },
  "/maintenance": {
    title: "Maintenance",
    phase: "Phase 4g",
    description: "Admin section: Locations, Users, Password, Pricing, Manufacturers, Items, Vehicles, Installation Packs.",
  },
};

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = "/" + slug.join("/");

  // Sub-routes (e.g. /reports/ar) fall back to the parent placeholder
  const parentPath = "/" + (slug[0] ?? "");
  const meta = PHASE_MAP[path] ?? PHASE_MAP[parentPath];

  if (!meta) {
    // Unknown route within (app) — 404
    notFound();
  }

  const isSubRoute = path !== parentPath;

  return (
    <div className="p-32">
      <header className="flex items-end justify-between mb-24 pb-24 border-b border-chalk">
        <div>
          <nav className="text-slate mb-8" style={{ fontSize: "13px" }}>
            <span>Suburban Toppers CRM</span>
            <span className="mx-8">›</span>
            <span className="text-graphite">{meta.title}</span>
          </nav>
          <h1
            className="text-carbon"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "-0.48px",
              lineHeight: 1.2,
            }}
          >
            {meta.title}
          </h1>
        </div>
      </header>

      <div className="bg-paper rounded-md p-32 max-w-2xl">
        <div className="flex items-start gap-16">
          <div className="w-48 h-48 rounded-md bg-fog flex items-center justify-center shrink-0">
            <Construction size={24} strokeWidth={2} className="text-slate" />
          </div>
          <div>
            <p className="text-carbon mb-8" style={{ fontSize: "16px", fontWeight: 500 }}>
              {meta.phase} — placeholder
            </p>
            <p className="text-graphite mb-12" style={{ fontSize: "14px", lineHeight: 1.43 }}>
              {meta.description}
            </p>
            {isSubRoute && (
              <p className="text-slate" style={{ fontSize: "12px", lineHeight: 1.5, fontStyle: "italic" }}>
                Sub-route <code className="bg-fog px-4 py-2 rounded-sm text-carbon">{path}</code> — full
                page lands in {meta.phase}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
