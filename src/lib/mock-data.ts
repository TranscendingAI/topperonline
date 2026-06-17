/**
 * Hardcoded placeholder data for Phase 1 (UI only).
 *
 * Field names reflect what a real topper dealer's CRM would track.
 * Values are plausible but invented — swap with real API data in Phase 2.
 *
 * Status values match the 5 status colors from DESIGN.md:
 *   confirmed | paid | in_stock | active           → green
 *   pending   | awaiting | partial                → amber
 *   overdue   | cancelled | failed                → red
 *   sent      | in_transit | scheduled            → blue
 *   ai_active | auto_sent | lead_engaged          → purple
 */

import { formatCurrency } from "./utils";

// ============================================================================
// STATUS (data type + variant mapping)
// ============================================================================

/**
 * Specific status values used in the CRM data.
 * These map to the 5 color variants in components/ui/StatusBadge via
 * statusToVariant() below.
 */
export type Status =
  | "confirmed" | "paid" | "in_stock" | "active"
  | "pending" | "awaiting" | "partial"
  | "overdue" | "cancelled" | "failed"
  | "sent" | "in_transit" | "scheduled"
  | "ai_active" | "auto_sent" | "lead_engaged";

import type { StatusVariant } from "@/components/ui/StatusBadge";

/** Map a data Status to the 5-color StatusVariant for the StatusBadge. */
export function statusToVariant(status: Status): StatusVariant {
  switch (status) {
    case "confirmed":
    case "paid":
    case "in_stock":
    case "active":
      return "green";
    case "pending":
    case "awaiting":
    case "partial":
      return "amber";
    case "overdue":
    case "cancelled":
    case "failed":
      return "red";
    case "sent":
    case "in_transit":
    case "scheduled":
      return "blue";
    case "ai_active":
    case "auto_sent":
    case "lead_engaged":
      return "purple";
  }
}

