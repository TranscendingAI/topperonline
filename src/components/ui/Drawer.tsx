"use client";

/**
 * Drawer — slide-in panel from the right.
 *
 * Used for: Client Record (480px), Lead Detail (640px), any side-panel that
 * needs to display detailed information without leaving the list view.
 *
 * Design rules (from DESIGN.md):
 *   - Width: 480px (compact) or 640px (wide), full viewport height
 *   - Right-aligned, slides in from right edge with 220ms ease-out transform
 *   - Header: 64px tall, white Paper bg, title in Space Grotesk 20px weight 600,
 *     optional subtitle in Inter 13px Slate, close X button (40px tap target)
 *   - Body: Paper bg, scrolls independently, 24px padding
 *   - Footer (optional): 64px tall, Chalk border-top, Paper bg, action buttons
 *     right-aligned
 *   - Backdrop: Carbon at 40% opacity, fade-in 220ms, click-to-close
 *   - Escape key closes
 *   - Body scroll locked when open
 *
 * Controlled via `open` prop + `onClose` callback (parent manages state).
 * Portaled to document.body via a React portal to avoid stacking-context
 * issues with the AppShell.
 */

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Drawer width. Default 480. */
  width?: 480 | 640;
  /** Header title (Space Grotesk 20/600) */
  title?: ReactNode;
  /** Header subtitle below the title (Inter 13px Slate) */
  subtitle?: ReactNode;
  /** Header actions (right of title, before close button) */
  headerActions?: ReactNode;
  /** Body content */
  children?: ReactNode;
  /** Footer content (right-aligned actions) */
  footer?: ReactNode;
  /** Aria label for the drawer (recommended if no title) */
  ariaLabel?: string;
  /** Aria label for the close button */
  closeLabel?: string;
}

const WIDTH_VAR = {
  480: "480px",
  640: "640px",
} as const;

export function Drawer({
  open,
  onClose,
  width = 480,
  title,
  subtitle,
  headerActions,
  children,
  footer,
  ariaLabel,
  closeLabel = "Close",
}: DrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // SSR safety: only render the portal on the client (avoids "document is not defined")
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "color-mix(in srgb, var(--color-carbon) 40%, transparent)",
          animation: "drawer-fade-in 220ms ease-out forwards",
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === "string" ? title : "Drawer")}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: WIDTH_VAR[width],
          maxWidth: "100vw",
          background: "var(--color-paper)",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.10)",
          display: "flex",
          flexDirection: "column",
          animation: "drawer-slide-in 220ms ease-out forwards",
        }}
      >
        {/* Header */}
        {(title || headerActions) && (
          <div
            style={{
              height: "64px",
              flexShrink: 0,
              padding: "0 16px 0 24px",
              borderBottom: "1px solid var(--color-chalk)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div className="min-w-0 flex-1">
              {title && (
                <div
                  className="text-carbon truncate"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </div>
              )}
              {subtitle && (
                <div
                  className="text-slate truncate"
                  style={{ fontSize: "13px", lineHeight: 1.2, marginTop: "2px" }}
                >
                  {subtitle}
                </div>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center shrink-0" style={{ gap: "8px" }}>
                {headerActions}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className={cn(
                "shrink-0 flex items-center justify-center rounded-md transition-colors",
                "hover:bg-fog active:bg-chalk"
              )}
              style={{ width: "40px", height: "40px", color: "var(--color-graphite)" }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className="flex-1 min-h-0"
          style={{
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              flexShrink: 0,
              height: "64px",
              padding: "0 24px",
              borderTop: "1px solid var(--color-chalk)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            {footer}
          </div>
        )}
      </aside>

      {/* Animation keyframes — injected once per drawer mount */}
      <style>
        {`
          @keyframes drawer-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes drawer-slide-in {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}
      </style>
    </div>,
    document.body
  );
}
