import type { EverfitStatus, MembershipStatus, TicketStatus } from "./types";

export const SITE_NAME = "Biohacking";

export const MEMBERSHIP_STATUS_LABELS: Record<
  MembershipStatus,
  { label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" }
> = {
  pending_payment: { label: "Payment pending", tone: "warning" },
  onboarding_pending: { label: "Onboarding pending", tone: "info" },
  onboarding_complete: { label: "Onboarding complete", tone: "success" },
  provisioning: { label: "Provisioning", tone: "info" },
  provisioned: { label: "Active", tone: "success" },
  provisioning_failed: { label: "Provisioning failed", tone: "danger" },
  payment_failed: { label: "Payment failed", tone: "danger" },
  canceled: { label: "Canceled", tone: "neutral" },
  refunded: { label: "Refunded", tone: "neutral" },
};

export const EVERFIT_STATUS_LABELS: Record<
  EverfitStatus,
  { label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" }
> = {
  not_started: { label: "Not started", tone: "neutral" },
  client_created: { label: "Client created", tone: "info" },
  programme_assigned: { label: "Programme assigned", tone: "info" },
  activated: { label: "Activated", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

export const TICKET_STATUS_LABELS: Record<
  TicketStatus,
  { label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" }
> = {
  open: { label: "Open", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
};

export const ONBOARDING_STEPS = [
  { step: 1, slug: "goals", label: "Goals" },
  { step: 2, slug: "personal", label: "Personal" },
  { step: 3, slug: "training", label: "Training" },
  { step: 4, slug: "lifestyle", label: "Lifestyle" },
  { step: 5, slug: "nutrition", label: "Nutrition" },
  { step: 6, slug: "health", label: "Health" },
  { step: 7, slug: "photos", label: "Photos" },
  { step: 8, slug: "review", label: "Review" },
] as const;

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  gbp: "£",
  usd: "$",
  eur: "€",
};

export const BILLING_INTERVAL_LABELS: Record<string, string> = {
  monthly: "Monthly",
  three_month: "3 Months",
  six_month: "6 Months",
  twelve_month: "12 Months",
};
