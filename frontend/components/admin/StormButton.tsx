"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "quiet" | "destructive";
type Size = "sm" | "md";

interface StormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/*
 * Rounded, soft-bordered, quietly confident — the console's buttons are
 * pressable objects, not stamped marks.
 */
const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-accent text-white border border-accent shadow-storm-xs hover:bg-accent-hover hover:border-accent-hover",
  outline:
    "bg-paper text-ink border border-mist shadow-storm-xs hover:bg-paper-lift hover:border-quiet",
  quiet: "bg-transparent text-rain border border-transparent hover:bg-paper-lift hover:text-ink",
  destructive:
    "bg-paper text-signal border border-mist shadow-storm-xs hover:bg-signal-soft hover:border-signal",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[0.8125rem] rounded-md",
  md: "px-4 py-2.5 text-sm rounded-md",
};

export const StormButton = forwardRef<HTMLButtonElement, StormButtonProps>(function StormButton(
  { variant = "solid", size = "md", loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition duration-150 ease-out motion-reduce:transition-none",
        "active:scale-[0.98] motion-reduce:active:scale-100",
        "disabled:cursor-not-allowed disabled:border-mist disabled:bg-paper-lift disabled:text-quiet disabled:shadow-none disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  );
});
