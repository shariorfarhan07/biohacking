"use client";

/*
 * The state register, and the console's one authored moment.
 *
 * A status pill never swaps in place: on a real change it fades out, the
 * word and colour update together, then it fades back in. See the
 * .storm-state-- families and .storm-swap in storm.css — colour, not ink
 * weight, carries urgency in this world.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type StateLevel = "attention" | "flight" | "settled" | "spent";

const MEMBERSHIP_STATES: Record<string, { word: string; level: StateLevel }> = {
  pending_payment: { word: "Awaiting payment", level: "flight" },
  payment_failed: { word: "Payment failed", level: "attention" },
  onboarding_pending: { word: "Onboarding open", level: "flight" },
  onboarding_complete: { word: "Onboarding done", level: "flight" },
  provisioning: { word: "Provisioning", level: "flight" },
  provisioned: { word: "Active", level: "settled" },
  provisioning_failed: { word: "Provisioning failed", level: "attention" },
  canceled: { word: "Cancelled", level: "spent" },
  cancelled: { word: "Cancelled", level: "spent" },
  refunded: { word: "Refunded", level: "spent" },
};

const EVERFIT_STATES: Record<string, { word: string; level: StateLevel }> = {
  not_started: { word: "Not started", level: "flight" },
  client_created: { word: "Client created", level: "flight" },
  programme_assigned: { word: "Programme assigned", level: "flight" },
  activated: { word: "Activated", level: "settled" },
  failed: { word: "Failed", level: "attention" },
};

const ONBOARDING_STATES: Record<string, { word: string; level: StateLevel }> = {
  not_started: { word: "Not started", level: "flight" },
  in_progress: { word: "In progress", level: "flight" },
  complete: { word: "Complete", level: "settled" },
};

const CONTACT_STATES: Record<string, { word: string; level: StateLevel }> = {
  new: { word: "New", level: "attention" },
  read: { word: "Read", level: "flight" },
  resolved: { word: "Resolved", level: "settled" },
};

const TICKET_STATES: Record<string, { word: string; level: StateLevel }> = {
  open: { word: "Open", level: "attention" },
  resolved: { word: "Resolved", level: "settled" },
};

const REGISTERS = {
  membership: MEMBERSHIP_STATES,
  everfit: EVERFIT_STATES,
  onboarding: ONBOARDING_STATES,
  contact: CONTACT_STATES,
  ticket: TICKET_STATES,
} as const;

export function resolveState(status: string, kind: keyof typeof REGISTERS = "membership") {
  const register = REGISTERS[kind];
  return (
    register[status] ?? {
      // An unmapped status still gets a readable word rather than a broken chip.
      word: status.replace(/_/g, " "),
      level: "flight" as StateLevel,
    }
  );
}

export function StormState({
  status,
  kind = "membership",
  className,
}: {
  status: string;
  kind?: keyof typeof REGISTERS;
  className?: string;
}) {
  const resolved = resolveState(status, kind);
  const [displayed, setDisplayed] = useState(resolved);
  const [phase, setPhase] = useState<"in" | "out" | null>(null);
  // A status pill arrives settled. The crossfade belongs to an actual state
  // change, not to page load — otherwise a roster of thirty statuses all
  // fade in at once and the table is unreadable for the first second.
  const previous = useRef(resolved.word);

  useEffect(() => {
    if (resolved.word === previous.current) return;

    setPhase("out");
    const timer = setTimeout(() => {
      setDisplayed(resolved);
      setPhase("in");
      previous.current = resolved.word;
    }, 130);
    return () => clearTimeout(timer);
  }, [resolved]);

  return (
    <span
      data-phase={phase ?? undefined}
      className={cn(
        "storm-state",
        `storm-state--${displayed.level}`,
        phase && "storm-swap",
        className
      )}
    >
      {displayed.word}
    </span>
  );
}
