"use client";

/*
 * The roster. A clean data table on white — hairline rules, tabular
 * numerals, and a soft-fill row hover, the same grammar as a real product's
 * CMS or customer list.
 *
 * Below `lg` it stops being a table and becomes a stack of record cards — the
 * phone check is a designed view, not a reflowed grid with a horizontal
 * scrollbar.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { StormButton } from "./StormButton";
import { StormIcon } from "./StormIcon";
import { StormEmpty, StormLoadingAnnouncement, StormLoadingRows } from "./StormStates";

export interface StormColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  /** How this column behaves in the stacked mobile record. */
  mobile?: "lead" | "trail" | "meta" | "hide";
  width?: string;
}

interface StormRosterProps<T> {
  columns: StormColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyWord?: string;
  emptyLine?: string;
  emptyAction?: React.ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  caption: string;
  /** Where a whole row navigates to. Omit for rosters with no detail view. */
  rowHref?: (row: T) => string;
  /** Turns on the checkbox column and the bulk-selection toolbar. */
  selectable?: boolean;
  /** Rendered as the toolbar once at least one row is selected. */
  bulkActions?: (selectedRows: T[], clearSelection: () => void) => React.ReactNode;
}

export function StormRoster<T>({
  columns,
  rows,
  keyExtractor,
  loading = false,
  emptyWord = "Empty",
  emptyLine = "Nothing matches this view yet.",
  emptyAction,
  page,
  pageSize,
  total,
  onPageChange,
  caption,
  rowHref,
  selectable = false,
  bulkActions,
}: StormRosterProps<T>) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const clearSelection = () => setSelected(new Set());

  function toggleRow(id: string, event?: React.MouseEvent | React.ChangeEvent) {
    event?.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av === bv) return 0;
      const result = av > bv ? 1 : -1;
      return sortDir === "asc" ? result : -result;
    });
  }, [rows, sortKey, sortDir, columns]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleRowClick(event: React.MouseEvent, row: T) {
    // Never hijack a real link, button or text selection inside the row.
    const target = event.target as HTMLElement;
    if (target.closest("a, button, input, select, textarea")) return;
    if (window.getSelection()?.toString()) return;
    if (rowHref) router.push(rowHref(row));
  }

  /*
   * Arrow keys walk the roster without leaving the keyboard: focus moves between
   * each row's own link, so Enter still does what Enter always does. Ops staff
   * work this list all day and asked for minimal clicks per customer.
   */
  function handleRowKeys(event: React.KeyboardEvent<HTMLTableSectionElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const body = event.currentTarget;
    const targets = Array.from(body.querySelectorAll<HTMLElement>("tr a, tr button"));
    if (targets.length === 0) return;
    const current = targets.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? current + 1 : current - 1;
    targets[Math.max(0, Math.min(targets.length - 1, next))]?.focus();
  }

  if (loading) {
    return (
      <>
        <StormLoadingAnnouncement label={`Loading ${caption.toLowerCase()}`} />
        <StormLoadingRows />
      </>
    );
  }

  if (sorted.length === 0) {
    return <StormEmpty word={emptyWord} line={emptyLine} action={emptyAction} />;
  }

  const lead = columns.find((c) => c.mobile === "lead") ?? columns[0];
  const trail = columns.find((c) => c.mobile === "trail");
  const meta = columns.filter(
    (c) => c.mobile === "meta" || (!c.mobile && c !== lead && c !== trail)
  );

  const from = page && pageSize ? (page - 1) * pageSize + 1 : 1;
  const to = page && pageSize ? from + sorted.length - 1 : sorted.length;
  const hasPagination = Boolean(page && pageSize && total !== undefined && onPageChange);
  const lastPage = hasPagination ? Math.max(1, Math.ceil((total ?? 0) / (pageSize ?? 1))) : 1;

  const allSelected = selectable && sorted.length > 0 && sorted.every((row) => selected.has(keyExtractor(row)));
  const someSelected = selectable && !allSelected && sorted.some((row) => selected.has(keyExtractor(row)));
  const selectedRows = selectable ? sorted.filter((row) => selected.has(keyExtractor(row))) : [];

  function toggleAll() {
    setSelected((prev) => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      sorted.forEach((row) => next.add(keyExtractor(row)));
      return next;
    });
  }

  return (
    <div>
      {selectable && selectedRows.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-soft bg-accent-soft px-4 py-2.5">
          <p className="storm-legend font-medium text-accent">
            <span className="tnum">{selectedRows.length}</span>{" "}
            {selectedRows.length === 1 ? "row" : "rows"} selected
          </p>
          <div className="flex items-center gap-2">
            {bulkActions?.(selectedRows, clearSelection)}
            <StormButton variant="quiet" size="sm" onClick={clearSelection}>
              Clear
            </StormButton>
          </div>
        </div>
      )}

      {/* Desktop: the clean table. */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="sticky top-16 z-10 w-10 border-b border-mist bg-paper py-2.5 pr-2 align-bottom">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-mist bg-paper transition duration-150 ease-out checked:border-accent checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                  />
                </th>
              )}
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "storm-legend sticky top-16 z-10 border-b border-mist bg-paper py-2.5 pr-6 align-bottom font-medium text-rain last:pr-0",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-ink",
                          active && "font-semibold text-ink"
                        )}
                      >
                        {column.header}
                        <StormIcon name="sort" size={12} className={cn(!active && "opacity-40")} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody onKeyDown={handleRowKeys}>
            {sorted.map((row) => {
              const rowId = keyExtractor(row);
              return (
              <tr
                key={rowId}
                // Where a row has a destination, the whole row takes the click and
                // a soft grey wash on hover; the link inside stays the keyboard
                // and screen-reader target.
                onClick={rowHref ? (event) => handleRowClick(event, row) : undefined}
                className={cn(
                  "border-b border-mist transition-colors hover:bg-paper-lift",
                  rowHref && "cursor-pointer"
                )}
              >
                {selectable && (
                  <td className="w-10 py-3.5 pr-2 align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${rowId}`}
                      checked={selected.has(rowId)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => toggleRow(rowId, event)}
                      className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-mist bg-paper transition duration-150 ease-out checked:border-accent checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "storm-data py-3.5 pr-6 align-middle last:pr-0",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Below lg: one record per soft card. */}
      <ul className="flex flex-col gap-2.5 lg:hidden">
        {sorted.map((row) => {
          const rowId = keyExtractor(row);
          return (
          <li
            key={rowId}
            onClick={rowHref ? (event) => handleRowClick(event, row) : undefined}
            className={cn(
              "rounded-xl border border-mist bg-paper p-4 shadow-storm-xs transition-colors",
              rowHref && "cursor-pointer active:bg-paper-lift"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              {selectable && (
                <input
                  type="checkbox"
                  aria-label={`Select row ${rowId}`}
                  checked={selected.has(rowId)}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => toggleRow(rowId, event)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-mist bg-paper transition duration-150 ease-out checked:border-accent checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                />
              )}
              <div className="min-w-0 flex-1 text-sm font-medium text-ink">{lead.render(row)}</div>
              {trail && <div className="shrink-0 text-right">{trail.render(row)}</div>}
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-mist pt-3">
              {meta.map((column) => (
                <div key={column.key} className="contents">
                  <dt className="storm-legend pt-px text-rain">{column.header}</dt>
                  <dd className="storm-data text-ink">{column.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
          );
        })}
      </ul>

      {hasPagination && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
          <p className="storm-micro text-rain">
            <span className="tnum font-medium text-ink">
              {from}&ndash;{to}
            </span>{" "}
            of <span className="tnum font-medium text-ink">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <StormButton
              variant="quiet"
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange!(Math.max(1, (page ?? 1) - 1))}
            >
              <StormIcon name="left" size={13} />
              Previous
            </StormButton>
            <StormButton
              variant="quiet"
              size="sm"
              disabled={(page ?? 1) >= lastPage}
              onClick={() => onPageChange!((page ?? 1) + 1)}
            >
              Next
              <StormIcon name="right" size={13} />
            </StormButton>
          </div>
        </div>
      )}
    </div>
  );
}
