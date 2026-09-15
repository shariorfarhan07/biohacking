"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { PortalPageHeader } from "@/components/dashboard/PortalPageHeader";
import { dashboardApi, ApiError } from "@/lib/api-client";
import { getStoredMembershipId } from "@/lib/local-membership";
import { ONBOARDING_STEPS, TOTAL_ONBOARDING_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DashboardResponse } from "@/lib/types";

type StepState = "done" | "current" | "upcoming";

function StepMarker({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-obsidian-950">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-cyan-400 bg-obsidian-900">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="h-6 w-6 shrink-0 rounded-full border-2 border-white/15 bg-obsidian-900"
    />
  );
}

function StepList({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-col">
      {ONBOARDING_STEPS.map((step) => {
        const state: StepState =
          step.step < currentStep ? "done" : step.step === currentStep ? "current" : "upcoming";
        return (
          <li
            key={step.slug}
            aria-current={state === "current" ? "step" : undefined}
            className="flex items-center gap-3 border-t border-white/8 py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <StepMarker state={state} />
            <span
              className={cn(
                "text-sm",
                state === "upcoming" ? "text-fog-500" : "font-medium text-fog-100"
              )}
            >
              {step.label}
            </span>
            {state === "current" && (
              <span className="ml-auto text-xs font-medium text-cyan-300">You're here</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function DashboardOnboardingPage() {
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
        setError(err instanceof ApiError ? err.message : "We couldn't load your onboarding status.");
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
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (noMembership) {
    return (
      <EmptyState
        title="You don't have an active coaching package yet"
        description="Choose a programme to get started — onboarding begins right after checkout."
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

  const { onboarding } = data;
  const storedMembershipId = getStoredMembershipId();

  if (onboarding.completed) {
    return (
      <div className="flex flex-col gap-6">
        <PortalPageHeader
          title="Onboarding"
          description="The assessment your coach used to build your programme."
        />
        <GlassPanel>
          <div className="flex items-start gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-success/20 blur-xl"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-fog-100">
                Your assessment is complete
              </h2>
              <p className="mt-2 max-w-prose text-sm text-fog-300">
                Your answers have been used to build your coaching programme. If your circumstances
                change — new injury, different schedule, and so on — just message your coach directly
                in Everfit.
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-white/8 pt-6">
            <p className="text-sm font-medium text-fog-200">What you covered</p>
            <div className="mt-4">
              <StepList currentStep={TOTAL_ONBOARDING_STEPS + 1} />
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const currentStepInfo =
    ONBOARDING_STEPS.find((s) => s.step === onboarding.current_step) ?? ONBOARDING_STEPS[0];
  const completedSteps = Math.max(0, onboarding.current_step - 1);

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="Onboarding"
        description="Finish your assessment so your coach can build a programme around you."
      />

      {storedMembershipId ? (
        <GlassPanel>
          <ProgressIndicator
            currentStep={onboarding.current_step}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            stepLabel={currentStepInfo.label}
          />

          <p className="mt-5 max-w-prose text-sm text-fog-300">
            {completedSteps === 0
              ? "You haven't started your assessment yet. It takes about ten minutes, and you can leave and come back — every section is saved as you go."
              : `You've completed ${completedSteps} of ${TOTAL_ONBOARDING_STEPS} sections. Everything you've answered so far is saved — pick up where you left off.`}
          </p>

          <div className="mt-7 border-t border-white/8 pt-6">
            <StepList currentStep={onboarding.current_step} />
          </div>

          <div className="mt-7">
            <Link href={`/onboarding/${storedMembershipId}/${currentStepInfo.slug}`}>
              <Button size="lg">
                {completedSteps === 0 ? "Start assessment" : "Resume onboarding"}
              </Button>
            </Link>
          </div>
        </GlassPanel>
      ) : (
        <EmptyState
          title="Continue your assessment"
          description="We couldn't find your onboarding link on this device. Use the link from your confirmation email, or open a ticket and we'll send you a fresh one."
          action={
            <Link href="/dashboard/support/new">
              <Button variant="secondary">Ask for a new link</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
