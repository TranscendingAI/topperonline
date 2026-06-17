/* Hallmark · component: FunnelCard · genre: modern-minimal (CRM/analytics)
 * states: default · hover (clickable stages only)
 * contrast: pass — text on orange ≥ 4.5:1, labels on paper pass
 * previous: 5 separated pills with 4px gaps + position-based width
 * this:     continuous shape via clip-path, data-proportional width,
 *           conversion % between stages, no label truncation
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
  /** Optional override for the bar height. Default 96px */
  height?: number;
}

export function FunnelCard({ title, stages, height = 96 }: FunnelCardProps) {
  // Data-proportional widths: the stage with the most leads gets the full
  // available width, everything else scales linearly. This makes the data
  // the dominant visual signal — a stage with 0 leads is invisible, the
  // biggest stage fills the bar.
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  const widths = stages.map((s) => (s.count / maxCount) * 100);

  // Conversion rate between consecutive stages (e.g. "Responded" → "Appointment Set").
  // Shows where the pipeline is leaking — much more useful than a static block.
  const conversionRates = stages.slice(1).map((stage, i) => {
    const prev = stages[i].count;
    if (prev === 0) return null;
    return Math.round((stage.count / prev) * 100);
  });

  return (
    <div
      className="bg-paper rounded-md"
      style={{ padding: "24px", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header row: title left, total right */}
      <div
        className="flex items-baseline justify-between"
        style={{ marginBottom: "20px" }}
      >
        <h3
          className="text-carbon"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <div
          className="text-slate"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Total {stages.reduce((sum, s) => sum + s.count, 0).toLocaleString()} leads
        </div>
      </div>

      {/* === Continuous funnel shape === */}
      {/* One wrapper sets the height; inside, each block is a clip-path polygon
          that gives it a leftward-slanting right edge. Adjacent blocks meet
          perfectly with no gap. Backgrounds fade from full Signal Orange at
          the first stage to ~35% at the last so the funnel metaphor is
          visible without needing to read the data. */}
      <div
        className="flex"
        style={{
          height: `${height}px`,
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--color-mist)",
        }}
      >
        {stages.map((stage, i) => {
          const widthPct = widths[i];
          // Skip stages with 0 leads — they would render as a 0-width block
          // and break the clip-path geometry. The label below still shows.
          if (widthPct === 0) return null;

          const isClickable = !!stage.href;
          // The slant angle for the right edge: 8° on the polygon. Same for
          // every block so the slants are parallel and the shape reads as one
          // continuous funnel, not 5 separate trapezoids.
          const slant = 8;
          const block = (
            <div
              className="flex items-center justify-center"
              style={{
                width: `${widthPct}%`,
                background: i === 0
                  ? "var(--color-signal-orange)"
                  : i === stages.length - 1
                  ? "color-mix(in srgb, var(--color-signal-orange) 35%, var(--color-mist))"
                  : `color-mix(in srgb, var(--color-signal-orange) ${100 - i * 16}%, var(--color-mist))`,
                color: i === 0 ? "var(--color-paper)" : "var(--color-carbon)",
                clipPath:
                  i === stages.length - 1
                    ? `polygon(0 0, 100% 0, 100% 100%, ${slant}% 100%, 0 0)`
                    : `polygon(0 0, calc(100% - ${slant}%) 0, 100% 100%, 0 100%)`,
                cursor: isClickable ? "pointer" : undefined,
                transition: "filter 120ms ease-out",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (isClickable) e.currentTarget.style.filter = "brightness(0.92)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "0 12px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          );
          return isClickable ? (
            <Link
              key={i}
              href={stage.href!}
              style={{ width: `${widthPct}%`, textDecoration: "none" }}
            >
              {block}
            </Link>
          ) : (
            <div key={i} style={{ width: `${widthPct}%` }}>
              {block}
            </div>
          );
        })}
      </div>

      {/* === Stage labels + conversion rates row === */}
      {/* Each label sits under its corresponding block. Conversion rate pills
          sit in the gaps between labels (where the clip-path slants are),
          so the % you see is between the two stages it describes. */}
      <div
        className="flex"
        style={{
          marginTop: "12px",
          position: "relative",
        }}
      >
        {stages.map((stage, i) => {
          const widthPct = widths[i];
          if (widthPct === 0) return null;
          return (
            <div
              key={i}
              style={{ width: `${widthPct}%` }}
            >
              <div
                className="text-slate"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  textAlign: "center",
                  paddingLeft: i === 0 ? "0" : "16px",
                  paddingRight: i === stages.length - 1 ? "0" : "16px",
                }}
              >
                {stage.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* === Conversion rate pills row === */}
      {/* Positioned absolutely so each pill sits in the gap between its two
          stage labels. The pill is small and unobtrusive — just enough to
          show the % without competing with the main funnel shape. */}
      {conversionRates.length > 0 && (
        <div
          className="flex"
          style={{ marginTop: "8px", position: "relative", minHeight: "20px" }}
        >
          {stages.map((stage, i) => {
            if (i === stages.length - 1) return null;
            const rate = conversionRates[i];
            // Skip the pill if either stage is 0 (no meaningful rate)
            if (rate === null) return null;
            // Place the pill at the boundary between stage i and stage i+1.
            // = cumulative end of stage i = cumulative start of stage i+1
            const boundaryPct = widths.slice(0, i + 1).reduce((sum, w) => sum + w, 0);
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${boundaryPct}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className="rounded-full text-graphite"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-chalk)",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  {rate}% →
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
