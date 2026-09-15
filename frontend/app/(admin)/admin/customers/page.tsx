"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StormPageHead, StormFilterBar } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormState } from "@/components/admin/StormState";
import { StormFailure } from "@/components/admin/StormStates";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormButton } from "@/components/admin/StormButton";
import { adminCustomersApi, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { AdminCustomerListItem } from "@/lib/types";

function exportCustomersCsv(rows: AdminCustomerListItem[]) {
  const header = [
    "Customer",
    "Email",
    "Package",
    "Payment status",
    "Onboarding status",
    "Programme",
    "Everfit status",
    "Joined",
  ];
  const csvRows = rows.map((row) =>
    [
      row.customer_name,
      row.email,
      row.package_name,
      row.payment_status,
      row.onboarding_status,
      row.programme_name ?? "",
      row.everfit_status,
      row.created_at,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const FILTERS = [
  { key: "", label: "All" },
  { key: "payment_pending", label: "Awaiting payment" },
  { key: "payment_failed", label: "Payment failed" },
  { key: "onboarding_incomplete", label: "Onboarding open" },
  { key: "everfit_pending", label: "Everfit pending" },
  { key: "everfit_active", label: "Active" },
  { key: "programme_assigned", label: "Programme assigned" },
  { key: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 20;

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminCustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminCustomersApi.list({
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the roster right now.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  // "/" jumps to search from anywhere on the roster — this list is worked all
  // day, and reaching for the mouse to filter is the cost that adds up.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function setStatusFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("status", key);
    else params.delete("status");
    const query = params.toString();
    router.push(query ? `/admin/customers?${query}` : "/admin/customers");
  }

  const columns: StormColumn<AdminCustomerListItem>[] = [
    {
      key: "customer_name",
      header: "Customer",
      mobile: "lead",
      sortValue: (row) => row.customer_name.toLowerCase(),
      render: (row) => (
        <Link
          href={`/admin/customers/${row.membership_id}`}
          className="font-semibold text-ink underline decoration-mist underline-offset-4 transition-colors hover:decoration-ink"
        >
          {row.customer_name}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      mobile: "meta",
      sortValue: (row) => row.email.toLowerCase(),
      render: (row) => <span className="text-rain">{row.email}</span>,
    },
    {
      key: "package_name",
      header: "Package",
      mobile: "meta",
      render: (row) => row.package_name,
    },
    {
      key: "payment_status",
      header: "Payment",
      mobile: "trail",
      render: (row) => <StormState status={row.payment_status} kind="membership" />,
    },
    {
      key: "onboarding_status",
      header: "Onboarding",
      mobile: "meta",
      render: (row) => <StormState status={row.onboarding_status} kind="onboarding" />,
    },
    {
      key: "programme_name",
      header: "Programme",
      mobile: "meta",
      render: (row) =>
        row.programme_name ?? <span className="text-rain">Unassigned</span>,
    },
    {
      key: "everfit_status",
      header: "Everfit",
      mobile: "meta",
      render: (row) => <StormState status={row.everfit_status} kind="everfit" />,
    },
    {
      key: "created_at",
      header: "Joined",
      align: "right",
      mobile: "meta",
      sortValue: (row) => row.created_at,
      render: (row) => <span className="tnum whitespace-nowrap text-rain">{formatDate(row.created_at)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Customers"
        line="Every membership on the board, in the order they joined."
      />

      <div className="flex flex-col gap-6">
        <StormFilterBar
          label="Filter by pipeline state"
          options={FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="relative max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-quiet">
            <StormIcon name="search" size={16} />
          </span>
          <input
            ref={searchRef}
            type="search"
            aria-label="Search customers by name or email"
            placeholder="Search name or email  /"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border border-mist bg-paper py-2 pl-9 pr-3 text-sm text-ink shadow-storm-xs placeholder:text-quiet focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Customer memberships"
          columns={columns}
          rows={items}
          keyExtractor={(row) => row.membership_id}
          rowHref={(row) => `/admin/customers/${row.membership_id}`}
          loading={loading}
          emptyWord={statusFilter || debouncedSearch ? "None" : "Empty"}
          emptyLine={
            statusFilter || debouncedSearch
              ? "No customer matches this filter. Widen the search or clear the filter."
              : "No customers have joined yet. They will appear here the moment a package is bought."
          }
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          selectable
          bulkActions={(selectedRows, clear) => (
            <StormButton
              variant="outline"
              size="sm"
              onClick={() => {
                exportCustomersCsv(selectedRows);
                clear();
              }}
            >
              <StormIcon name="download" size={13} />
              Export CSV
            </StormButton>
          )}
        />
      )}
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersContent />
    </Suspense>
  );
}
