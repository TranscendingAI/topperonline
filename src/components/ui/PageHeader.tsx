/**
 * PageHeader — the contextual title bar at the top of every content page.
 *
 * Design rules (from DESIGN.md):
 *   - Full width of the main content area
 *   - 32px left/right padding, 24px top/bottom padding
 *   - No background — sits directly on the Mist canvas
 *   - Left: Breadcrumb (Inter 13px Slate, "›" separators) above the page title
 *     (Space Grotesk 24px weight 600 Carbon, letter-spacing -0.48px)
 *   - Right: Primary CTA button(s) (pill-shaped)
 *   - Bottom: 1px Chalk divider, 24px margin below
 *
 * Usage:
 *   <PageHeader
 *     breadcrumbs={[{ label: "Clients" }, { label: "Acme Trucking" }]}
 *     title="Acme Trucking"
 *     actions={<Button>New Invoice</Button>}
 *   />
 */

import type { ReactNode } from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string; // optional; if missing, renders as plain text
}

interface PageHeaderProps {
  /** Breadcrumb trail (root first) */
  breadcrumbs?: BreadcrumbItem[];
  /** Page title (h1) */
  title: string;
  /** Optional right-side action cluster */
  actions?: ReactNode;
  /** Optional subtitle below the title */
  subtitle?: ReactNode;
}

export function PageHeader({ breadcrumbs, title, actions, subtitle }: PageHeaderProps) {
  return (
    <header
      className="flex items-end justify-between"
      style={{
        padding: "24px 32px",
        borderBottom: "1px solid var(--color-chalk)",
        marginBottom: "24px",
        gap: "16px",
      }}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="text-slate"
            style={{ fontSize: "13px", lineHeight: 1.2, marginBottom: "8px" }}
          >
            {breadcrumbs.map((b, i) => {
              const isLast = i === breadcrumbs.length - 1;
              const isFirst = i === 0;
              return (
                <span key={i}>
                  {!isFirst && (
                    <span aria-hidden="true" style={{ margin: "0 8px", color: "var(--color-slate)" }}>
                      ›
                    </span>
                  )}
                  {b.href && !isLast ? (
                    <Link
                      href={b.href}
                      className="hover:text-carbon transition-colors"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span style={{ color: isLast ? "var(--color-graphite)" : undefined }}>
                      {b.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
        <h1
          className="text-carbon"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "-0.48px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            className="text-slate mt-8"
            style={{ fontSize: "14px", lineHeight: 1.4 }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center shrink-0" style={{ gap: "8px" }}>
          {actions}
        </div>
      )}
    </header>
  );
}
