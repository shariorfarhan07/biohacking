"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StormButton } from "@/components/admin/StormButton";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormRing } from "@/components/admin/StormRing";
import { StormSection } from "@/components/admin/StormLayout";
import {
  StormFailure,
  StormLoadingAnnouncement,
  StormLoadingBlock,
} from "@/components/admin/StormStates";
import { adminCustomersApi, ApiError } from "@/lib/api-client";
import type { RequiresAttentionItem } from "@/lib/types";

const BUCKETS = [
  { key: "payment_pending", label: "Awaiting payment" },
  { key: "onboarding_incomplete", label: "Onboarding open" },
  { key: "everfit_pending", label: "Everfit pending" },
  { key: "everfit_active", label: "Active" },
  { key: "cancelled", label: "Cancelled" },
];

interface Overview {
  total: number;
  attention: RequiresAttentionItem[];
  buckets: { key: string; label: string; value: number }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [totalResult, attentionResult, ...bucketResults] = await Promise.all([
        adminCustomersApi.list({ page: 1, page_size: 1 }),
        adminCustomersApi.requiresAttention(),
        ...BUCKETS.map((bucket) =>
          adminCustomersApi.list({ status: bucket.key, page: 1, page_size: 1 })
        ),
      ]);
      setData({
        total: totalResult.total,
        attention: attentionResult.items,
        buckets: BUCKETS.map((bucket, index) => ({
          ...bucket,
          value: bucketResults[index].total,
        })),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the overview right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <>
        <StormLoadingAnnouncement label="Loading the overview" />
        <StormLoadingBlock />
      </>
    );
  }

  if (error || !data) {
    return <StormFailure line={error ?? undefined} onRetry={load} />;
  }

  const stuck = data.attention.length;
  const clear = stuck === 0;
  const active = data.buckets.find((b) => b.key === "everfit_active")?.value ?? 0;
  const health = data.total === 0 ? 100 : Math.round(((data.total - stuck) / data.total) * 100);
  const healthTone = health >= 90 ? "ok" : health >= 70 ? "pending" : "signal";
  const busiest = Math.max(...data.buckets.map((b) => b.value), 1);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="storm-title">Overview</h1>
          <p className="storm-prose mt-1.5 text-rain">
            {clear
              ? "Every paid customer has onboarded and provisioned cleanly."
              : `${stuck} ${stuck === 1 ? "customer needs" : "customers need"} you today.`}
          </p>
        </div>
        <Link href="/admin/customers">
          <StormButton variant="outline" size="sm">
            View roster
            <StormIcon name="right" size={13} />
          </StormButton>
        </Link>
      </header>

      {/* KPI row: the board's condition at a glance. The ring is the signature
          read — everything else is a plain number the ring's own colour
          logic is drawn from. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-mist bg-paper p-5 shadow-storm-xs">
          <StormRing value={health} tone={healthTone} />
          <div className="min-w-0">
            <p className="storm-legend text-rain">Pipeline health</p>
            <p className="storm-micro mt-0.5 text-quiet">Clear of stalls</p>
          </div>
        </div>
        <div className="rounded-xl border border-mist bg-paper p-5 shadow-storm-xs">
          <p className="storm-legend text-rain">Customers</p>
          <p className="tnum storm-monument mt-1 text-ink">{data.total}</p>
        </div>
        <div className="rounded-xl border border-mist bg-paper p-5 shadow-storm-xs">
          <p className="storm-legend text-rain">Needs attention</p>
          <p className={`tnum storm-monument mt-1 ${stuck > 0 ? "text-signal" : "text-ink"}`}>{stuck}</p>
        </div>
        <div className="rounded-xl border border-mist bg-paper p-5 shadow-storm-xs">
          <p className="storm-legend text-rain">Active in Everfit</p>
          <p className="tnum storm-monument mt-1 text-ok">{active}</p>
        </div>
      </div>

      {/* The queue itself, not a link to it. */}
      <StormSection
        heading={clear ? "Nothing needs you" : "Needs you now"}
        actions={
          !clear && (
            <Link
              href="/admin/requires-attention"
              className="storm-legend flex items-center gap-1.5 font-medium text-accent hover:text-accent-hover"
            >
              Full queue
              <StormIcon name="right" size={13} />
            </Link>
          )
        }
      >
        {clear ? (
          <p className="storm-prose text-rain">
            When a customer stalls, it appears here with the reason it stopped.
          </p>
        ) : (
          <ul className="flex flex-col">
            {data.attention.slice(0, 6).map((item) => (
              <li key={item.membership_id}>
                <Link
                  href={`/admin/customers/${item.membership_id}`}
                  className="group flex flex-col gap-2 rounded-lg px-2 py-3 transition-colors hover:bg-paper-lift sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium text-ink">{item.customer_name}</span>
                    <span className="storm-micro truncate text-quiet">{item.email}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="storm-state storm-state--attention">{item.reason}</span>
                    <StormIcon
                      name="right"
                      size={13}
                      className="text-quiet transition-colors group-hover:text-ink"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {stuck > 6 && (
          <p className="storm-micro mt-2 px-2 text-quiet">
            <span className="tnum font-medium text-ink">{stuck - 6}</span> more in the full queue.
          </p>
        )}
      </StormSection>

      {/* Distribution as proportion bars. */}
      <StormSection heading="Where everyone is">
        <ul className="flex flex-col gap-4">
          {data.buckets.map((bucket) => (
            <li key={bucket.key}>
              <Link
                href={`/admin/customers?status=${bucket.key}`}
                className="group flex items-center gap-4"
              >
                <span className="storm-data w-36 shrink-0 text-rain group-hover:text-ink">
                  {bucket.label}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-lift" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((bucket.value / busiest) * 100)}%` }}
                  />
                </span>
                <span className="tnum w-8 shrink-0 text-right text-sm font-semibold text-ink">
                  {bucket.value}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </StormSection>
    </div>
  );
}
