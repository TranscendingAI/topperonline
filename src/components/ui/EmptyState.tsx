/**
 * EmptyState — placeholder content for empty data views.
 *
 * Design rules (from DESIGN.md):
 *   - Centered in the content card
 *   - Large icon (48px, Chalk stroke)
 *   - Inter 16px Slate headline
 *   - Inter 14px Slate subtext
 *   - Optional outlined pill CTA
 *   - No illustrations
 */

import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  /** Icon (Lucide component) */
  icon: LucideIcon;
  /** Main headline */
  title: string;
  /** Supporting text */
  description?: string;
  /** Optional CTA */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  /** Compact mode for inline (e.g. table empty) */
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        padding: compact ? "32px 16px" : "48px 16px",
        gap: "12px",
      }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: compact ? "40px" : "48px",
          height: compact ? "40px" : "48px",
          background: "var(--color-fog)",
        }}
        aria-hidden="true"
      >
        <Icon
          size={compact ? 20 : 24}
          strokeWidth={1.5}
          style={{ color: "var(--color-slate)" }}
        />
      </div>
      <div
        className="text-slate"
        style={{
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: 1.2,
          maxWidth: "320px",
        }}
      >
        {title}
      </div>
      {description && (
        <div
          className="text-slate"
          style={{
            fontSize: "14px",
            lineHeight: 1.43,
            maxWidth: "400px",
          }}
        >
          {description}
        </div>
      )}
      {action && (
        <div style={{ marginTop: "8px" }}>
          <Button variant="outlined" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
