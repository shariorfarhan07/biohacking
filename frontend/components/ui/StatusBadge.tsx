import { cn } from "@/lib/utils";
import { EVERFIT_STATUS_LABELS, MEMBERSHIP_STATUS_LABELS, TICKET_STATUS_LABELS } from "@/lib/constants";
import type { EverfitStatus, MembershipStatus, TicketStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-white/8 text-fog-300 border-white/15",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  info: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
};

interface StatusBadgeProps {
  status: string;
  kind?: "membership" | "everfit" | "ticket" | "generic";
  className?: string;
}

export function StatusBadge({ status, kind = "generic", className }: StatusBadgeProps) {
  let label = titleCase(status || "unknown");
  let tone: Tone = "neutral";

  if (kind === "membership" && status in MEMBERSHIP_STATUS_LABELS) {
    const entry = MEMBERSHIP_STATUS_LABELS[status as MembershipStatus];
    label = entry.label;
    tone = entry.tone;
  } else if (kind === "everfit" && status in EVERFIT_STATUS_LABELS) {
    const entry = EVERFIT_STATUS_LABELS[status as EverfitStatus];
    label = entry.label;
    tone = entry.tone;
  } else if (kind === "ticket" && status in TICKET_STATUS_LABELS) {
    const entry = TICKET_STATUS_LABELS[status as TicketStatus];
    label = entry.label;
    tone = entry.tone;
  } else if (!status) {
    label = "Unknown";
    tone = "neutral";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "danger" && "bg-danger",
          tone === "info" && "bg-cyan-400",
          tone === "neutral" && "bg-fog-400"
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
