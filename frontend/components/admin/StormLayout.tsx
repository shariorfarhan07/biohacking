/*
 * Shared page furniture for the console: page heads, section labels, fact
 * lists and the pill filter bar.
 */

import { cn } from "@/lib/utils";

export function StormPageHead({
  title,
  line,
  actions,
  above,
  className,
}: {
  title: string;
  line?: string;
  actions?: React.ReactNode;
  above?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {above}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="storm-title">{title}</h1>
          {line && <p className="storm-prose mt-1.5 text-rain">{line}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
      </div>
    </header>
  );
}

export function StormSection({
  heading,
  actions,
  children,
  className,
}: {
  heading: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-mist pb-3">
        <h2 className="storm-legend font-semibold text-ink">{heading}</h2>
        {actions}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

/**
 * Label/value pairs as a real definition list. Every value carries its word —
 * nothing on the board is unlabelled.
 */
export function StormFacts({
  items,
  columns = 1,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-10",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 border-b border-mist py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <dt className="storm-legend shrink-0 text-rain">{item.label}</dt>
          <dd className="storm-data min-w-0 text-ink sm:text-right">
            {item.value === null || item.value === undefined || item.value === "" ? (
              <span className="text-quiet">Not recorded</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Filter chips: a pill segmented control, selected reads as a soft accent fill. */
export function StormFilterBar({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={active}
            className={cn(
              "storm-legend rounded-full px-3 py-1.5 font-medium transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-rain hover:bg-paper-lift hover:text-ink"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
