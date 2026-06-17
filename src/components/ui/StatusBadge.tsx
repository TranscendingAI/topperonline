/**
 * Status Badge — pill-shaped inline status indicator.
 *
 * Design rules (from DESIGN.md):
 *   - Pill shape (20px radius), Inter 12px weight 500
 *   - Small filled circle dot (6px) to the left of text
 *   - Background at 12% opacity of the status color
 *   - Text and dot at full status color
 *   - No border
 *
 * The 5 permitted status colors (per spec):
 *   - Green  (#22c55e): Confirmed, Paid, In Stock, Active
 *   - Amber  (#f59e0b): Pending, Awaiting, Partial
 *   - Red    (#ef4444): Overdue, Cancelled, Failed
 *   - Blue   (#3b82f6): Sent, In Transit, Scheduled
 *   - Purple (#8b5cf6): AI Active, Auto-Sent, Lead Engaged
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusVariant = "green" | "amber" | "red" | "blue" | "purple";

interface StatusBadgeProps {
  /** Variant color (defaults to "green") */
  variant?: StatusVariant;
  /** Optional leading dot (defaults to true) */
  withDot?: boolean;
  /** Badge content (the label) */
  children: ReactNode;
  /** Optional extra className for layout */
  className?: string;
}

// Background at 12% opacity of the status color.
// We use `color-mix` so this works with the design tokens and stays
// consistent if the colors ever change.
const VARIANT_BG: Record<StatusVariant, string> = {
  green: "color-mix(in srgb, var(--color-status-green) 12%, transparent)",
  amber: "color-mix(in srgb, var(--color-status-amber) 12%, transparent)",
  red: "color-mix(in srgb, var(--color-status-red) 12%, transparent)",
  blue: "color-mix(in srgb, var(--color-status-blue) 12%, transparent)",
  purple: "color-mix(in srgb, var(--color-status-purple) 12%, transparent)",
};

const VARIANT_TEXT: Record<StatusVariant, string> = {
  green: "text-status-green",
  amber: "text-status-amber",
  red: "text-status-red",
  blue: "text-status-blue",
  purple: "text-status-purple",
};

// Map variant -> CSS variable name (for the dot color)
const VARIANT_DOT_VAR: Record<StatusVariant, string> = {
  green: "var(--color-status-green)",
  amber: "var(--color-status-amber)",
  red: "var(--color-status-red)",
  blue: "var(--color-status-blue)",
  purple: "var(--color-status-purple)",
};

export function StatusBadge({
  variant = "green",
  withDot = true,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        VARIANT_TEXT[variant],
        className
      )}
      style={{
        height: "22px",
        paddingLeft: withDot ? "10px" : "12px",
        paddingRight: "12px",
        borderRadius: "20px",
        background: VARIANT_BG[variant],
        fontSize: "12px",
        lineHeight: 1,
        gap: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {withDot && (
        <span
          aria-hidden="true"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: VARIANT_DOT_VAR[variant],
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
