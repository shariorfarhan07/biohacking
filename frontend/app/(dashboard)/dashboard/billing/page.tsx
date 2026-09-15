"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PortalPageHeader } from "@/components/dashboard/PortalPageHeader";
import { dashboardApi, billingApi, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { DashboardResponse } from "@/lib/types";

const PORTAL_CAPABILITIES = [
  "Update the card your coaching is billed to",
  "Download past invoices and receipts",
  "Cancel your subscription",
];

export default function DashboardBillingPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMembership, setNoMembership] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

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
        setError(err instanceof ApiError ? err.message : "We couldn't load your billing details.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const { portal_url } = await billingApi.createPortalSession();
      window.location.href = portal_url;
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "We couldn't open the billing portal right now.",
        "error"
      );
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (noMembership) {
    return (
      <EmptyState
        title="No billing details yet"
        description="You don't have an active coaching package yet, so there's nothing to bill."
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

  const { membership } = data;
  const renewalLine = membership.next_billing_date
    ? `Renews on ${formatDate(membership.next_billing_date)}`
    : "No renewal date scheduled";

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="Billing"
        description="Your coaching package, when it renews, and where to change how it's paid for."
      />

      <GlassPanel>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-fog-500">Current package</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-fog-100">
                {membership.package_name}
              </h2>
              <StatusBadge status={membership.status} kind="membership" />
            </div>
            <p className="mt-2 text-sm text-fog-300">{renewalLine}</p>
          </div>
          <div className="shrink-0">
            <Button loading={portalLoading} onClick={handleManageBilling}>
              Manage billing
            </Button>
          </div>
        </div>

        <div className="mt-7 border-t border-white/8 pt-6">
          <p className="text-sm text-fog-300">
            Payments and invoices are handled in our secure billing portal, where you can:
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {PORTAL_CAPABILITIES.map((capability) => (
              <li key={capability} className="flex items-start gap-2.5 text-sm text-fog-300">
                <span className="mt-0.5 shrink-0 text-cyan-400" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </GlassPanel>

      <GlassPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-fog-100">
              Changing your package
            </h2>
            <p className="mt-1.5 max-w-prose text-sm text-fog-300">
              Moving to a different coaching package isn't something you can switch yourself — open
              a ticket and we'll sort it with you, so nothing in your programme gets lost in the
              move.
            </p>
          </div>
          <div className="shrink-0">
            <Link href="/dashboard/support/new">
              <Button variant="secondary">Ask about a change</Button>
            </Link>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