/** Human-readable label for a status value. */
export function statusLabel(status: Status): string {
  return status
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

// ============================================================================
// CLIENTS
// ============================================================================

export type ClientType = "commercial" | "residential";

export interface Client {
  id: string;
  companyName: string | null;
  lastName: string;
  firstName: string;
  type: ClientType;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lastInvoiceAmount: number;
  lastInvoiceDate: string; // ISO
  lastInvoiceStatus: Status;
  totalInvoices: number;
  totalSpend: number;
  notes: string;
  createdAt: string;
}

const FIRST_NAMES = [
  "Mike", "Sarah", "Tom", "Jennifer", "David", "Lisa", "Brian", "Karen",
  "Jason", "Amy", "Robert", "Nicole", "Chris", "Michelle", "Kevin", "Rachel",
  "Daniel", "Stephanie", "Mark", "Laura", "Greg", "Tina", "Steve", "Cindy",
  "Brad", "Heather", "Patrick", "Megan", "Tony", "Beth",
];

const LAST_NAMES = [
  "Henderson", "Martinez", "Thompson", "Rodriguez", "Walker", "Chen", "Patel",
  "Nakamura", "O'Brien", "Williams", "Singh", "Garcia", "Fischer", "Kim",
  "Hernandez", "Larsen", "Brooks", "Kowalski", "Foster", "Reyes",
];

const COMPANY_PREFIXES = [
  "Acme", "Summit", "Cascade", "Pioneer", "Liberty", "Northgate", "Iron Horse",
  "Riverside", "Pine Ridge", "Heritage", "Frontier", "Blue Ridge", "Granite",
  "Cedar", "Prairie", "Valley",
];

const COMPANY_SUFFIXES = [
  "Trucking", "Construction", "Logging", "Farms", "Excavating", "Hauling",
  "Ranch", "Landscaping", "Roofing", "Plumbing", "Electric", "Auto",
];

const CITIES = [
  ["Denver", "CO"], ["Boulder", "CO"], ["Aurora", "CO"], ["Lakewood", "CO"],
  ["Thornton", "CO"], ["Westminster", "CO"], ["Arvada", "CO"], ["Centennial", "CO"],
  ["Englewood", "CO"], ["Littleton", "CO"], ["Parker", "CO"], ["Broomfield", "CO"],
];

const STATUSES: Status[] = [
  "confirmed", "pending", "paid", "overdue", "in_transit", "scheduled",
];

// Status is the data type for status values (specific names like "confirmed", "overdue")

// Deterministic pseudo-random for stable mock data
function seeded(i: number, salt: number): number {
  return ((i * 2654435761 + salt * 40503) % 233280) / 233280;
}

function pick<T>(arr: readonly T[], i: number, salt: number): T {
  return arr[Math.floor(seeded(i, salt) * arr.length)];
}

function randomDate(i: number, salt: number, daysBack: number): string {
  const ms = Date.now() - Math.floor(seeded(i, salt) * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().split("T")[0];
}

function randomPhone(i: number, salt: number): string {
  const a = 200 + Math.floor(seeded(i, salt) * 700);
  const b = 200 + Math.floor(seeded(i, salt + 1) * 700);
  const c = 1000 + Math.floor(seeded(i, salt + 2) * 9000);
  return `(${a}) ${b}-${c}`;
}

export const CLIENTS: Client[] = Array.from({ length: 28 }, (_, i) => {
  const first = pick(FIRST_NAMES, i, 1);
  const last = pick(LAST_NAMES, i, 2);
  const isCommercial = seeded(i, 3) > 0.45;
  const company = isCommercial
    ? `${pick(COMPANY_PREFIXES, i, 4)} ${pick(COMPANY_SUFFIXES, i, 5)}`
    : null;
  const [city, state] = pick(CITIES, i, 6);
  const lastInvoiceAmount = Math.floor(800 + seeded(i, 7) * 8400);
  const totalInvoices = 1 + Math.floor(seeded(i, 8) * 12);
  return {
    id: `C-${1000 + i}`,
    companyName: company,
    lastName: last,
    firstName: first,
    type: isCommercial ? "commercial" : "residential",
    phone: randomPhone(i, 9),
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@${company ? company.toLowerCase().replace(/\s+/g, "") : "gmail"}.com`,
    address: `${1000 + Math.floor(seeded(i, 10) * 9000)} ${pick(["Main", "Oak", "Elm", "Pine", "Maple", "Cedar", "Park", "Hill"], i, 11)} St`,
    city,
    state,
    zip: `${80000 + Math.floor(seeded(i, 12) * 2000)}`,
    lastInvoiceAmount,
    lastInvoiceDate: randomDate(i, 13, 180),
    lastInvoiceStatus: pick(STATUSES, i, 14),
    totalInvoices,
    totalSpend: lastInvoiceAmount * totalInvoices,
    notes: "",
    createdAt: randomDate(i, 15, 730),
  };
});

// ============================================================================
// LEADS & OUTREACH
// ============================================================================

export type LeadStage =
  | "new_lead"
  | "ai_contacted"
  | "responded"
  | "appointment_set"
  | "confirmed_sale";

export type LeadSource =
  | "website"
  | "phone_call"
  | "walk_in"
  | "referral"
  | "google_ads"
  | "facebook";

export interface LeadMessage {
  id: string;
  from: "ai" | "customer" | "system";
  text: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  source: LeadSource;
  vehicle: string; // e.g. "2024 Ford F-150"
  interest: string; // e.g. "ARE CX Series topper"
  stage: LeadStage;
  lastContactAt: string;
  aiHandled: boolean;
  estimatedValue: number;
  conversation: LeadMessage[];
  createdAt: string;
}

const LEAD_SOURCES: LeadSource[] = ["website", "phone_call", "walk_in", "referral", "google_ads", "facebook"];
const LEAD_STAGES: LeadStage[] = ["new_lead", "ai_contacted", "responded", "appointment_set", "confirmed_sale"];
const VEHICLES = [
  "2024 Ford F-150", "2023 Chevy Silverado", "2024 RAM 1500", "2023 Toyota Tacoma",
  "2024 Ford Ranger", "2023 GMC Sierra", "2024 Chevy Colorado", "2023 Ford F-250",
  "2024 RAM 2500", "2023 Toyota Tundra",
];
const INTERESTS = [
  "ARE CX Series topper", "Leer 100R topper", "Snugtop SB Series", "ARE Z Series",
  "Leer 122 Cap", "ARE RT Series", "Snugtop Hi-Liner", "ARE Overland",
];

const SAMPLE_OUTREACH: Record<LeadStage, LeadMessage[]> = {
  new_lead: [
    { id: "m1", from: "system", text: "Lead created from website form", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  ],
  ai_contacted: [
    { id: "m1", from: "ai", text: "Hi! This is Sarah from Suburban Toppers. I saw you were looking at the ARE CX Series for your 2024 F-150. Do you have a few minutes to chat?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: "m2", from: "system", text: "AI message sent via SMS", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000).toISOString() },
  ],
  responded: [
    { id: "m1", from: "ai", text: "Hi! This is Sarah from Suburban Toppers. I saw you were looking at the ARE CX Series for your 2024 F-150.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: "m2", from: "customer", text: "Yes, I'm interested. What colors do you have in stock?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: "m3", from: "ai", text: "Great question! We have Black, White, Silver, and Charcoal in stock right now. Want to come by for a look?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 - 1000).toISOString() },
  ],
  appointment_set: [
    { id: "m1", from: "ai", text: "Hi Mike! Just confirming your appointment for Saturday at 10am.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: "m2", from: "customer", text: "Confirmed, see you then.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
    { id: "m3", from: "system", text: "Appointment confirmed via SMS for Sat 10:00am", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23 + 1000).toISOString() },
  ],
  confirmed_sale: [
    { id: "m1", from: "ai", text: "Thanks for choosing Suburban Toppers! Your order is confirmed.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    { id: "m2", from: "system", text: "Invoice INV-2026-0847 created — $3,840", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000).toISOString() },
  ],
};

export const LEADS: Lead[] = Array.from({ length: 18 }, (_, i) => {
  const first = pick(FIRST_NAMES, i + 5, 20);
  const last = pick(LAST_NAMES, i + 5, 21);
  const stage = pick(LEAD_STAGES, i, 22);
  // Distribute stages: more in early stages
  const stageBias = [0, 0, 1, 1, 1, 2, 2, 3, 4, 4][i % 10];
  const finalStage = stageBias <= 1 ? stage : LEAD_STAGES[Math.min(stageBias, LEAD_STAGES.length - 1)];
  return {
    id: `L-${2000 + i}`,
    firstName: first,
    lastName: last,
    phone: randomPhone(i + 5, 23),
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@gmail.com`,
    source: pick(LEAD_SOURCES, i, 24),
    vehicle: pick(VEHICLES, i, 25),
    interest: pick(INTERESTS, i, 26),
    stage: finalStage,
    lastContactAt: randomDate(i, 27, 14),
    aiHandled: seeded(i, 28) > 0.2,
    estimatedValue: Math.floor(2400 + seeded(i, 29) * 4000),
    conversation: SAMPLE_OUTREACH[finalStage],
    createdAt: randomDate(i, 30, 30),
  };
});

export const PIPELINE_STAGE_LABELS: Record<LeadStage, string> = {
  new_lead: "New Lead",
  ai_contacted: "AI Contacted",
  responded: "Responded",
  appointment_set: "Appointment Set",
  confirmed_sale: "Confirmed Sale",
};

// ============================================================================
// INVOICES
// ============================================================================

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  date: string;
  total: number;
  status: Status;
  itemCount: number;
  location: "suburban" | "south";
}

export const INVOICES: Invoice[] = CLIENTS.flatMap((client, i) =>
  Array.from({ length: Math.min(client.totalInvoices, 4) }, (_, j) => {
    const amount = Math.floor(800 + seeded(i * 10 + j, 40) * 8400);
    return {
      id: `INV-${5000 + i * 10 + j}`,
      number: `INV-2026-${String(5000 + i * 10 + j).padStart(4, "0")}`,
      clientId: client.id,
      date: randomDate(i * 10 + j, 41, 120),
      total: amount,
      status: pick(STATUSES, i * 10 + j, 42),
      itemCount: 1 + Math.floor(seeded(i * 10 + j, 43) * 3),
      location: seeded(i * 10 + j, 44) > 0.5 ? "south" : "suburban",
    } satisfies Invoice;
  })
);

// ============================================================================
// INVOICE ITEMS
// ============================================================================

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  type: "topper" | "rack" | "accessory" | "labor";
  manufacturer: string;
  model: string;
  color: string;
  description: string;
  price: number;
  status: "ordered" | "in_stock" | "installed" | "cancelled";
}

