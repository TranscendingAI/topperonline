/**
 * Leads & Outreach — AI sales pipeline Kanban board.
 *
 * Per DESIGN.md Section 4. This is the most distinctive page in the CRM:
 * instead of a table, leads live in a 5-column Kanban board showing the
 * AI-driven sales pipeline.
 *
 * Stages (left to right):
 *   1. New Lead        — inbound, hasn't been contacted
 *   2. AI Contacted    — AI agent sent initial SMS
 *   3. Responded       — customer replied
 *   4. Appointment Set — booked install appointment
 *   5. Confirmed Sale  — invoice created
 *
 * Click-to-move: clicking a card opens a small popover menu with
 * "Move to ..." options for each stage. The card animates to the new column
 * (220ms ease-out). In the future this becomes drag-and-drop, but click-to-move
 * is enough for now.
 *
 * Skip for now (Scope B): per-lead drawer with Conversation/Details/Timeline
 * tabs, AI activity feed, real-time updates.
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Download,
  Search,
  Filter,
  Sparkles,
  Car,
  X,
  ArrowRight,
} from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import { FunnelCard } from "@/components/charts/FunnelCard";
import {
  LEADS,
  PIPELINE_STAGE_LABELS,
  type Lead,
  type LeadStage,
  type LeadSource,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const STAGES: LeadStage[] = [
  "new_lead",
  "ai_contacted",
  "responded",
  "appointment_set",
  "confirmed_sale",
];

const SOURCE_LABEL: Record<LeadSource, string> = {
  website: "Website",
  phone_call: "Phone",
  walk_in: "Walk-in",
  referral: "Referral",
  google_ads: "Google Ads",
  facebook: "Facebook",
};

export default function LeadsPage() {
  // Local mutable copy so click-to-move actually works (without a backend)
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const moveLead = (leadId: string, targetStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, stage: targetStage, lastContactAt: new Date().toISOString() } : l
      )
    );
    setActivePopover(null);
  };

  // Group leads by stage, applying search + source filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        l.firstName.toLowerCase().includes(q) ||
        l.lastName.toLowerCase().includes(q) ||
        l.vehicle.toLowerCase().includes(q) ||
        l.interest.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    });
  }, [leads, search, sourceFilter]);

  const leadsByStage = useMemo(() => {
    const map = new Map<LeadStage, Lead[]>();
    STAGES.forEach((s) => map.set(s, []));
    filtered.forEach((l) => map.get(l.stage)!.push(l));
    return map;
  }, [filtered]);

  // Stage totals — for the summary row at the top
  const stageTotals = useMemo(() => {
    const totals: Record<LeadStage, { count: number; value: number }> = {
      new_lead: { count: 0, value: 0 },
      ai_contacted: { count: 0, value: 0 },
      responded: { count: 0, value: 0 },
      appointment_set: { count: 0, value: 0 },
      confirmed_sale: { count: 0, value: 0 },
    };
    filtered.forEach((l) => {
      totals[l.stage].count += 1;
      totals[l.stage].value += l.estimatedValue;
    });
    return totals;
  }, [filtered]);

  // Close popover when clicking outside
  const popoverRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    if (activePopover) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [activePopover]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers CRM" }, { label: "Leads & Outreach" }]}
        title="Leads & Outreach"
        actions={
          <>
            <Button variant="outlined" leadingIcon={<Download size={16} strokeWidth={2} />}>
              Export
            </Button>
            <Button variant="filled" leadingIcon={<Plus size={16} strokeWidth={2} />}>
              New Lead
            </Button>
          </>
        }
      />

      <div style={{ padding: "0 32px 32px 32px" }}>
        {/* === Stage Totals Strip === */}
        <div
          className="grid bg-paper rounded-md"
          style={{
            gridTemplateColumns: "repeat(5, 1fr)",
            marginBottom: "16px",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {STAGES.map((stage, i) => (
            <div
              key={stage}
              style={{
                padding: "16px 20px",
                borderRight: i < STAGES.length - 1 ? "1px solid var(--color-chalk)" : undefined,
              }}
            >
              <div className="text-slate" style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {PIPELINE_STAGE_LABELS[stage]}
              </div>
              <div
                className="text-carbon mt-4"
                style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 600, lineHeight: 1.1 }}
              >
                {stageTotals[stage].count}
              </div>
              <div
                className={stage === "confirmed_sale" ? "text-signal-orange" : "text-slate"}
                style={{ fontSize: "13px", fontWeight: 500, marginTop: "2px" }}
              >
                {formatCurrency(stageTotals[stage].value)}
              </div>
            </div>
          ))}
        </div>

        {/* === Filter row === */}
        <div
          className="flex items-center bg-paper rounded-md"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            boxShadow: "var(--shadow-card)",
            gap: "8px",
          }}
        >
          <div
            className="flex items-center text-slate shrink-0"
            style={{
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              paddingRight: "8px",
              borderRight: "1px solid var(--color-chalk)",
              marginRight: "4px",
              height: "32px",
            }}
          >
            <Filter size={14} strokeWidth={2} />
            Filter
          </div>
          <button
            type="button"
            onClick={() => setSourceFilter("all")}
            className="rounded-xl transition-colors"
            style={{
              height: "28px",
              padding: "0 12px",
              fontSize: "13px",
              fontWeight: 500,
              background: sourceFilter === "all" ? "var(--color-carbon)" : "var(--color-fog)",
              color: sourceFilter === "all" ? "var(--color-paper)" : "var(--color-graphite)",
              border: sourceFilter === "all" ? "1px solid var(--color-carbon)" : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            All sources
          </button>
          {(Object.keys(SOURCE_LABEL) as LeadSource[]).map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setSourceFilter(src)}
              className="rounded-xl transition-colors"
              style={{
                height: "28px",
                padding: "0 12px",
                fontSize: "13px",
                fontWeight: 500,
                background: sourceFilter === src ? "var(--color-carbon)" : "var(--color-fog)",
                color: sourceFilter === src ? "var(--color-paper)" : "var(--color-graphite)",
                border: sourceFilter === src ? "1px solid var(--color-carbon)" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              {SOURCE_LABEL[src]}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search
              size={14}
              strokeWidth={2}
              className="text-slate"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md"
              style={{
                height: "32px",
                width: "240px",
                paddingLeft: "32px",
                paddingRight: search ? "32px" : "12px",
                border: "1px solid var(--color-chalk)",
                fontSize: "13px",
                color: "var(--color-carbon)",
                outline: "none",
                background: "var(--color-paper)",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-slate)",
                }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* === Kanban Board === */}
        {/* Scrollable container: allows horizontal scroll on narrow viewports
            without breaking the page layout. Each column is a fixed 280px so
            cards don't compress and content stays readable. */}
        <div
          style={{
            overflowX: "auto",
            marginLeft: "-32px",
            marginRight: "-32px",
            paddingLeft: "32px",
            paddingRight: "32px",
            paddingBottom: "8px",
            marginBottom: "24px",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--color-chalk) transparent",
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(5, 280px)",
              gap: "16px",
            }}
          >
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={leadsByStage.get(stage) ?? []}
              totalCount={leadsByStage.get(stage)?.length ?? 0}
              onCardClick={(id) => setActivePopover(id)}
              activePopover={activePopover}
              onMove={moveLead}
              popoverRef={popoverRef}
            />
          ))}
          </div>
        </div>

        {/* === Pipeline summary (StageCard row) === */}
        <FunnelCard
          title="Lead Pipeline"
          subtitle={`${STAGES.reduce((sum, s) => sum + stageTotals[s].count, 0)} active leads`}
          stages={STAGES.map((s) => ({
            label: PIPELINE_STAGE_LABELS[s],
            count: stageTotals[s].count,
          }))}
        />
      </div>
    </div>
  );
}

