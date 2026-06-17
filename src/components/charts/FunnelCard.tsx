/**
 * FunnelCard — horizontal AI pipeline funnel.
 *
 * Design rules (from DESIGN.md):
 *   - White card, 8px radius, 24px padding
 *   - Horizontal series of trapezoidal stage blocks, left-to-right,
 *     shrinking in width (each stage ~80% the width of the previous)
 *   - Stage colors: Signal Orange (widest, first stage) fading through
 *     70%, 50%, 30% for subsequent stages
 *   - Each stage block: stage name in Inter 12px weight 500 white (centered),
 *     count in Space Grotesk 16px weight 600 white (centered below name)
 *   - Stage labels beneath the funnel: Inter 12px Slate
 *   - Gap between stages: 4px
 */

import Link from "next/link";

export interface FunnelStage {
  label: string;
  count: number;
  /** Optional href to navigate to when the stage is clicked */
  href?: string;
}

interface FunnelCardProps {
  title: string;
  stages: FunnelStage[];
  height?: number;
}

export function FunnelCard({ title, stages, height = 140 }: FunnelCardProps) {
  // Compute proportional widths (first stage = 100%, each subsequent = 80%)
  const widths: number[] = [];
  let w = 100;
  for (let i = 0; i < stages.length; i++) {
    widths.push(w);
    w = w * 0.8;
  }
  const totalWidth = widths.reduce((sum, x) => sum + x, 0);
  // Normalize so the longest is `maxBlockPct` of the available width
  const maxBlockPct = 100;
  const scale = maxBlockPct / totalWidth;

  return (
    <div
      className="bg-paper rounded-md"
      style={{ padding: "24px", boxShadow: "var(--shadow-card)" }}
    >
      <h3
        className="text-carbon"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: "16px",
        }}
      >
        {title}
      </h3>

      {/* Funnel blocks */}
      <div
        className="flex items-stretch"
        style={{
          gap: "4px",
          height: `${height * 0.6}px`,
        }}
      >
        {stages.map((stage, i) => {
          const opacity = i === 0 ? 1 : 1 - i * 0.2; // 1, 0.8, 0.6, 0.4, 0.2
          const widthPct = widths[i] * scale;
          const isClickable = !!stage.href;
          const inner = (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: `${widthPct}%`,
                background: i === 0
                  ? "var(--color-signal-orange)"
                  : `color-mix(in srgb, var(--color-signal-orange) ${100 - i * 15}%, transparent)`,
                borderRadius: "4px",
                color: "var(--color-paper)",
                padding: "8px",
                opacity: 1, // opacity baked into the color-mix above
                cursor: isClickable ? "pointer" : undefined,
                textAlign: "center",
                transition: "filter 120ms ease-out",
              }}
              onMouseEnter={(e) => {
                if (isClickable) e.currentTarget.style.filter = "brightness(0.92)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                {stage.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  marginTop: "2px",
                }}
              >
                {stage.count}
              </div>
            </div>
          );
          return isClickable ? (
            <Link key={i} href={stage.href!} style={{ width: `${widthPct}%`, textDecoration: "none" }}>
              {inner}
            </Link>
          ) : (
            <div key={i} style={{ width: `${widthPct}%` }}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* Stage labels below (already shown inside blocks, but also a fallback
          for very narrow blocks where the label might be truncated) */}
      <div className="flex items-stretch" style={{ gap: "4px", marginTop: "12px" }}>
        {stages.map((s, i) => (
          <div
            key={i}
            className="text-slate"
            style={{
              width: `${widths[i] * scale}%`,
              fontSize: "12px",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {/* redundant label, useful for accessibility/screen readers */}
            <span className="sr-only">{s.label}: {s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