const TOPPER_COLORS = ["Black", "White", "Silver", "Charcoal", "Red", "Blue", "Tan"];

export const INVOICE_ITEMS: InvoiceItem[] = INVOICES.flatMap((inv) =>
  Array.from({ length: inv.itemCount }, (_, k) => {
    const idx = parseInt(inv.id.split("-")[1]) + k;
    return {
      id: `II-${6000 + idx}`,
      invoiceId: inv.id,
      type: "topper",
      manufacturer: pick(["ARE", "Leer", "Snugtop"], idx, 50),
      model: pick(["CX Series", "100R", "Z Series", "122 Cap", "Hi-Liner"], idx, 51),
      color: pick(TOPPER_COLORS, idx, 52),
      description: `${pick(VEHICLES, idx, 53)} topper install`,
      price: Math.floor(1800 + seeded(idx, 54) * 3200),
      status: pick(["ordered", "in_stock", "installed", "cancelled"] as const, idx, 55),
    } satisfies InvoiceItem;
  })
);

// ============================================================================
// STOCK ORDERS (In House)
// ============================================================================

export interface StockOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  description: string;
  color: string;
  status: Status;
  estimatedCost: number;
  expectedDate?: string;
}

export const STOCK_ORDERS: StockOrder[] = Array.from({ length: 12 }, (_, i) => ({
  id: `SO-${7000 + i}`,
  orderNumber: `SO-2026-${String(7000 + i).padStart(4, "0")}`,
  orderDate: randomDate(i, 60, 90),
  description: `${pick(VEHICLES, i, 61)} — ${pick(INTERESTS, i, 62)}`,
  color: pick(TOPPER_COLORS, i, 63),
  status: pick(["ordered", "in_stock", "pending", "awaiting"] as Status[], i, 64),
  estimatedCost: Math.floor(1800 + seeded(i, 65) * 3600),
  expectedDate: seeded(i, 66) > 0.4 ? randomDate(-i, 67, -30) : undefined,
}));

