"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { JourneyTracker, type JourneyStage } from "@/components/dashboard/JourneyTracker";
import { PortalPageHeader } from "@/components/dashboard/PortalPageHeader";
import { dashboardApi, ApiError } from "@/lib/api-client";
import { cn, formatDate } from "@/lib/utils";
import { MEMBERSHIP_STATUS_LABELS, EVERFIT_STATUS_LABELS } from "@/lib/constants";
import type { DashboardResponse } from "@/lib/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMembership, setNoMembership] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoMembership(false);
    try {
      const result = await dashboardApi.get();
      setData(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNoMembership(true);
      } else {
        setError(
          err instanceof ApiError ? err.message : "We couldn't load your dashboard right now."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (noMembership) {
    return (
      <EmptyState
        title="You don't have an active coaching package yet"
        description="Choose a programme to get started — you'll create your account and complete your assessment right after checkout."
        action={
          <Link href="/pricing">
            <Button>View programmes</Button>
          </Link>
        }
      />
    );
  }

  if (error || !data) {
    return <ErrorState description={error ?? undefined} onRetry={load} />;
  }

  const { membership, onboarding, everfit, customer } = data;

  let nextAction: {
    title: string;
    description: string;
    tone: "info" | "danger";
    action?: React.ReactNode;
  } | null = null;

  if (!onboarding.completed) {
    nextAction = {
      title: "Finish your onboarding assessment",
      description:
        "Complete your onboarding questionnaire so we can build your personalised programme.",
      tone: "info",
      action: (
        <Link href="/dashboard/onboarding">
          <Button size="sm">Resume onboarding</Button>
        </Link>
      ),
    };
  } else if (everfit.status === "not_started" || everfit.status === "client_created" || everfit.status === "programme_assigned") {
    nextAction = {
      title: "We're preparing your coaching account",
      description:
        "Your onboarding is complete. We're setting up your Everfit account — this usually takes a short while.",
      tone: "info",
    };
  } else if (everfit.status === "failed") {
    nextAction = {
      title: "We hit a snag setting up your account",
      description:
        "Something went wrong provisioning your coaching account. Our team has been notified and is on it.",
      tone: "danger",
      action: (
        <Link href="/contact">
          <Button size="sm" variant="secondary">
            Contact support
          </Button>
        </Link>
      ),
    };
  } else if (membership.status === "payment_failed") {
    nextAction = {
      title: "Your last payment failed",
      description: "Please update your billing details to keep your coaching active.",
      tone: "danger",
      action: (
        <Link href="/dashboard/billing">
          <Button size="sm">Go to billing</Button>
        </Link>
      ),
    };
  }

  const paymentOk = membership.status !== "payment_failed";
  const membershipActive = paymentOk && membership.status !== "pending_payment";

  const stages: JourneyStage[] = [
    {
      label: "Membership",
      detail: MEMBERSHIP_STATUS_LABELS[membership.status]?.label ?? membership.status,
      state: !paymentOk ? "error" : membershipActive ? "done" : "current",
    },
    {
      label: "Onboarding",
      detail: onboarding.completed ? "Complete" : `Step ${onboarding.current_step} of 8`,
      state: onboarding.completed ? "done" : membershipActive ? "current" : "upcoming",
    },
    {
      label: "Coaching account",
      detail: EVERFIT_STATUS_LABELS[everfit.status]?.label ?? everfit.status,
      state:
        everfit.status === "failed"
          ? "error"
          : everfit.status === "activated"
            ? "done"
            : onboarding.completed
              ? "current"
              : "upcoming",
    },
    {
      label: "Active",
      detail: everfit.status === "activated" ? "Ready to train" : "Not yet",
      state: everfit.status === "activated" ? "done" : "upcoming",
    },
  ];

  const subtitle = nextAction
    ? "Here's what needs your attention today."
    : "Everything's on track — here's where things stand.";

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader title={`${getGreeting()}, ${customer.first_name}`} description={subtitle} />

      {nextAction && (
        <GlassPanel
          className={cn(
            nextAction.tone === "danger"
              ? "border-danger/25 bg-danger/[0.05]"
              : "border-cyan-400/25 bg-cyan-400/[0.05]"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  nextAction.tone === "danger"
                    ? "bg-danger/10 text-danger"
                    : "bg-cyan-400/10 text-cyan-300"
                )}
              >
                <AttentionIcon tone={nextAction.tone} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-fog-100">
                  {nextAction.title}
                </h2>
                <p className="mt-1 text-sm text-fog-300">{nextAction.description}</p>
              </div>
            </div>
            {nextAction.action}
          </div>
        </GlassPanel>
      )}

      <GlassPanel>
        <h2 className="font-display text-base font-semibold text-fog-100">Your coaching journey</h2>
        <div className="mt-7">
          <JourneyTracker stages={stages} />
        </div>
      </GlassPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Package" value={membership.package_name}>
          <Link href="/dashboard/billing" className="mt-2 inline-block text-sm text-cyan-300 hover:text-cyan-200">
            Manage billing
          </Link>
        </StatTile>
        <StatTile
          label="Next billing date"
          value={
            membership.next_billing_date ? formatDate(membership.next_billing_date) : "Not scheduled"
          }
        />
      </div>

      <GlassPanel>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              {everfit.status === "activated" && (
                <div aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-cyan-400/20 blur-xl" />
              )}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  everfit.status === "activated"
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "bg-white/5 text-fog-400"
                )}
              >
                <EverfitIcon />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-fog-500">Your coaching app</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-fog-100">
                {everfit.programme_name ?? "Everfit"}
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-fog-300">
                {everfit.status === "activated"
                  ? "Your coaching account is active. Open Everfit to see your programme and message your coach."
                  : "Everfit access unlocks once your coaching account has been fully activated."}
              </p>
            </div>
          </div>
          <div className="shrink-0 pl-16 sm:pl-0">
            {everfit.status === "activated" && everfit.access_url ? (
              <a href={everfit.access_url} target="_blank" rel="noopener noreferrer">
                <Button size="lg">Open Everfit</Button>
              </a>
            ) : (
              <Button size="lg" disabled title="Available once your account is activated">
                Open Everfit
              </Button>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function StatTile({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <p className="text-xs font-medium text-fog-500">{label}</p>
      <p className="tnum mt-1.5 font-display text-lg font-semibold text-fog-100">{value}</p>
      {children}
    </div>
  );
}

function AttentionIcon({ tone }: { tone: "info" | "danger" }) {
  if (tone === "danger") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.89-1.46L13.71 3.86a1 1 0 00-1.72 0z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EverfitIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
