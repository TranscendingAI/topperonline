"use client";

/**
 * AreaChartCard — line + area chart with Signal Orange fill.
 *
 * Design rules (from DESIGN.md):
 *   - White (Paper) card, 8px radius, 24px padding, resting shadow
 *   - Card header: title in Space Grotesk 16px weight 600 Carbon
 *   - Subtitle/date range in Inter 13px Slate
 *   - Right-aligned period toggle pills (Today / Week / Month / Year), outlined 20px radius
 *   - Line stroke: Carbon at 2px
 *   - Area fill: Signal Orange at 15% opacity gradient (Signal Orange top, transparent bottom)
 *   - X-axis labels: Inter 12px Slate
 *   - Y-axis labels: Inter 12px Slate
 *   - Grid lines: 1px Chalk, horizontal only
 *   - No chart border
 *   - Tooltip: Paper card, 8px radius, Inter 13px Carbon, Graphite border 1px, resting shadow
 */

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

export interface AreaSeriesPoint {
  label: string;
  value: number;
}

interface AreaChartCardProps {
  title: string;
  data: AreaSeriesPoint[];
  /** Optional subtitle (e.g. "Last 12 months") */
  subtitle?: string;
  /** Optional period toggle options shown top-right */
  periods?: string[];
  /** Default selected period */
  defaultPeriod?: string;
  /** Format the value (default: as integer with thousands separators) */
  formatValue?: (n: number) => string;
  /** Format the label (default: identity) */
  formatLabel?: (s: string) => string;
  /** Chart height in px (default 240) */
  height?: number;
}

const defaultFormat = (n: number) => n.toLocaleString();

function CustomTooltip({ active, payload, label, formatValue }: TooltipProps<number, string> & { formatValue: (n: number) => string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "var(--color-paper)",
        border: "1px solid var(--color-graphite)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "13px",
        color: "var(--color-carbon)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ color: "var(--color-slate)", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{formatValue(payload[0].value as number)}</div>
    </div>
  );
}

export function AreaChartCard({
  title,
  data,
  subtitle,
  periods,
  defaultPeriod,
  formatValue = defaultFormat,
  height = 240,
}: AreaChartCardProps) {
  const [activePeriod, setActivePeriod] = useState(defaultPeriod ?? periods?.[0]);

  return (
    <div
      className="bg-paper rounded-md"
      style={{ padding: "24px", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: "20px", gap: "12px" }}>
        <div>
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
          {subtitle && (
            <div className="text-slate mt-4" style={{ fontSize: "13px", lineHeight: 1.2 }}>
              {subtitle}
            </div>
          )}
        </div>
        {periods && periods.length > 0 && (
          <div className="flex items-center shrink-0" style={{ gap: "4px" }}>
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePeriod(p)}
                className={cn("rounded-xl transition-colors")}
                style={{
                  height: "24px",
                  padding: "0 10px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "transparent",
                  color: activePeriod === p ? "var(--color-carbon)" : "var(--color-slate)",
                  border: activePeriod === p ? "1px solid var(--color-carbon)" : "1px solid var(--color-chalk)",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="signalOrangeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-signal-orange)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-signal-orange)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-chalk)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--color-slate)" }}
              stroke="var(--color-chalk)"
              tickLine={false}
              axisLine={false}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-slate)" }}
              stroke="var(--color-chalk)"
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => formatValue(v)}
            />
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} cursor={{ stroke: "var(--color-slate)", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-carbon)"
              strokeWidth={2}
              fill="url(#signalOrangeFill)"
              activeDot={{ r: 5, fill: "var(--color-signal-orange)", stroke: "var(--color-paper)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
