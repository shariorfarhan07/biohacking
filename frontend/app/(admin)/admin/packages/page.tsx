"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StormButton } from "@/components/admin/StormButton";
import { StormPageHead } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormFailure } from "@/components/admin/StormStates";
import { adminPackagesApi, ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { BILLING_INTERVAL_LABELS } from "@/lib/constants";
import type { Package } from "@/lib/types";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPackages(await adminPackagesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load packages right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: StormColumn<Package>[] = [
    {
      key: "name",
      header: "Package",
      mobile: "lead",
      sortValue: (row) => row.name.toLowerCase(),
      render: (row) => (
        <Link
          href={`/admin/packages/${row.id}`}
          className="font-semibold text-ink underline decoration-mist underline-offset-4 transition-colors hover:decoration-ink"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "billing_interval",
      header: "Billing",
      mobile: "meta",
      render: (row) => BILLING_INTERVAL_LABELS[row.billing_interval] ?? row.billing_interval,
    },
    {
      key: "price_cents",
      header: "Price",
      align: "right",
      mobile: "meta",
      sortValue: (row) => row.price_cents,
      render: (row) => (
        <span className="tnum font-semibold">{formatPrice(row.price_cents, row.currency)}</span>
      ),
    },
    {
      key: "stripe_price_id",
      header: "Stripe price",
      mobile: "meta",
      render: (row) =>
        row.stripe_price_id ? (
          <span className="text-rain">{row.stripe_price_id}</span>
        ) : (
          <span className="storm-state storm-state--flight">Not linked</span>
        ),
    },
    {
      key: "is_active",
      header: "Visibility",
      mobile: "trail",
      render: (row) => (
        <span className={row.is_active ? "storm-state storm-state--settled" : "storm-state storm-state--spent"}>
          {row.is_active ? "Public" : "Hidden"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Packages"
        line="What the public pricing page sells. Editing here changes the live site immediately."
        actions={
          <Link href="/admin/packages/new">
            <StormButton>New package</StormButton>
          </Link>
        }
      />

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Coaching packages"
          columns={columns}
          rows={packages}
          keyExtractor={(row) => row.id}
          rowHref={(row) => `/admin/packages/${row.id}`}
          loading={loading}
          emptyWord="None"
          emptyLine="No packages exist yet. Create one and it appears on the public pricing page."
          emptyAction={
            <Link href="/admin/packages/new">
              <StormButton variant="outline">New package</StormButton>
            </Link>
          }
        />
      )}
    </div>
  );
}
