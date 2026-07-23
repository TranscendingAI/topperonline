"use client";

/**
 * MorningBriefingCard — dashboard widget for the Briefing Agent (Phase 2c).
 *
 * Fetches /api/briefing and surfaces the "needs a human" list +
 * pipeline pulse. The full markdown briefing is what gets delivered
 * by the 6:30am scheduler; this card is the always-current in-app view.
 */

import { useEffect, useState } from "react";
import { Sun, RefreshCw, AlertTriangle, Bot } from "lucide-react";
import { Card } from "@/components/ui";

interface BriefingData {
  date: string;
  generatedAt: string;
  pipeline: {
    counts: Record<string, number>;
    totalEstimatedValue: number;
    newLeadsLast24h: number;
  };
  lowStock: Array<{ item: string; qty: number }>;
  ar: { overdue30: number; delta: number };
  needsHuman: string[];
  recentAgentActivity: Array<{ agent: string; action: string; detail: string; at: string }>;
}

export function MorningBriefingCard() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/briefing");
      const data = await res.json();
      setBriefing(data.briefing);
    } catch (e) {
      console.error("Failed to load briefing", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/briefing")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setBriefing(data.briefing);
      })
      .catch((e) => console.error("Failed to load briefing", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card padding={0}>
      <div
        className="flex items-center justify-between"
        style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-chalk)" }}
      >
        <div className="flex items-center" style={{ gap: "8px" }}>
          <Sun size={16} strokeWidth={2} style={{ color: "var(--color-signal-orange)" }} />
          <h3
            className="text-carbon"
            style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, lineHeight: 1.2 }}
          >
            Morning Briefing
          </h3>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label="Refresh briefing"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-slate)" }}
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? "animate-spin" : undefined} />
        </button>
      </div>

      <div style={{ padding: "16px 24px 20px" }}>
        {!briefing ? (
          <div className="text-slate" style={{ fontSize: "13px", padding: "12px 0" }}>
            {loading ? "Generating briefing…" : "Briefing unavailable."}
          </div>
        ) : (
          <>
            {/* Needs a human */}
            <div
              className="text-slate"
              style={{
                fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.04em", marginBottom: "8px",
              }}
            >
              Needs a human today
            </div>
            <ul className="flex flex-col" style={{ gap: "8px", marginBottom: "16px" }}>
              {briefing.needsHuman.map((item, i) => (
                <li key={i} className="flex items-start" style={{ gap: "8px" }}>
                  <AlertTriangle
                    size={13}
                    strokeWidth={2}
                    style={{ color: "var(--color-signal-orange)", flexShrink: 0, marginTop: "2px" }}
                  />
                  <span className="text-carbon" style={{ fontSize: "13px", lineHeight: 1.4 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Pipeline pulse */}
            <div
              className="rounded-md"
              style={{
                padding: "10px 12px",
                background: "var(--color-fog)",
                fontSize: "12px",
                marginBottom: briefing.recentAgentActivity.length ? "16px" : 0,
              }}
            >
              <span className="text-carbon" style={{ fontWeight: 600 }}>
                {briefing.pipeline.newLeadsLast24h} new lead{briefing.pipeline.newLeadsLast24h === 1 ? "" : "s"} in 24h
              </span>
              <span className="text-slate">
                {" "}· pipeline value ${briefing.pipeline.totalEstimatedValue.toLocaleString()} · open balance $
                {briefing.ar.overdue30.toLocaleString()}
              </span>
            </div>

            {/* Agent activity */}
            {briefing.recentAgentActivity.length > 0 && (
              <>
                <div
                  className="text-slate"
                  style={{
                    fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.04em", marginBottom: "8px",
                  }}
                >
                  Recent agent activity
                </div>
                <ul className="flex flex-col" style={{ gap: "6px" }}>
                  {briefing.recentAgentActivity.slice(0, 4).map((a, i) => (
                    <li key={i} className="flex items-start" style={{ gap: "8px" }}>
                      <Bot size={13} strokeWidth={2} className="text-slate" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span className="text-slate truncate" style={{ fontSize: "12px", lineHeight: 1.4 }}>
                        <span className="text-carbon" style={{ fontWeight: 500 }}>{a.agent}</span>
                        {" "}· {a.detail || a.action}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
