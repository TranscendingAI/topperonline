/**
 * Morning Briefing Agent (Phase 2c).
 *
 * Assembles the daily digest for Brad/Dan:
 *   - Today's installs at both locations (confirmed vs. unconfirmed)
 *   - Low-stock alerts
 *   - Lead pipeline movement (live from the DB)
 *   - AR snapshot
 *   - "Needs a human" items
 *
 * Data sources: live leads DB (Phase 2b) + Phase 1 mock data for the
 * domains that don't have persistence yet (installs, inventory, AR).
 * As those move to real data (calendar sync, Phase 3), the mock
 * imports here get swapped — the briefing shape doesn't change.
 *
 * Output: structured JSON + rendered markdown. The markdown is what
 * gets delivered (email / SMS / dashboard card); the JSON powers UI.
 */

import {
  TODAY_INSTALLS,
  INVENTORY,
  DASHBOARD_METRICS,
} from "@/lib/mock-data";
import { listLeads, listAgentActions, logAgentAction } from "@/lib/db";

export interface Briefing {
  date: string; // YYYY-MM-DD
  generatedAt: string; // ISO
  installs: {
    total: number;
    byLocation: Record<string, Array<{ time: string; client: string; topper: string; installer: string }>>;
  };
  lowStock: Array<{ item: string; qty: number; reorderLevel: number; location: string }>;
  pipeline: {
    counts: Record<string, number>;
    totalEstimatedValue: number;
    newLeadsLast24h: number;
  };
  ar: { overdue30: number; delta: number };
  needsHuman: string[];
  recentAgentActivity: Array<{ agent: string; action: string; detail: string; at: string }>;
}

export function buildBriefing(): Briefing {
  const now = new Date();
  const date = now.toISOString().split("T")[0];

  // --- Installs (mock until calendar sync lands) ---
  const byLocation: Briefing["installs"]["byLocation"] = {};
  for (const inst of TODAY_INSTALLS) {
    const key = inst.location === "suburban" ? "Suburban Toppers" : "Suburban Toppers - South";
    byLocation[key] ??= [];
    byLocation[key].push({
      time: inst.startTime,
      client: inst.clientName,
      topper: inst.topperDescription,
      installer: inst.installer,
    });
  }
  for (const key of Object.keys(byLocation)) {
    byLocation[key].sort((a, b) => a.time.localeCompare(b.time));
  }

  // --- Low stock ---
  const lowStock = INVENTORY.filter((i) => i.qtyInStock <= i.reorderLevel).map((i) => ({
    item: i.item,
    qty: i.qtyInStock,
    reorderLevel: i.reorderLevel,
    location: i.location,
  }));

  // --- Pipeline (LIVE from DB) ---
  const leads = listLeads();
  const counts: Record<string, number> = {
    new_lead: 0, ai_contacted: 0, responded: 0, appointment_set: 0, confirmed_sale: 0,
  };
  let totalEstimatedValue = 0;
  let newLeadsLast24h = 0;
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const l of leads) {
    counts[l.stage] = (counts[l.stage] ?? 0) + 1;
    totalEstimatedValue += l.estimated_value;
    if (new Date(l.created_at + "Z").getTime() > dayAgo) newLeadsLast24h++;
  }

  // --- AR (mock until invoices persist) ---
  const ar = {
    overdue30: DASHBOARD_METRICS.arOverdue30,
    delta: DASHBOARD_METRICS.arOverdueDelta,
  };

  // --- Needs a human ---
  const needsHuman: string[] = [];
  if (ar.delta > 0) {
    needsHuman.push(
      `AR overdue 30+ is up $${ar.delta.toLocaleString()} — review the worst accounts.`
    );
  }
  if (lowStock.length > 0) {
    needsHuman.push(
      `${lowStock.length} inventory item${lowStock.length === 1 ? "" : "s"} at/below reorder level — approve reorders.`
    );
  }
  const staleResponded = leads.filter(
    (l) => l.stage === "responded" &&
      Date.now() - new Date(l.last_contact_at + "Z").getTime() > 3 * 24 * 60 * 60 * 1000
  );
  if (staleResponded.length > 0) {
    needsHuman.push(
      `${staleResponded.length} engaged lead${staleResponded.length === 1 ? "" : "s"} with no contact in 3+ days: ` +
      staleResponded.map((l) => `${l.first_name} ${l.last_name} (${l.id})`).join(", ")
    );
  }
  if (needsHuman.length === 0) needsHuman.push("Nothing urgent — smooth sailing today.");

  // --- Recent agent activity (audit log) ---
  const recentAgentActivity = listAgentActions(10).map((a) => ({
    agent: a.agent,
    action: a.action,
    detail: a.detail,
    at: a.created_at,
  }));

  const briefing: Briefing = {
    date,
    generatedAt: now.toISOString(),
    installs: { total: TODAY_INSTALLS.length, byLocation },
    lowStock,
    pipeline: { counts, totalEstimatedValue, newLeadsLast24h },
    ar,
    needsHuman,
    recentAgentActivity,
  };

  logAgentAction({
    agent: "briefing",
    action: "generate",
    detail: `Morning briefing generated for ${date}`,
    tier: "auto",
  });

  return briefing;
}

