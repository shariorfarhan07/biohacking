"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session-context";
import { SITE_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/programmes", label: "Programmes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/results", label: "Results" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { customer, loading } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-obsidian-950/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-content items-center justify-between px-5 py-4 sm:px-8"
      >
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-fog-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
        >
          {SITE_NAME}
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-cyan-300",
                    active ? "text-fog-100" : "text-fog-300"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {!loading && customer ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-fog-300 transition-colors hover:text-fog-100"
              >
                Log in
              </Link>
              <Link href="/pricing">
                <Button size="sm">Start Your Transformation</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/12 p-2 text-fog-200 lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-white/8 px-5 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fog-200 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2.5">
            {!loading && customer ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button variant="secondary" fullWidth>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link href="/pricing" onClick={() => setOpen(false)}>
                  <Button fullWidth>Start Your Transformation</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
