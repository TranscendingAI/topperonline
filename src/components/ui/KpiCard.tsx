/**
 * Metric KPI Card — the dashboard stat tile.
 *
 * Design rules (from DESIGN.md):
 *   - White (Paper) card, 8px radius, 24px padding, resting elevation shadow
 *   - Top row: label in Inter 14px weight 500 Slate; small circular icon
 *     (20px) in Signal Orange or Sienna Bronze, right-aligned
 *   - Middle: value in Space Grotesk 32px weight 600 Carbon, letter-spacing -0.64px
 *   - Bottom row: delta indicator (small arrow + Inter 12px text)
 *     - Positive delta: Status Green
 *     - Negative delta: Status Red
 *     - Neutral: Slate
 *   - Followed by a short context label in Inter 12px Slate
 *     (e.g. "vs. last month", "this week")
 */

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

export type KpiDeltaDirection = "up" | "down" | "neutral";

interface KpiCardProps {
  /** Top-row label (e.g. "Today's Installs") */
  label: string;
  /** Main value to display (e.g. "12", "$48,200") */
  value: string | number;
  /** Optional icon (Lucide component) */
  icon?: LucideIcon;
  /** Icon accent color — defaults to Signal Orange */
  iconAccent?: "orange" | "bronze";
  /** Delta direction (up = positive, down = negative) */
  deltaDirection?: KpiDeltaDirection;
  /** Delta value as a string (e.g. "+12%", "-$1,200", "0%") */
  deltaValue?: string;
  /** Context label after the delta (e.g. "vs. last month") */
  contextLabel?: string;
  /** Optional href to make the card a link */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const ACCENT_VAR = {
  orange: "var(--color-signal-orange)",
  bronze: "var(--color-sienna-bronze)",
};

const DELTA_TEXT = {
  up: "text-status-green",
  down: "text-status-red",
  neutral: "text-slate",
};

const DELTA_BG = {
  up: "color-mix(in srgb, var(--color-status-green) 12%, transparent)",
  down: "color-mix(in srgb, var(--color-status-red) 12%, transparent)",
  neutral: "var(--color-fog)",
};

const DeltaIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconAccent = "orange",
  deltaDirection,
  deltaValue,
  contextLabel,
  href,
  onClick,
}: KpiCardProps) {
  const inner = (
    <>
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between" style={{ marginBottom: "12px" }}>
        <span
          className="text-slate"
          style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.2 }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: "28px",
              height: "28px",
              background: iconAccent === "orange"
                ? "color-mix(in srgb, var(--color-signal-orange) 12%, transparent)"
                : "color-mix(in srgb, var(--color-sienna-bronze) 12%, transparent)",
            }}
            aria-hidden="true"
          >
            <Icon size={16} strokeWidth={2} style={{ color: ACCENT_VAR[iconAccent] }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="text-carbon"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "32px",
          fontWeight: 600,
          lineHeight: 1.0,
          letterSpacing: "-0.64px",
          marginBottom: "12px",
        }}
      >
        {value}
      </div>

      {/* Delta + context */}
      {(deltaDirection || contextLabel) && (
        <div className="flex items-center" style={{ gap: "6px" }}>
          {deltaDirection && deltaValue && (
            <span
              className={cn("inline-flex items-center", DELTA_TEXT[deltaDirection])}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "4px",
                background: DELTA_BG[deltaDirection],
                gap: "2px",
              }}
            >
              {(() => {
                const DIcon = DeltaIcon[deltaDirection];
                return <DIcon size={12} strokeWidth={2.5} />;
              })()}
              {deltaValue}
            </span>
          )}
          {contextLabel && (
            <span
              className="text-slate"
              style={{ fontSize: "12px", lineHeight: 1.2 }}
            >
              {contextLabel}
            </span>
          )}
        </div>
      )}
    </>
  );

  // If interactive, wrap in a button-styled link/div
  if (href || onClick) {
    const interactiveProps = {
      role: "button" as const,
      tabIndex: 0,
      onClick,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      },
    };
    return (
      <Card padding={24} hoverable {...interactiveProps} className="block">
        {inner}
      </Card>
    );
  }

  return <Card padding={24}>{inner}</Card>;
}
