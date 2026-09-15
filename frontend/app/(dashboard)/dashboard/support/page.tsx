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
import { ticketsApi, ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTickets(await ticketsApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your tickets right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="Support"
        description="Questions about your billing, programme, or account — a real person replies here."
        actions={
          <Link href="/dashboard/support/new">
            <Button>New ticket</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="If something's wrong with your billing, programme, or account, open a ticket and we'll reply here."
          action={
            <Link href="/dashboard/support/new">
              <Button>New ticket</Button>
            </Link>
          }
        />
      ) : (
        <GlassPanel padded={false}>
          <ul className="divide-y divide-white/8">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/dashboard/support/${ticket.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-fog-100">
                    {ticket.subject}
                  </span>
                  <span className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={ticket.status} kind="ticket" />
                    <span className="tnum whitespace-nowrap text-xs text-fog-500">
                      {formatDateTime(ticket.updated_at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </GlassPanel>
      )}
    </div>
  );
}
