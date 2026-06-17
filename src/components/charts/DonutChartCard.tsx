"use client";

/**
 * DonutChartCard — circular distribution chart with center label.
 *
 * Design rules (from DESIGN.md):
 *   - White card, 8px radius, 24px padding
 *   - Center label: Space Grotesk 32px weight 600 Carbon (primary metric)
 *   - Sub-label: Inter 13px Slate
 *   - Legend items: small 8px colored dot + Inter 13px Graphite label +
 *     Inter 13px weight 500 Carbon value, stacked vertically with 8px gaps
 *   - Primary arc: Signal Orange
 *   - Secondary arcs: Sienna Bronze, Slate, Chalk in descending importance
 */

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface DonutDatum {
  name: string;
  value: number; // percentage 0-100
  color: string; // CSS var or hex
}

interface DonutChartCardProps {
  title: string;
  data: DonutDatum[];
  /** Center label — large number/percentage */
  centerValue: string;
  /** Center sub-label below the value */
  centerLabel: string;
  height?: number;
}

export function DonutChartCard({
  title,
  data,
  centerValue,
  centerLabel,
  height = 240,
}: DonutChartCardProps) {
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
          marginBottom: "20px",
        }}
      >
        {title}
      </h3>

      <div className="flex items-center" style={{ gap: "24px" }}>
        {/* Donut chart */}
        <div style={{ width: "180px", height: `${height * 0.7}px`, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              className="text-carbon"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "32px",
                fontWeight: 600,
                lineHeight: 1.0,
                letterSpacing: "-0.64px",
              }}
            >
              {centerValue}
            </div>
            <div className="text-slate mt-4" style={{ fontSize: "13px", lineHeight: 1.2 }}>
              {centerLabel}
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="flex flex-col" style={{ gap: "8px", flex: 1, minWidth: 0 }}>
          {data.map((d) => (
            <li key={d.name} className="flex items-center" style={{ gap: "8px" }}>
              <span
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: d.color,
                  flexShrink: 0,
                }}
              />
              <span className="text-graphite flex-1 min-w-0 truncate" style={{ fontSize: "13px" }}>
                {d.name}
              </span>
              <span className="text-carbon shrink-0" style={{ fontSize: "13px", fontWeight: 500 }}>
                {d.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