// ============================================================================
// KanbanColumn
// ============================================================================

function KanbanColumn({
  stage,
  leads,
  totalCount,
  onCardClick,
  activePopover,
  onMove,
  popoverRef,
}: {
  stage: LeadStage;
  leads: Lead[];
  totalCount: number;
  onCardClick: (id: string) => void;
  activePopover: string | null;
  onMove: (id: string, target: LeadStage) => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isConfirmed = stage === "confirmed_sale";

  return (
    <div
      className="rounded-md flex flex-col"
      style={{
        background: "var(--color-paper)",
        boxShadow: "var(--shadow-card)",
        minHeight: "200px",
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-chalk)",
        }}
      >
        <div className="flex items-center" style={{ gap: "8px" }}>
          <span
            className="rounded-full"
            style={{
              width: "8px",
              height: "8px",
              background: isConfirmed ? "var(--color-signal-orange)" : "var(--color-graphite)",
            }}
          />
          <span
            className="text-carbon"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {PIPELINE_STAGE_LABELS[stage]}
          </span>
          <span
            className="rounded-full text-graphite"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "1px 8px",
              background: "var(--color-fog)",
              minWidth: "20px",
              textAlign: "center",
            }}
          >
            {totalCount}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        className="flex flex-col"
        style={{
          gap: "8px",
          padding: "12px",
          flex: 1,
        }}
      >
        {leads.length === 0 ? (
          <div
            className="text-slate text-center"
            style={{ fontSize: "12px", padding: "20px 8px", fontStyle: "italic" }}
          >
            No leads in this stage
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              activePopover={activePopover}
              onClick={() => onCardClick(lead.id)}
              onMove={onMove}
              popoverRef={popoverRef}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LeadCard
// ============================================================================

function LeadCard({
  lead,
  activePopover,
  onClick,
  onMove,
  popoverRef,
}: {
  lead: Lead;
  activePopover: string | null;
  onClick: () => void;
  onMove: (id: string, target: LeadStage) => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isPopoverOpen = activePopover === lead.id;
  const lastMessage = lead.conversation[lead.conversation.length - 1];

  return (
    <div style={{ position: "relative" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="text-left rounded-md transition-shadow w-full"
        style={{
          padding: "12px",
          background: "var(--color-fog)",
          border: "1px solid transparent",
          cursor: "pointer",
          transition: "background 120ms, border-color 120ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-paper)";
          e.currentTarget.style.borderColor = "var(--color-chalk)";
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--color-fog)";
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Name + value */}
        <div className="flex items-start justify-between" style={{ marginBottom: "6px" }}>
          <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.2 }}>
            {lead.firstName} {lead.lastName}
          </div>
          <div
            className="text-carbon shrink-0"
            style={{ fontSize: "13px", fontWeight: 600, marginLeft: "8px" }}
          >
            {formatCurrency(lead.estimatedValue)}
          </div>
        </div>

        {/* Vehicle + interest */}
        <div className="flex items-center text-slate" style={{ gap: "4px", marginBottom: "4px" }}>
          <Car size={11} strokeWidth={2} />
          <span style={{ fontSize: "11px", lineHeight: 1.2 }}>{lead.vehicle}</span>
        </div>
        <div
          className="text-graphite truncate"
          style={{ fontSize: "11px", lineHeight: 1.2, marginBottom: "8px" }}
        >
          {lead.interest}
        </div>

        {/* Source + AI badge */}
        <div className="flex items-center justify-between">
          <span
            className="rounded-md text-graphite"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 6px",
              background: "var(--color-chalk)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {SOURCE_LABEL[lead.source]}
          </span>
          {lead.aiHandled && (
            <span
              className="flex items-center"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--color-signal-orange)",
                gap: "2px",
              }}
            >
              <Sparkles size={10} strokeWidth={2.5} />
              AI
            </span>
          )}
        </div>

        {/* Last message preview (if any) */}
        {lastMessage && (
          <div
            className="text-slate truncate"
            style={{
              fontSize: "11px",
              lineHeight: 1.2,
              marginTop: "6px",
              fontStyle: "italic",
              opacity: 0.8,
            }}
          >
            "{lastMessage.text}"
          </div>
        )}
      </div>

      {/* Move-to popover */}
      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="rounded-md"
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            marginTop: "4px",
            background: "var(--color-paper)",
            border: "1px solid var(--color-chalk)",
            boxShadow: "var(--shadow-card)",
            zIndex: 50,
            padding: "4px",
          }}
        >
          <div
            className="text-slate"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              padding: "6px 8px 4px",
            }}
          >
            Move to stage
          </div>
          {STAGES.filter((s) => s !== lead.stage).map((target) => (
            <button
              key={target}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(lead.id, target);
              }}
              className="w-full flex items-center text-carbon rounded-md transition-colors"
              style={{
                padding: "8px",
                fontSize: "12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                gap: "8px",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-fog)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span
                className="rounded-full shrink-0"
                style={{
                  width: "8px",
                  height: "8px",
                  background:
                    target === "confirmed_sale" ? "var(--color-signal-orange)" : "var(--color-graphite)",
                }}
              />
              <span style={{ flex: 1 }}>{PIPELINE_STAGE_LABELS[target]}</span>
              <ArrowRight size={12} strokeWidth={2} className="text-slate" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
