"use client";

/*
 * Header quick-jump: Cmd/Ctrl+K opens a command palette that filters admin
 * sections by label and, with a query typed, offers a direct jump into the
 * customer search this same query would run on the roster page. Deliberately
 * not bound to "/" — the customers page already owns that key for its own
 * inline search input, and layering a second global handler on the same key
 * would fight it.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { StormIcon } from "./StormIcon";

interface NavEntry {
  href: string;
  label: string;
  icon: Parameters<typeof StormIcon>[0]["name"];
}

export function StormCommandPalette({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: NavEntry[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => links.filter((link) => link.label.toLowerCase().includes(query.trim().toLowerCase())),
    [links, query]
  );

  const results: { key: string; label: string; sub?: string; icon: NavEntry["icon"]; go: () => void }[] =
    useMemo(() => {
      const navResults = matches.map((link) => ({
        key: link.href,
        label: link.label,
        icon: link.icon,
        go: () => router.push(link.href),
      }));
      const trimmed = query.trim();
      if (!trimmed) return navResults;
      return [
        ...navResults,
        {
          key: "search-customers",
          label: `Search customers for "${trimmed}"`,
          sub: "Name or email",
          icon: "users" as const,
          go: () => router.push(`/admin/customers?search=${encodeURIComponent(trimmed)}`),
        },
      ];
    }, [matches, query, router]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        results[activeIndex]?.go();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, results, activeIndex, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="storm-scrim-in absolute inset-0 bg-scrim backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick jump"
        className="storm-modal-in relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-mist bg-elevated shadow-storm-lg"
      >
        <div className="flex items-center gap-2.5 border-b border-mist px-4 py-3">
          <StormIcon name="search" size={16} className="shrink-0 text-quiet" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a section or search customers…"
            aria-label="Quick jump"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-quiet"
          />
          <kbd className="storm-micro shrink-0 rounded border border-mist px-1.5 py-0.5 text-quiet">Esc</kbd>
        </div>
        <ul role="listbox" className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="storm-prose px-3 py-6 text-center text-quiet">Nothing matches.</li>
          ) : (
            results.map((result, index) => (
              <li key={result.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    result.go();
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    index === activeIndex ? "bg-accent-soft text-accent" : "text-ink hover:bg-paper-lift"
                  )}
                >
                  <StormIcon name={result.icon} size={16} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{result.label}</span>
                    {result.sub && <span className="storm-micro block text-quiet">{result.sub}</span>}
                  </span>
                  <StormIcon name="right" size={13} className="shrink-0 opacity-50" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
