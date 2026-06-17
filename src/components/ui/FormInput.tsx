/**
 * FormInput — text, number, date, email, password, textarea, select.
 *
 * Design rules (from DESIGN.md):
 *   - Inter 14px weight 400, Carbon text, Slate placeholder
 *   - Chalk border (1px) at rest, Carbon border (1.5px) on focus
 *   - 8px radius
 *   - 12px vertical / 16px horizontal padding
 *   - Label above in Inter 13px weight 500 Carbon, 4px gap
 *   - Helper text below in Inter 12px Slate, 4px gap
 *   - Error state: Status Red border + red helper text
 *   - Height: 40px (single-line)
 *   - Selects use same treatment with a Slate chevron adornment on the right
 */

"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  useId,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  /** Hide the label visually (still readable by screen readers) */
  hideLabel?: boolean;
}

type DivProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    type?: "text" | "email" | "password" | "number" | "date" | "tel" | "url" | "search";
  };

export const FormInput = forwardRef<HTMLInputElement, DivProps>(function FormInput(
  { label, helperText, errorText, required, hideLabel, className, id, disabled, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = !!errorText;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = errorText ? `${inputId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="block">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-carbon"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: "4px",
          }}
        >
          {hideLabel ? <span className="sr-only">{label}</span> : label}
          {required && (
            <span aria-hidden="true" className="text-signal-orange" style={{ marginLeft: "2px" }}>
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={cn(
          "block w-full bg-paper text-carbon placeholder:text-slate",
          "rounded-md transition-colors",
          "focus:outline-none",
          "disabled:bg-fog disabled:cursor-not-allowed disabled:text-slate",
          hasError
            ? "border focus:border-status-red"
            : "border-chalk focus:border-carbon",
          className
        )}
        style={{
          height: "40px",
          paddingLeft: "16px",
          paddingRight: "16px",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: 1.2,
          border: hasError
            ? "1px solid var(--color-status-red)"
            : "1px solid var(--color-chalk)",
        }}
        onFocus={(e) => {
          if (!hasError) e.currentTarget.style.border = "1.5px solid var(--color-carbon)";
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = hasError
            ? "1px solid var(--color-status-red)"
            : "1px solid var(--color-chalk)";
          rest.onBlur?.(e);
        }}
        {...rest}
      />
      {(helperText || errorText) && (
        <p
          id={errorText ? errorId : helperId}
          className={cn(hasError ? "text-status-red" : "text-slate")}
          style={{ fontSize: "12px", lineHeight: 1.2, marginTop: "4px" }}
        >
          {errorText ?? helperText}
        </p>
      )}
    </div>
  );
});

type TextareaProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FormTextarea(
    { label, helperText, errorText, required, hideLabel, className, id, disabled, rows = 4, ...rest },
    ref
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hasError = !!errorText;

    return (
      <div className="block">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-carbon"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: 1.2,
              marginBottom: "4px",
            }}
          >
            {hideLabel ? <span className="sr-only">{label}</span> : label}
            {required && (
              <span aria-hidden="true" className="text-signal-orange" style={{ marginLeft: "2px" }}>
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          className={cn(
            "block w-full bg-paper text-carbon placeholder:text-slate",
            "rounded-md transition-colors",
            "focus:outline-none resize-vertical",
            "disabled:bg-fog disabled:cursor-not-allowed disabled:text-slate",
            hasError ? "border" : "border-chalk",
            className
          )}
          style={{
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.43,
            fontFamily: "inherit",
            border: hasError
              ? "1px solid var(--color-status-red)"
              : "1px solid var(--color-chalk)",
            minHeight: `${(rows ?? 4) * 24 + 24}px`,
          }}
          {...rest}
        />
        {(helperText || errorText) && (
          <p
            className={cn(hasError ? "text-status-red" : "text-slate")}
            style={{ fontSize: "12px", lineHeight: 1.2, marginTop: "4px" }}
          >
            {errorText ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

type SelectProps = BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    children: ReactNode;
  };

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(function FormSelect(
  { label, helperText, errorText, required, hideLabel, className, id, disabled, children, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = !!errorText;

  return (
    <div className="block">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-carbon"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: "4px",
          }}
        >
          {hideLabel ? <span className="sr-only">{label}</span> : label}
          {required && (
            <span aria-hidden="true" className="text-signal-orange" style={{ marginLeft: "2px" }}>
              *
            </span>
          )}
        </label>
      )}
      <div
        className={cn(
          "relative bg-paper rounded-md",
          hasError ? "" : "",
          disabled && "opacity-60"
        )}
      >
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          className={cn(
            "block w-full bg-transparent text-carbon",
            "rounded-md appearance-none cursor-pointer",
            "focus:outline-none",
            "disabled:cursor-not-allowed",
            className
          )}
          style={{
            height: "40px",
            paddingLeft: "16px",
            paddingRight: "36px",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.2,
            border: hasError
              ? "1px solid var(--color-status-red)"
              : "1px solid var(--color-chalk)",
          }}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="text-slate absolute pointer-events-none"
          style={{ right: "12px", top: "50%", transform: "translateY(-50%)" }}
          aria-hidden="true"
        />
      </div>
      {(helperText || errorText) && (
        <p
          className={cn(hasError ? "text-status-red" : "text-slate")}
          style={{ fontSize: "12px", lineHeight: 1.2, marginTop: "4px" }}
        >
          {errorText ?? helperText}
        </p>
      )}
    </div>
  );
});
