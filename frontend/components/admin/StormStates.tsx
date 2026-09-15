"use client";

/*
 * Absence and waiting, drawn in the console's own material: a quiet icon
 * mark, a short title, a line — never a blank panel and never a printed
 * monument word.
 */

import { cn } from "@/lib/utils";
import { StormButton } from "./StormButton";
import { StormIcon } from "./StormIcon";

function Mark({ tone = "quiet" }: { tone?: "quiet" | "signal" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full",
        tone === "signal" ? "bg-signal-soft text-signal" : "bg-paper-lift text-quiet"
      )}
    >
      <StormIcon name={tone === "signal" ? "alert" : "search"} size={19} />
    </div>
  );
}

export function StormEmpty({
  word,
  line,
  action,
  className,
}: {
  word: string;
  line: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center py-16 text-center sm:py-20", className)}>
      <Mark />
      <p className="storm-title mt-4 text-ink">{word}</p>
      <p className="storm-prose mx-auto mt-2 text-rain">{line}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function StormFailure({
  line = "We couldn't reach the server. The record is fine — the connection wasn't.",
  onRetry,
  className,
}: {
  line?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center py-16 text-center sm:py-20", className)}>
      <Mark tone="signal" />
      <p className="storm-title mt-4 text-ink">Stalled</p>
      <p className="storm-prose mx-auto mt-2 text-rain">{line}</p>
      {onRetry && (
        <div className="mt-6 flex justify-center">
          <StormButton variant="outline" onClick={onRetry}>
            Try again
          </StormButton>
        </div>
      )}
    </div>
  );
}

/*
 * Waiting is a skeleton shimmer in the console's own tokens — real software
 * waits like this, and this world's daily users read it as normal, not as
 * a broken page.
 */
export function StormLoadingRows({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="storm-skeleton h-11 w-full" />
      ))}
    </div>
  );
}

export function StormLoadingBlock({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <span role="status" aria-live="polite" className="sr-only">
        Loading
      </span>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className="storm-skeleton h-7 w-48" />
        <div className="storm-skeleton h-4 w-72" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="storm-skeleton h-11 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Screen-reader announcement for async regions that render visually as skeletons. */
export function StormLoadingAnnouncement({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}
