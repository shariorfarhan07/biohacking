"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { packagesApi, ApiError } from "@/lib/api-client";
import { PricingCard } from "@/components/ui/PricingCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BILLING_INTERVAL_LABELS } from "@/lib/constants";
import type { Package } from "@/lib/types";

interface PricingBrowserProps {
  initialPackages: Package[] | null;
  initialErrorMessage: string | null;
}

const INTERVAL_ORDER = ["monthly", "three_month", "six_month", "twelve_month"];

export function PricingBrowser({ initialPackages, initialErrorMessage }: PricingBrowserProps) {
  const [packages, setPackages] = useState<Package[] | null>(initialPackages);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialErrorMessage);
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<string | null>(null);

  const activePackages = useMemo(
    () => (packages ?? []).filter((p) => p.is_active),
    [packages]
  );

  const availableIntervals = useMemo(() => {
    const set = new Set<string>(activePackages.map((p) => p.billing_interval));
    return INTERVAL_ORDER.filter((i) => set.has(i));
  }, [activePackages]);

  const effectiveInterval =
    billingInterval && availableIntervals.includes(billingInterval)
      ? billingInterval
      : availableIntervals[0] ?? null;

  const filtered = effectiveInterval
    ? activePackages.filter((p) => p.billing_interval === effectiveInterval)
    : activePackages;

  async function handleRetry() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await packagesApi.list();
      setPackages(data);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "We couldn't load pricing right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-8 h-10 w-1/2" />
            <div className="mt-8 flex flex-col gap-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage || !packages) {
    return (
      <ErrorState
        title="Pricing is temporarily unavailable"
        description={
          errorMessage ??
          "We couldn't load our coaching packages right now. Please try again in a moment."
        }
        onRetry={handleRetry}
      />
    );
  }

  if (activePackages.length === 0) {
    return (
      <ErrorState
        title="No packages available"
        description="There are no coaching packages available for purchase right now. Please check back shortly or contact us."
        onRetry={handleRetry}
        retryLabel="Refresh"
      />
    );
  }

  return (
    <div>
      {availableIntervals.length > 1 && (
        <div
          role="tablist"
          aria-label="Billing interval"
          className="mb-10 inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
        >
          {availableIntervals.map((i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={effectiveInterval === i}
              onClick={() => setBillingInterval(i)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                effectiveInterval === i
                  ? "bg-cyan-400 text-obsidian-950"
                  : "text-fog-300 hover:text-fog-100"
              )}
            >
              {BILLING_INTERVAL_LABELS[i] ?? i}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pkg, idx) => (
          <PricingCard key={pkg.id} pkg={pkg} featured={idx === 1 && filtered.length > 2} />
        ))}
      </div>
    </div>
  );
}