// ============================================================================
// TRADE-INS
// ============================================================================

export interface TradeIn {
  id: string;
  stockNumber: string;
  dateAdded: string;
  description: string;
  color: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  askingPrice: number;
}

export const TRADE_INS: TradeIn[] = Array.from({ length: 6 }, (_, i) => ({
  id: `TI-${8000 + i}`,
  stockNumber: `TI-${8000 + i}`,
  dateAdded: randomDate(i, 70, 60),
  description: `${pick(VEHICLES, i, 71)} — ${pick(INTERESTS, i, 72)} (used)`,
  color: pick(TOPPER_COLORS, i, 73),
  condition: pick(["Excellent", "Good", "Fair", "Poor"] as const, i, 74),
  askingPrice: Math.floor(800 + seeded(i, 75) * 2200),
}));

// ============================================================================
// INVENTORY
// ============================================================================

export interface InventoryItem {
  id: string;
  item: string;
  description: string;
  qtyInStock: number;
  location: "suburban" | "south" | "warehouse";
  reorderLevel: number;
}

export const INVENTORY: InventoryItem[] = [
  { id: "INV-1", item: "ARE CX Series - Black", description: "Fiberglass topper, standard cab", qtyInStock: 3, location: "suburban", reorderLevel: 1 },
  { id: "INV-2", item: "ARE CX Series - White", description: "Fiberglass topper, standard cab", qtyInStock: 2, location: "south", reorderLevel: 1 },
  { id: "INV-3", item: "Leer 100R - Silver", description: "Aluminum topper, standard cab", qtyInStock: 1, location: "suburban", reorderLevel: 2 },
  { id: "INV-4", item: "Leer 100R - Black", description: "Aluminum topper, standard cab", qtyInStock: 4, location: "south", reorderLevel: 1 },
  { id: "INV-5", item: "Snugtop Hi-Liner - Charcoal", description: "Sleeper cab topper", qtyInStock: 1, location: "suburban", reorderLevel: 1 },
  { id: "INV-6", item: "ARE Z Series - White", description: "Commercial grade topper", qtyInStock: 2, location: "warehouse", reorderLevel: 1 },
  { id: "INV-7", item: "Cross rails - Universal", description: "Aluminum cross rail system", qtyInStock: 12, location: "warehouse", reorderLevel: 4 },
  { id: "INV-8", item: "Headliner kit - Black", description: "Interior headliner for CX", qtyInStock: 6, location: "suburban", reorderLevel: 2 },
  { id: "INV-9", item: "Side window - Driver", description: "Sliding side window assembly", qtyInStock: 0, location: "south", reorderLevel: 2 },
  { id: "INV-10", item: "Front access panel", description: "Gas strut front access", qtyInStock: 3, location: "warehouse", reorderLevel: 1 },
];