// ---------------------------------------------------------------------------
// Markdown rendering — the deliverable format
// ---------------------------------------------------------------------------

const STAGE_LABELS: Record<string, string> = {
  new_lead: "New",
  ai_contacted: "AI Contacted",
  responded: "Responded",
  appointment_set: "Appt Set",
  confirmed_sale: "Confirmed",
};

export function renderBriefingMarkdown(b: Briefing): string {
  const lines: string[] = [];
  const prettyDate = new Date(b.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  lines.push(`# ☀️ Morning Briefing — ${prettyDate}`);
  lines.push("");

  // Installs
  lines.push(`## 🔧 Today's Installs (${b.installs.total})`);
  for (const [loc, installs] of Object.entries(b.installs.byLocation)) {
    lines.push(`**${loc}**`);
    for (const i of installs) {
      lines.push(`- ${i.time} — ${i.client} · ${i.topper} · ${i.installer}`);
    }
    lines.push("");
  }

  // Pipeline
  const pipelineParts = Object.entries(b.pipeline.counts)
    .map(([stage, n]) => `${STAGE_LABELS[stage] ?? stage}: ${n}`)
    .join(" · ");
  lines.push(`## 📈 Lead Pipeline`);
  lines.push(pipelineParts);
  lines.push(
    `Pipeline value: $${b.pipeline.totalEstimatedValue.toLocaleString()} · ` +
    `New in last 24h: ${b.pipeline.newLeadsLast24h}`
  );
  lines.push("");

  // Low stock
  if (b.lowStock.length > 0) {
    lines.push(`## 📦 Low Stock (${b.lowStock.length})`);
    for (const s of b.lowStock) {
      lines.push(`- **${s.item}** — ${s.qty} on hand (reorder at ${s.reorderLevel}) · ${s.location}`);
    }
    lines.push("");
  }

  // AR
  const arrow = b.ar.delta > 0 ? "↑" : b.ar.delta < 0 ? "↓" : "→";
  lines.push(`## 💰 AR Overdue 30+`);
  lines.push(`$${b.ar.overdue30.toLocaleString()} (${arrow} $${Math.abs(b.ar.delta).toLocaleString()} vs. last month)`);
  lines.push("");

  // Needs human
  lines.push(`## 🙋 Needs a Human Today`);
  for (const item of b.needsHuman) lines.push(`- ${item}`);
  lines.push("");

  // Agent activity
  if (b.recentAgentActivity.length > 0) {
    lines.push(`## 🤖 Recent Agent Activity`);
    for (const a of b.recentAgentActivity.slice(0, 6)) {
      lines.push(`- [${a.agent}] ${a.action}${a.detail ? ` — ${a.detail}` : ""}`);
    }
  }

  return lines.join("\n");
}
