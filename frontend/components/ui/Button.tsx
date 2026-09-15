"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "md" | "lg" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-400 text-obsidian-950 hover:bg-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.4)] hover:shadow-glow-cyan",
  secondary:
    "bg-white/5 text-fog-100 border border-white/15 hover:border-cyan-400/50 hover:bg-white/10",
  ghost: "bg-transparent text-fog-200 hover:bg-white/5",
  destructive: "bg-danger/90 text-obsidian-950 hover:bg-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, fullWidth, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-out",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none motion-reduce:transition-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        <span className={cn(loading && "opacity-90")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