// ============================================================================
// INSTALL SCHEDULE (today + a few days)
// ============================================================================

export interface Install {
  id: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  vehicle: string;
  topperDescription: string;
  startTime: string; // "07:30"
  durationMin: number;
  location: "suburban" | "south";
  installer: string;
  notes?: string;
}

const INSTALLERS = ["Jorge M.", "Tom R.", "Brent K.", "Carlos D.", "Mike P."];

// Generate today's installs (8-10 of them across the two locations)
function makeInstalls(): Install[] {
  const installs: Install[] = [];
  const slots = [
    { time: "07:30", dur: 90 },
    { time: "08:30", dur: 120 },
    { time: "09:30", dur: 60 },
    { time: "10:00", dur: 90 },
    { time: "11:00", dur: 60 },
    { time: "12:00", dur: 90 },
    { time: "13:30", dur: 120 },
    { time: "14:30", dur: 60 },
    { time: "15:30", dur: 90 },
    { time: "16:30", dur: 60 },
  ];
  const suburbanSlots = slots.slice(0, 6);
  const southSlots = slots.slice(4);
  for (let i = 0; i < suburbanSlots.length; i++) {
    const c = CLIENTS[(i * 3) % CLIENTS.length];
    installs.push({
      id: `INST-S-${i}`,
      invoiceId: INVOICES[i % INVOICES.length].id,
      clientId: c.id,
      clientName: c.companyName ?? `${c.firstName} ${c.lastName}`,
      vehicle: pick(VEHICLES, i, 80),
      topperDescription: pick(INTERESTS, i, 81),
      startTime: suburbanSlots[i].time,
      durationMin: suburbanSlots[i].dur,
      location: "suburban",
      installer: pick(INSTALLERS, i, 82),
    });
  }
  for (let i = 0; i < southSlots.length; i++) {
    const c = CLIENTS[(i * 5 + 2) % CLIENTS.length];
    installs.push({
      id: `INST-SO-${i}`,
      invoiceId: INVOICES[(i + 5) % INVOICES.length].id,
      clientId: c.id,
      clientName: c.companyName ?? `${c.firstName} ${c.lastName}`,
      vehicle: pick(VEHICLES, i + 10, 83),
      topperDescription: pick(INTERESTS, i + 10, 84),
      startTime: southSlots[i].time,
      durationMin: southSlots[i].dur,
      location: "south",
      installer: pick(INSTALLERS, i + 10, 85),
    });
  }
  return installs;
}

export const TODAY_INSTALLS: Install[] = makeInstalls();

// ============================================================================
// MANUFACTURERS (for Maintenance page)
// ============================================================================

export interface Manufacturer {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productLine: string;
  active: boolean;
}

export const MANUFACTURERS: Manufacturer[] = [
  { id: "M-1", name: "ARE", contactName: "Jim Patterson", contactEmail: "jim@are.com", contactPhone: "(800) 555-0101", productLine: "Truck toppers, caps", active: true },
  { id: "M-2", name: "Leer", contactName: "Karen Wells", contactEmail: "karen@leer.com", contactPhone: "(800) 555-0102", productLine: "Truck toppers, commercial caps", active: true },
  { id: "M-3", name: "Snugtop", contactName: "Doug Reilly", contactEmail: "doug@snugtop.com", contactPhone: "(800) 555-0103", productLine: "Premium toppers, sleeper cabs", active: true },
  { id: "M-4", name: "Jason Truck Bodies", contactName: "Mike B.", contactEmail: "mike@jasontb.com", contactPhone: "(800) 555-0104", productLine: "Custom commercial bodies", active: false },
];

// ============================================================================
// LOCATIONS
// ============================================================================

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  isPrimary: boolean;
}

