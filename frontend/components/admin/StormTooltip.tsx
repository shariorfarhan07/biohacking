"use client";

/*
 * A minimal hover/focus tooltip for the collapsed sidebar's icon-only nav.
 * CSS-driven (opacity/transform only), appears after a short delay so it
 * never flickers during ordinary pointer travel, and is reachable by
 * keyboard since it triggers on focus-within too.
 */

import { cn } from "@/lib/utils";

export function StormTooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-x-1 -translate-y-1/2 whitespace-nowrap",
          "rounded-md border border-mist bg-elevated px-2.5 py-1.5 text-xs font-medium text-ink shadow-storm-sm",
          "opacity-0 transition duration-150 ease-out motion-reduce:transition-none",
          "delay-0 group-hover/tooltip:translate-x-0 group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300",
          "group-focus-within/tooltip:translate-x-0 group-focus-within/tooltip:opacity-100"
        )}
      >
        {label}
      </span>
    </span>
  );
}
