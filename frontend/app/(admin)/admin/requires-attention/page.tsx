"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StormIcon } from "@/components/admin/StormIcon";
import {
  StormFailure,
  StormLoadingAnnouncement,
  StormLoadingRows,
} from "@/components/admin/StormStates";
import { adminCustomersApi, ApiError } from "@/lib/api-client";
import type { RequiresAttentionItem } from "@/lib/types";

export default function AdminAttentionPage() {
  const [items, setItems] = useState<RequiresAttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminCustomersApi.requiresAttention();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the queue right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Grouped by why they stopped, so a run down the queue handles like with like.
  const groups = items.reduce<Record<string, RequiresAttentionItem[]>>((acc, item) => {
    (acc[item.reason] ||= []).push(item);
    return acc;
  }, {});

  const count = items.length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="storm-title">
          {loading ? "Attention" : count === 0 ? "Nobody needs you" : `${count} ${count === 1 ? "customer needs" : "customers need"} you`}
        </h1>
        <p className="storm-prose mt-1.5 text-rain">
          {loading
            ? "Checking who fell out of the pipeline."
            : count === 0
              ? "The attention queue is empty. Every paid customer has onboarded and provisioned cleanly."
              : "Grouped by where each customer stopped, oldest first."}
        </p>
      </header>

      {loading ? (
        <>
          <StormLoadingAnnouncement label="Loading the attention queue" />
          <StormLoadingRows rows={4} />
        </>
      ) : error ? (
        <StormFailure line={error} onRetry={load} />
      ) : items.length === 0 ? null : (
        <div className="flex flex-col gap-8">
          {Object.entries(groups).map(([reason, group]) => (
            <section key={reason}>
              <div className="flex items-baseline justify-between gap-4 border-b border-mist pb-2.5">
                <h2 className="storm-legend font-semibold text-ink">{reason}</h2>
                <span className="tnum storm-legend text-quiet">{group.length}</span>
              </div>
              <ul className="flex flex-col">
                {group.map((item) => (
                  <li key={item.membership_id}>
                    <Link
                      href={`/admin/customers/${item.membership_id}`}
                      className="group flex items-center justify-between gap-6 rounded-lg px-2 py-3 transition-colors hover:bg-paper-lift"
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-ink">
                          {item.customer_name}
                        </span>
                        <span className="storm-micro truncate text-quiet">{item.email}</span>
                      </span>
                      <span className="storm-legend flex shrink-0 items-center gap-1.5 font-medium text-quiet transition-colors group-hover:text-ink">
                        Open
                        <StormIcon name="right" size={13} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