export const LOCATIONS: Location[] = [
  {
    id: "L-1",
    name: "Suburban Toppers",
    address: "1234 W Colfax Ave",
    city: "Denver",
    state: "CO",
    zip: "80204",
    phone: "(303) 555-0100",
    hours: "Mon-Fri 8am-6pm, Sat 9am-2pm",
    isPrimary: true,
  },
  {
    id: "L-2",
    name: "Suburban Toppers - South",
    address: "8900 E Lincoln Ave",
    city: "Centennial",
    state: "CO",
    zip: "80112",
    phone: "(720) 555-0200",
    hours: "Mon-Fri 8am-6pm, Sat 9am-2pm",
    isPrimary: false,
  },
];

// ============================================================================
// USERS
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "installer" | "manager";
  location: "suburban" | "south" | "both";
  active: boolean;
  lastLogin: string;
}

export const USERS: User[] = [
  { id: "U-1", name: "Zack Vivas", email: "zack@suburbantoppers.com", role: "admin", location: "both", active: true, lastLogin: "2026-06-16" },
  { id: "U-2", name: "Sarah Henderson", email: "sarah@suburbantoppers.com", role: "manager", location: "suburban", active: true, lastLogin: "2026-06-16" },
  { id: "U-3", name: "Jorge Martinez", email: "jorge@suburbantoppers.com", role: "installer", location: "suburban", active: true, lastLogin: "2026-06-15" },
  { id: "U-4", name: "Tom Reilly", email: "tom@suburbantoppers.com", role: "installer", location: "south", active: true, lastLogin: "2026-06-15" },
  { id: "U-5", name: "Brent Kowalski", email: "brent@suburbantoppers.com", role: "installer", location: "suburban", active: true, lastLogin: "2026-06-14" },
  { id: "U-6", name: "Lisa Chen", email: "lisa@suburbantoppers.com", role: "sales", location: "both", active: true, lastLogin: "2026-06-16" },
  { id: "U-7", name: "Mike Patel", email: "mike@suburbantoppers.com", role: "sales", location: "south", active: false, lastLogin: "2025-12-01" },
];

// ============================================================================
// DASHBOARD SUMMARY METRICS
// ============================================================================

export const DASHBOARD_METRICS = {
  todaysInstalls: 12,
  openInvoices: 48,
  openInvoicesTotal: 124_300,
  arOverdue30: 24_800,
  arOverdueDelta: 3_200, // positive number, but this is a BAD thing (overdue is up)
  pendingConfirmations: 7,
  monthlyRevenue: [ // 12 months trailing, for the area chart
    { month: "Jul '25", value: 142_000 },
    { month: "Aug '25", value: 156_000 },
    { month: "Sep '25", value: 138_000 },
    { month: "Oct '25", value: 168_000 },
    { month: "Nov '25", value: 152_000 },
    { month: "Dec '25", value: 124_000 },
    { month: "Jan '26", value: 118_000 },
    { month: "Feb '26", value: 132_000 },
    { month: "Mar '26", value: 168_000 },
    { month: "Apr '26", value: 184_000 },
    { month: "May '26", value: 196_000 },
    { month: "Jun '26", value: 178_000 },
  ],
  salesByManufacturer: [
    { name: "ARE", value: 38, color: "var(--color-signal-orange)" },
    { name: "Leer", value: 28, color: "var(--color-sienna-bronze)" },
    { name: "Snugtop", value: 18, color: "var(--color-graphite)" },
    { name: "Other", value: 10, color: "var(--color-slate)" },
    { name: "Jason TB", value: 6, color: "var(--color-chalk)" },
  ],
  pipelineCounts: {
    new_lead: 14,
    ai_contacted: 9,
    responded: 6,
    appointment_set: 4,
    confirmed_sale: 2,
  },
  outreachActivity: [
    // 7-day trailing for outreach activity chart
    { day: "Mon", sent: 12, replied: 4 },
    { day: "Tue", sent: 18, replied: 7 },
    { day: "Wed", sent: 15, replied: 5 },
    { day: "Thu", sent: 22, replied: 9 },
    { day: "Fri", sent: 20, replied: 8 },
    { day: "Sat", sent: 8, replied: 3 },
    { day: "Sun", sent: 4, replied: 1 },
  ],
};

export const fmt = formatCurrency;
