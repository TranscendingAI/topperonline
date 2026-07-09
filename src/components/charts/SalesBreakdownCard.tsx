/**
 * SalesBreakdownCard — horizontal bar-list report card.
 *
 * Used on the Dashboard for the new "Sales by Truck Brand / Model /
 * Order Type" reporting section. Shows each row as a label + proportional
 * bar + count + revenue, sorted by revenue descending (data is pre-sorted
 * by the caller).
 *
 * Kept separate from DonutChartCard/FunnelCard because this data has
 * variable-length category lists (truck models especially) where a
 * ranked bar list reads better than a pie.
 */

import { formatCurrency } from "@/lib/utils";
import type { SalesBreakdownRow } from "@/lib/mock-data";

interface SalesBreakdownCardProps {
  title: string;
  subtitle?: string;
  rows: SalesBreakdownRow[];
  /** Max rows to show (rest are summarized as "+N more"). Default: all. */
  maxRows?: number;
  barColor?: string;
}

export function SalesBreakdownCard({
  title,
  subtitle,
  rows,
  maxRows,
  barColor = "var(--color-signal-orange)",
}: SalesBreakdownCardProps) {
  const shown = maxRows ? rows.slice(0, maxRows) : rows;
  const hiddenCount = maxRows ? Math.max(0, rows.length - maxRows) : 0;
  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalCount = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div
      className="bg-paper rounded-md"
      style={{ padding: "24px", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-baseline justify-between" style={{ marginBottom: "20px" }}>
        <div className="flex items-baseline min-w-0" style={{ gap: "8px" }}>
          <h3
            className="text-carbon"
            style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, lineHeight: 1.2 }}
          >
            {title}
          </h3>
          {subtitle && (
            <span className="text-slate" style={{ fontSize: "12px", fontWeight: 500 }}>
              {subtitle}
            </span>
          )}
        </div>
        <span className="text-carbon shrink-0" style={{ fontSize: "13px", fontWeight: 600 }}>
          {formatCurrency(totalRevenue)}
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="text-slate" style={{ fontSize: "13px", textAlign: "center", padding: "24px 0" }}>
          No sales data yet.
        </div>
      ) : (
        <ul className="flex flex-col" style={{ gap: "14px" }}>
          {shown.map((row) => {
            const pct = totalRevenue > 0 ? Math.round((row.revenue / totalRevenue) * 100) : 0;
            const barWidth = Math.max(4, Math.round((row.revenue / maxRevenue) * 100));
            return (
              <li key={row.key}>
                <div
                  className="flex items-baseline justify-between"
                  style={{ marginBottom: "6px", gap: "8px" }}
                >
                  <span className="text-carbon truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {row.key}
                  </span>
                  <span className="text-slate shrink-0" style={{ fontSize: "12px" }}>
                    {row.count} sold · {formatCurrency(row.revenue)} · {pct}%
                  </span>
                </div>
                <div
                  className="rounded-full"
                  style={{ height: "6px", background: "var(--color-fog)", overflow: "hidden" }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      background: barColor,
                      transition: "width 200ms ease-out",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenCount > 0 && (
        <div className="text-slate" style={{ fontSize: "12px", marginTop: "12px" }}>
          +{hiddenCount} more · {totalCount} total units
        </div>
      )}
    </div>
  );
}
