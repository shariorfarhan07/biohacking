"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";
import { authApi } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/constants";

interface NavLink {
  href: string;
  label: string;
  icon: () => JSX.Element;
}

const NAV_GROUPS: { label: string; links: NavLink[] }[] = [
  {
    label: "Coaching",
    links: [
      { href: "/dashboard", label: "Overview", icon: OverviewIcon },
      { href: "/dashboard/onboarding", label: "Onboarding", icon: OnboardingIcon },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/dashboard/billing", label: "Billing", icon: BillingIcon },
      { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
  {
    label: "Help",
    links: [{ href: "/dashboard/support", label: "Support", icon: SupportIcon }],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The drawer is a navigation surface; leaving it open across a route change
  // would cover the page the customer just asked for.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore — proceed to login regardless
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-obsidian-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-obsidian-900/50 lg:flex">
        <RailBody pathname={pathname} onLogout={handleLogout} customer={customer} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/8 bg-obsidian-900">
            <RailBody
              pathname={pathname}
              onLogout={handleLogout}
              customer={customer}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Mobile only: the rail carries the wordmark and identity on desktop,
            so a second bar up there would be an empty strip. */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/8 bg-obsidian-950/80 px-5 backdrop-blur-md lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-white/12 p-2 text-fog-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/dashboard" className="font-display text-base font-bold text-fog-100">
            {SITE_NAME}
          </Link>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
          {/*
           * `fade-rise-in` ends with animation-fill-mode: both, which leaves a
           * resolved transform on this element — and a resolved transform makes
           * it the containing block for every position:fixed descendant, which
           * would silently break any fixed overlay rendered inside a page.
           * Dropping the class on animationend removes that residue.
           */}
          <div
            key={pathname}
            className="fade-rise-in mx-auto w-full max-w-5xl"
            onAnimationEnd={(event) => event.currentTarget.classList.remove("fade-rise-in")}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function RailBody({
  pathname,
  onLogout,
  customer,
  onNavigate,
}: {
  pathname: string;
  onLogout: () => void;
  customer: { first_name: string; last_name: string; email: string } | null;
  onNavigate?: () => void;
}) {
  const initials = customer
    ? `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase()
    : "";

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-white/8 px-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="font-display text-base font-bold tracking-tight text-fog-100"
        >
          {SITE_NAME}
        </Link>
      </div>

      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="flex flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <li key={group.label}>
              <p className="px-3.5 pb-2 text-[11px] font-medium uppercase tracking-wider text-fog-500">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.links.map((link) => {
                  const active = isActive(pathname, link.href);
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "text-fog-300 hover:bg-white/5 hover:text-fog-100"
                        )}
                      >
                        <Icon />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/8 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 text-xs font-semibold text-cyan-300"
          >
            {initials}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            {customer && (
              <>
                <span className="block truncate text-sm font-medium text-fog-100">
                  {customer.first_name} {customer.last_name}
                </span>
                <span className="block truncate text-xs text-fog-500" title={customer.email}>
                  {customer.email}
                </span>
              </>
            )}
          </span>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
            className="shrink-0 rounded-lg p-2 text-fog-400 transition-colors hover:bg-white/5 hover:text-fog-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </>
  );
}

function iconProps() {
  return { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
}

function OverviewIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function OnboardingIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M21 12a8 8 0 10-3.5 6.6L21 20l-1.2-3.6c.78-1.25 1.2-2.7 1.2-4.4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BillingIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
