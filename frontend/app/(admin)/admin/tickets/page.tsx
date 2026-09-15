"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StormPageHead, StormFilterBar } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormState } from "@/components/admin/StormState";
import { StormFailure } from "@/components/admin/StormStates";
import { adminTicketsApi, ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { AdminTicketListItem, TicketStatus } from "@/lib/types";

const FILTERS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

function TicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";

  const [items, setItems] = useState<AdminTicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminTicketsApi.list((statusFilter || undefined) as TicketStatus | undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load tickets right now.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function setStatusFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("status", key);
    else params.delete("status");
    const query = params.toString();
    router.push(query ? `/admin/tickets?${query}` : "/admin/tickets");
  }

  const columns: StormColumn<AdminTicketListItem>[] = [
    {
      key: "subject",
      header: "Ticket",
      mobile: "lead",
      sortValue: (row) => row.subject.toLowerCase(),
      render: (row) => (
        <Link
          href={`/admin/tickets/${row.id}`}
          className="font-semibold text-ink underline decoration-mist underline-offset-4 transition-colors hover:decoration-ink"
        >
          {row.subject}
        </Link>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      mobile: "meta",
      sortValue: (row) => row.customer_name.toLowerCase(),
      render: (row) => (
        <span className="flex flex-col">
          <span className="text-ink">{row.customer_name}</span>
          <span className="storm-micro text-quiet">{row.customer_email}</span>
        </span>
      ),
    },
    {
      key: "message_count",
      header: "Messages",
      mobile: "meta",
      align: "right",
      render: (row) => <span className="tnum text-rain">{row.message_count}</span>,
    },
    {
      key: "status",
      header: "Status",
      mobile: "trail",
      render: (row) => <StormState status={row.status} kind="ticket" />,
    },
    {
      key: "updated_at",
      header: "Updated",
      mobile: "meta",
      align: "right",
      sortValue: (row) => row.updated_at,
      render: (row) => (
        <span className="tnum whitespace-nowrap text-rain">{formatDateTime(row.updated_at)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Tickets"
        line="Support tickets opened by customers from their dashboard."
      />

      <StormFilterBar
        label="Filter by status"
        options={FILTERS}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Support tickets"
          columns={columns}
          rows={items}
          keyExtractor={(row) => row.id}
          rowHref={(row) => `/admin/tickets/${row.id}`}
          loading={loading}
          emptyWord={statusFilter ? "None" : "Empty"}
          emptyLine={
            statusFilter
              ? "No tickets match this filter."
              : "No tickets yet. They'll appear here the moment a customer opens one."
          }
        />
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={null}>
      <TicketsContent />
    </Suspense>
  );
}
