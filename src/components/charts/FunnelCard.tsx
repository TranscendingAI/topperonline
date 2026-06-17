/* Hallmark · component: FunnelCard → StageCards · genre: modern-minimal (CRM/analytics)
 * states: default · hover (clickable stages only)
 * contrast: pass — text on paper ≥ 4.5:1
 * previous: 5 tapering bars + clip-path + floating conversion pills
 * this:     5 equal-width cards in a horizontal row, connected by chevron
 *           arrows; each card has stage label, big count, conversion
 *           pill, and a Signal Orange accent on the highest-count stage
 */

import { Fragment } from "react";
import Link from "next/link";

export interface FunnelStage {
  label: string;
  count: number;
  /** Optional href to navigate to when the stage is clicked */
  href?: string;
}

interface FunnelCardProps {
  title: string;
  /** Subtitle shown under the title (e.g. "18 active leads") */
  subtitle?: string;
  stages: FunnelStage[];
}

/**
 * StageCards — horizontal row of equal-width stage cards, connected by
 * chevron arrows. Each card shows the stage name, a large count, and a
 * conversion-rate pill (e.g. "67% from prev"). The stage with the most
 * leads gets a Signal Orange accent strip on the bottom edge.
 *
 * Visual structure:
 *
 *   ┌──────┐  →  ┌──────┐  →  ┌──────┐  →  ┌──────┐  →  ┌──────┐
 *   │  NL  │     │  AIC │     │  R   │     │  AS  │     │  CS  │
 *   │  2   │     │  3   │     │  5   │     │  3   │     │  5   │
 *   │  —   │     │ 150% │     │ 167% │     │  60% │     │ 167% │
 *   └──────┘     └──────┘     └──────┘     └──────┘     └──────┘
 *                       ╲_____ orange bottom border on highest _____╱
 *
 * The conversion pill color follows standard design-system signals:
 *   - green when the rate is ≥ 80% (healthy flow)
 *   - amber when the rate is 50–79% (acceptable but dropping)
 *   - red    when the rate is < 50% (significant drop-off)
 *   - slate  when there's no prior stage (the first card)
 */
export function FunnelCard({ title, subtitle, stages }: FunnelCardProps) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  // Conversion rate from previous stage, in %.
  // null for the first stage (no previous to compare).
  // Includes stages that grew (>100%) — those are still useful signals.
  const conversionRates = stages.map((s, i) => {
    if (i === 0) return null;
    const prev = stages[i - 1].count;
    if (prev === 0) return null;
    return Math.round((s.count / prev) * 100);
  });

  return (
    <div
      className="bg-paper rounded-md"
      style={{ padding: "24px", boxShadow: "var(--shadow-card)" }}
    >
      {/* === Header: title + subtitle, single line === */}
      <div
        className="flex items-baseline"
        style={{ marginBottom: "20px" }}
      >
        <h3
          className="text-carbon"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.2,
            marginRight: "8px",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <span
            className="text-slate"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* === Stage card row === */}
      {/* Each card is equal width (1fr) and 120px tall. Cards are connected
          by chevron arrows in the gaps. The whole row uses flex with the
          chevron being a fixed 24px-wide element between cards. */}
      <div
        className="flex items-stretch"
        style={{ gap: "0" }}
      >
        {stages.map((stage, i) => {
          const isHighest = stage.count === maxCount && stage.count > 0;
          const rate = conversionRates[i];
          const isClickable = !!stage.href;
          // Determine conversion pill color
          let pillTone: "green" | "amber" | "red" | "slate" = "slate";
          if (rate === null) pillTone = "slate";
          else if (rate >= 80) pillTone = "green";
          else if (rate >= 50) pillTone = "amber";
          else pillTone = "red";

          const card = (
            <div
              className="relative bg-paper"
              style={{
                flex: 1,
                height: "120px",
                border: "1px solid var(--color-chalk)",
                borderRadius: "8px",
                padding: "12px 12px 14px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: isClickable ? "pointer" : undefined,
                transition: "box-shadow 120ms ease-out, transform 120ms ease-out",
                // The Signal Orange accent strip is drawn as a border on
                // the bottom edge using a 3px border-color on the active
                // stage. We layer the chalk border on top so the active
                // stage shows orange, others stay chalk.
                borderColor: isHighest
                  ? "var(--color-chalk)"
                  : "var(--color-chalk)",
                borderBottom: isHighest
                  ? "3px solid var(--color-signal-orange)"
                  : "1px solid var(--color-chalk)",
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.boxShadow = "var(--shadow-card-hover, 0 4px 12px rgba(32, 32, 32, 0.08))";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable) {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {/* Stage label — top, Inter 13px Slate, centered */}
              <div
                className="text-slate uppercase"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {stage.label}
              </div>

              {/* Big count — center, Space Grotesk 32/600 Carbon */}
              <div
                className="text-carbon"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "32px",
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                }}
              >
                {stage.count}
              </div>

              {/* Conversion pill — bottom, color-coded */}
              {rate !== null ? (
                <div
                  className={`rounded-full text-${pillTone === "slate" ? "slate" : `status-${pillTone}`}`}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    background: pillTone === "slate"
                      ? "var(--color-fog)"
                      : `color-mix(in srgb, var(--color-status-${pillTone}) 12%, transparent)`,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rate}% from prev
                </div>
              ) : (
                <div
                  className="text-slate"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    fontStyle: "italic",
                    opacity: 0.6,
                    lineHeight: 1.3,
                  }}
                >
                  top of funnel
                </div>
              )}
            </div>
          );

          return (
            <Fragment key={i}>
              {/* The card itself, optionally wrapped in a Link */}
              {isClickable ? (
                <Link
                  href={stage.href!}
                  style={{ flex: 1, textDecoration: "none" }}
                >
                  {card}
                </Link>
              ) : (
                <div style={{ flex: 1 }}>{card}</div>
              )}

              {/* Chevron arrow connector — only between cards, not after the last one */}
              {i < stages.length - 1 && <Chevron key={`chev-${i}`} />}
            </Fragment>
          );
        })}
      </div>

      {/* Hidden totals for screen readers / future use */}
      <span className="sr-only">Total {total} leads across {stages.length} stages</span>
    </div>
  );
}

// ============================================================================
// Chevron — the connector between stage cards
// ============================================================================

function Chevron() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 flex items-center justify-center text-chalk"
      style={{
        width: "24px",
        // Vertically center the chevron on the card row
        alignSelf: "center",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 3L11 8L6 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
