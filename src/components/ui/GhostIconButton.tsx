/**
 * GhostIconButton — 36-40px square icon button with Fog hover, Chalk active.
 *
 * Used for toolbar items, sidebar toggle, calendar navigation, edit/view/delete
 * row actions.
 *
 * Three sizes:
 *   - sm (32x32): for inline table row actions
 *   - md (36x36): for toolbar items, default
 *   - lg (40x40): for prominent toggles (e.g. sidebar collapse)
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GhostIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visible icon (Lucide or custom). 18-20px recommended. */
  children: ReactNode;
  /** Size — controls hit area, not the icon size (icon is set by the parent) */
  size?: "sm" | "md" | "lg";
  /** Accessible label — required for screen readers */
  "aria-label": string;
  /** Visual selected/pressed state */
  active?: boolean;
}

const SIZE_MAP: Record<NonNullable<GhostIconButtonProps["size"]>, number> = {
  sm: 32,
  md: 36,
  lg: 40,
};

export const GhostIconButton = forwardRef<HTMLButtonElement, GhostIconButtonProps>(
  function GhostIconButton(
    { children, size = "md", active, className, type = "button", disabled, ...rest },
    ref
  ) {
    const px = SIZE_MAP[size];
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          "text-graphite hover:bg-fog active:bg-chalk",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:text-slate disabled:hover:bg-transparent",
          active && "bg-chalk",
          className
        )}
        style={{
          width: `${px}px`,
          height: `${px}px`,
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
