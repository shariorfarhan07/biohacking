"use client";

import { useTheme, type Theme } from "@/lib/theme-context";
import { StormIcon } from "./StormIcon";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; icon: "sun" | "monitor" | "moon" }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "system", label: "System", icon: "monitor" },
  { value: "dark", label: "Dark", icon: "moon" },
];

export function StormThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex items-center gap-0.5 rounded-md border border-mist bg-paper-lift p-0.5", className)}
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex h-6 w-7 items-center justify-center rounded transition duration-150 ease-out motion-reduce:transition-none",
              active
                ? "bg-paper text-ink shadow-storm-xs"
                : "text-quiet hover:text-ink"
            )}
          >
            <StormIcon name={option.icon} size={14} />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
