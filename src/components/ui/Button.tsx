/**
 * Filled, Outlined, and Ghost pill buttons.
 *
 * Design rules (from DESIGN.md):
 *   - Filled: Carbon bg (#202020), white text, 20px radius, Inter 15px weight 600
 *   - Outlined: 1px Carbon border, transparent bg, Carbon text, 20px radius
 *   - Ghost: no border, transparent bg, Graphite icon
 *   - Special "Get Report" filled variant: Signal Orange bg + white text
 *     (the ONLY place Signal Orange is used as a button fill, per spec)
 *
 * Sizing uses inline style values from the design spec to avoid the
 * Tailwind v4 spacing scale trap (h-44 = 176px, not 44px).
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "filled" | "outlined" | "ghost" | "report";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon (Lucide or custom) */
  leadingIcon?: ReactNode;
  /** Trailing icon (Lucide or custom) */
  trailingIcon?: ReactNode;
  /** Loading state — disables the button and shows a subtle opacity */
  loading?: boolean;
}

const SIZE_MAP: Record<ButtonSize, { height: number; fontSize: number; px: number; py: number; fontWeight: 500 | 600 }> = {
  sm: { height: 32, fontSize: 13, px: 14, py: 6, fontWeight: 500 },
  md: { height: 40, fontSize: 15, px: 20, py: 10, fontWeight: 600 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "filled",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  // Variant styles
  const variantClass = (() => {
    switch (variant) {
      case "filled":
        return "bg-carbon text-paper hover:bg-carbon/85 active:bg-carbon/75";
      case "outlined":
        return "bg-transparent text-carbon border border-carbon hover:bg-fog active:bg-chalk";
      case "ghost":
        return "bg-transparent text-graphite hover:bg-fog active:bg-chalk";
      case "report":
        return "bg-signal-orange text-paper hover:bg-signal-orange/90 active:bg-signal-orange/80";
    }
  })();

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        variant === "ghost" || variant === "outlined" || variant === "report" || variant === "filled"
          ? variantClass
          : variantClass,
        isDisabled && variant === "filled" && "bg-chalk text-slate hover:bg-chalk",
        isDisabled && variant === "report" && "bg-chalk text-slate hover:bg-chalk",
        isDisabled && variant === "outlined" && "border-chalk text-slate bg-transparent hover:bg-transparent",
        isDisabled && variant === "ghost" && "text-slate hover:bg-transparent",
        className
      )}
      style={{
        height: `${s.height}px`,
        paddingLeft: `${s.px}px`,
        paddingRight: `${s.px}px`,
        paddingTop: `${s.py}px`,
        paddingBottom: `${s.py}px`,
        fontSize: `${s.fontSize}px`,
        fontWeight: s.fontWeight,
        gap: "8px",
        lineHeight: 1.2,
        letterSpacing: "normal",
        opacity: loading ? 0.7 : 1,
      }}
      {...rest}
    >
      {leadingIcon && <span style={{ display: "inline-flex", flexShrink: 0 }}>{leadingIcon}</span>}
      <span style={{ whiteSpace: "nowrap" }}>{children}</span>
      {trailingIcon && <span style={{ display: "inline-flex", flexShrink: 0 }}>{trailingIcon}</span>}
    </button>
  );
});
