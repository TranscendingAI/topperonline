/**
 * SearchInput — inline search within list pages and the global header.
 *
 * Design rules (from DESIGN.md):
 *   - Inter 14px weight 400, Carbon text
 *   - Chalk border (1px) at rest, Carbon border on focus
 *   - 8px radius
 *   - 12px vertical / 16px horizontal padding
 *   - Search icon (Slate, 16px) as left adornment
 *   - Clear × button (Ghost, 16px) appears on right when value is present
 *   - Height: 40px
 */

"use client";

import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { value: controlledValue, defaultValue, onChange, onClear, placeholder = "Search…", className, disabled, ...rest },
    ref
  ) {
    const [internal, setInternal] = useState(defaultValue ?? "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internal;
    const [focused, setFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternal(e.target.value);
      onChange?.(e.target.value);
    };

    const handleClear = () => {
      if (!isControlled) setInternal("");
      onChange?.("");
      onClear?.();
    };

    return (
      <div
        className={cn(
          "inline-flex items-center bg-paper rounded-md transition-colors",
          focused ? "border-carbon" : "border-chalk",
          disabled && "opacity-60",
          className
        )}
        style={{
          height: "40px",
          paddingLeft: "12px",
          paddingRight: value ? "8px" : "12px",
          border: focused ? "1.5px solid var(--color-carbon)" : "1px solid var(--color-chalk)",
          gap: "8px",
          minWidth: "200px",
        }}
      >
        <Search
          size={16}
          strokeWidth={2}
          className="text-slate shrink-0"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          defaultValue={undefined}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-carbon placeholder:text-slate"
          style={{
            fontSize: "14px",
            fontWeight: 400,
            border: "none",
            outline: "none",
            lineHeight: 1.2,
            minWidth: 0,
          }}
          {...rest}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-md flex items-center justify-center text-graphite hover:bg-fog active:bg-chalk transition-colors"
            style={{ width: "24px", height: "24px" }}
            aria-label="Clear search"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    );
  }
);
