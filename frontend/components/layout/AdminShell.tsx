"use client";

/*
 * The admin shell: a collapsible left rail grouped into Pipeline / Catalog /
 * Support, beside a sticky header carrying breadcrumbs, quick-jump search,
 * a notifications bell, the theme switch and the user menu. The console's
 * identity lives in these precise details, not in loud chrome.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAdminSession } from "@/lib/session-context";
import { adminAuthApi, adminCustomersApi } from "@/lib/api-client";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormTooltip } from "@/components/admin/StormTooltip";
import { StormThemeSwitch } from "@/components/admin/StormThemeSwitch";
import { StormPopover } from "@/components/admin/StormPopover";
import { StormCommandPalette } from "@/components/admin/StormCommandPalette";
import type { RequiresAttentionItem } from "@/lib/types";

type IconName = Parameters<typeof StormIcon>[0]["name"];

interface NavLink {
  href: string;
  label: string;
  icon: IconName;
  badge?: boolean;
}

interface NavGroup {
  label: string;
  links: NavLink[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Pipeline",
    links: [
      { href: "/admin", label: "Overview", icon: "grid" },
      { href: "/admin/requires-attention", label: "Attention", icon: "alert", badge: true },
      { href: "/admin/customers", label: "Customers", icon: "users" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { href: "/admin/packages", label: "Packages", icon: "box" },
      { href: "/admin/programmes", label: "Programmes", icon: "dumbbell" },
      { href: "/admin/assignment-rules", label: "Rules", icon: "sliders" },
      { href: "/admin/discount-codes", label: "Discounts", icon: "tag" },
    ],
  },
  {
    label: "Content",
    links: [{ href: "/admin/blog", label: "Blog", icon: "edit" }],
  },
  {
    label: "Support",
    links: [
      { href: "/admin/tickets", label: "Tickets", icon: "ticket" },
      { href: "/admin/contact-messages", label: "Messages", icon: "mail" },
    ],
  },
];

const ALL_LINKS = NAV_GROUPS.flatMap((group) => group.links);

const DETAIL_LABELS: Record<string, string> = {
  customers: "Customer",
  packages: "Package",
  blog: "Post",
  tickets: "Ticket",
};

const SIDEBAR_COLLAPSE_KEY = "biohacking-admin-sidebar-collapsed";

function findActiveLink(pathname: string): NavLink | undefined {
  return ALL_LINKS.find((link) =>
    link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)
  );
}

function buildBreadcrumbs(pathname: string, activeLink: NavLink | undefined) {
  if (!activeLink) return [{ label: "Admin" }];
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];
  const isDetail = segments.length > 1;
  crumbs.push({ label: activeLink.label, href: isDetail ? activeLink.href : undefined });
  if (isDetail) {
    crumbs.push({ label: DETAIL_LABELS[segments[0]] ?? "Detail" });
  }
  return crumbs;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin } = useAdminSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [attention, setAttention] = useState<RequiresAttentionItem[] | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1");
    } catch {
      // Storage blocked — the rail just starts expanded.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // Preference just won't survive a reload — not worth surfacing.
      }
      return next;
    });
  }

  const loadAttention = useCallback(async () => {
    try {
      const result = await adminCustomersApi.requiresAttention();
      setAttention(result.items);
    } catch {
      // The badge and bell are ambient readouts; a failed poll leaves them
      // quiet rather than throwing an error into the operator's way.
      setAttention(null);
    }
  }, []);

  useEffect(() => {
    loadAttention();
  }, [loadAttention, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleLogout() {
    try {
      await adminAuthApi.logout();
    } catch {
      // Logging out locally matters more than the round trip succeeding.
    }
    router.push("/admin/login");
    router.refresh();
  }

  const attentionCount = attention?.length ?? null;
  const activeLink = findActiveLink(pathname);
  const breadcrumbs = buildBreadcrumbs(pathname, activeLink);

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile bar. Desktop keeps everything in the rail + header. */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-mist bg-paper/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[0.6rem] font-bold text-white">
            B
          </span>
          <span className="text-sm font-semibold text-ink">Biohacking</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="rounded-md p-2 text-rain transition duration-150 ease-out hover:bg-paper-lift active:scale-95 motion-reduce:transition-none"
          >
            <StormIcon name="search" size={18} />
          </button>
          {attentionCount !== null && attentionCount > 0 && (
            <Link
              href="/admin/requires-attention"
              className="storm-state storm-state--attention"
            >
              {attentionCount} need you
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="rounded-md p-2 text-rain transition duration-150 ease-out hover:bg-paper-lift active:scale-95 motion-reduce:transition-none"
          >
            <StormIcon name="menu" size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="storm-scrim-in absolute inset-0 bg-scrim"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="storm-drawer-in relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-mist bg-paper shadow-storm-lg">
            <div className="flex h-14 items-center justify-between border-b border-mist px-5">
              <span className="text-sm font-semibold text-ink">Biohacking Admin</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1.5 text-rain transition duration-150 ease-out hover:bg-paper-lift active:scale-95 motion-reduce:transition-none"
              >
                <StormIcon name="close" size={18} />
              </button>
            </div>
            <RailBody
              pathname={pathname}
              attentionCount={attentionCount}
              email={admin?.email}
              role={admin?.role}
              onLogout={handleLogout}
              collapsed={false}
              showThemeSwitch
            />
          </div>
        </div>
      )}

      {/* Desktop rail. */}
      <aside
        className={cn(
          "storm-rail fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-mist bg-paper lg:flex",
          collapsed ? "w-[4.5rem]" : "w-56"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-mist px-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
              B
            </span>
            {!collapsed && (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold text-ink">Biohacking</span>
                <span className="storm-micro text-quiet">Admin</span>
              </span>
            )}
          </Link>
        </div>
        <RailBody
          pathname={pathname}
          attentionCount={attentionCount}
          email={admin?.email}
          role={admin?.role}
          onLogout={handleLogout}
          collapsed={collapsed}
          showThemeSwitch={false}
        />
        <div className="border-t border-mist p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-rain transition duration-150 ease-out hover:bg-paper-lift hover:text-ink motion-reduce:transition-none",
              collapsed && "justify-center"
            )}
          >
            <StormIcon
              name="panel"
              size={16}
              className={cn("shrink-0 transition-transform duration-200", collapsed && "rotate-180")}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Header + page content, offset by the rail's current width. */}
      <div
        className={cn(
          "transition-[padding-left] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-56"
        )}
      >
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between gap-4 border-b border-mist bg-paper/95 px-6 backdrop-blur lg:flex lg:px-8">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && (
                  <StormIcon name="right" size={12} className="shrink-0 text-quiet" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="storm-legend truncate text-rain transition-colors hover:text-ink"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="storm-legend truncate font-semibold text-ink">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2.5 rounded-md border border-mist bg-paper px-3 py-1.5 text-quiet shadow-storm-xs transition duration-150 ease-out hover:border-quiet hover:text-rain active:scale-[0.98] motion-reduce:transition-none"
            >
              <StormIcon name="search" size={14} />
              <span className="storm-micro">Search</span>
              <kbd className="storm-micro rounded border border-mist bg-paper-lift px-1 text-quiet">
                &#8984;K
              </kbd>
            </button>

            <StormPopover
              align="right"
              trigger={({ toggle, open }) => (
                <button
                  type="button"
                  data-storm-trigger
                  onClick={toggle}
                  aria-label="Notifications"
                  aria-expanded={open}
                  className="relative rounded-md p-2 text-rain transition duration-150 ease-out hover:bg-paper-lift active:scale-95 motion-reduce:transition-none"
                >
                  <StormIcon name="bell" size={17} />
                  {attentionCount !== null && attentionCount > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
                  )}
                </button>
              )}
              panelClassName="w-80"
            >
              {(close) => (
                <div>
                  <div className="border-b border-mist px-4 py-3">
                    <p className="storm-legend font-semibold text-ink">Needs attention</p>
                  </div>
                  {!attention || attention.length === 0 ? (
                    <p className="storm-prose px-4 py-6 text-center text-quiet">
                      Nothing needs you right now.
                    </p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto py-1.5">
                      {attention.slice(0, 6).map((item) => (
                        <li key={item.membership_id}>
                          <Link
                            href={`/admin/customers/${item.membership_id}`}
                            onClick={close}
                            className="flex flex-col gap-0.5 px-4 py-2.5 transition-colors hover:bg-paper-lift"
                          >
                            <span className="truncate text-sm font-medium text-ink">
                              {item.customer_name}
                            </span>
                            <span className="storm-micro text-signal">{item.reason}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t border-mist p-2">
                    <Link
                      href="/admin/requires-attention"
                      onClick={close}
                      className="storm-legend flex items-center justify-center gap-1.5 rounded-md py-2 font-medium text-accent transition-colors hover:bg-accent-soft"
                    >
                      View full queue
                      <StormIcon name="right" size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </StormPopover>

            <StormThemeSwitch />

            <StormPopover
              align="right"
              trigger={({ toggle, open }) => (
                <button
                  type="button"
                  data-storm-trigger
                  onClick={toggle}
                  aria-label="Account menu"
                  aria-expanded={open}
                  className="flex items-center gap-2 rounded-md p-1 pr-2 transition duration-150 ease-out hover:bg-paper-lift active:scale-[0.98] motion-reduce:transition-none"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-lift text-xs font-semibold text-rain">
                    {(admin?.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <StormIcon name="down" size={13} className="text-quiet" />
                </button>
              )}
              panelClassName="w-64"
            >
              {(close) => (
                <div>
                  <div className="border-b border-mist px-4 py-3">
                    {admin?.email && (
                      <p className="truncate text-sm font-medium text-ink" title={admin.email}>
                        {admin.email}
                      </p>
                    )}
                    {admin?.role && <p className="storm-micro text-quiet">{admin.role}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      handleLogout();
                    }}
                    className="storm-data flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-ink transition-colors hover:bg-paper-lift"
                  >
                    <StormIcon name="logout" size={15} className="text-quiet" />
                    Sign out
                  </button>
                </div>
              )}
            </StormPopover>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/*
           * The animation's `both` fill-mode keeps a computed `transform`
           * (even a resolved-identity translateY(0)) on this element forever
           * after it finishes — which silently makes it a containing block
           * for every `position: fixed` descendant, breaking any dialog or
           * popover rendered inline on the page. Dropping the class the
           * instant the animation ends removes that residual transform and
           * restores normal fixed-positioning for the rest of the page's life.
           */}
          <div
            key={pathname}
            className="storm-page-in mx-auto max-w-[1180px]"
            onAnimationEnd={(event) => event.currentTarget.classList.remove("storm-page-in")}
          >
            {children}
          </div>
        </main>
      </div>

      <StormCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} links={ALL_LINKS} />
    </div>
  );
}

function RailBody({
  pathname,
  attentionCount,
  email,
  role,
  onLogout,
  collapsed,
  showThemeSwitch,
}: {
  pathname: string;
  attentionCount: number | null;
  email?: string;
  role?: string;
  onLogout: () => void;
  collapsed: boolean;
  showThemeSwitch: boolean;
}) {
  return (
    <>
      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-4">
          {NAV_GROUPS.map((group) => (
            <li key={group.label}>
              {!collapsed && (
                <p className="storm-micro px-2.5 pb-1.5 font-medium uppercase tracking-wide text-quiet">
                  {group.label}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.links.map((link) => {
                  const active =
                    link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                  const showBadge = link.badge && attentionCount !== null && attentionCount > 0;
                  const item = (
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-accent-soft text-accent"
                          : "text-rain hover:bg-paper-lift hover:text-ink"
                      )}
                    >
                      <StormIcon name={link.icon} size={17} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">{link.label}</span>
                          {showBadge && (
                            <span className="tnum flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-signal px-1.5 text-[0.6875rem] font-semibold text-white">
                              {attentionCount}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && showBadge && (
                        <span
                          aria-hidden="true"
                          className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-signal"
                        />
                      )}
                    </Link>
                  );
                  return (
                    <li key={link.href} className="relative">
                      {collapsed ? <StormTooltip label={link.label}>{item}</StormTooltip> : item}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-mist p-3">
        {showThemeSwitch && (
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="storm-legend text-rain">Theme</span>
            <StormThemeSwitch />
          </div>
        )}
        <div className={cn("flex items-center gap-2.5 rounded-md px-2 py-2", collapsed && "justify-center px-0")}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-lift text-xs font-semibold text-rain">
            {(email ?? "?").charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 leading-tight">
              {email && (
                <span className="block truncate text-[0.8125rem] font-medium text-ink" title={email}>
                  {email}
                </span>
              )}
              {role && <span className="storm-micro text-quiet">{role}</span>}
            </span>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign out"
              className="shrink-0 rounded-md p-1.5 text-quiet transition duration-150 ease-out hover:bg-paper-lift hover:text-ink active:scale-95 motion-reduce:transition-none"
            >
              <StormIcon name="logout" size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            className="mt-1 flex w-full items-center justify-center rounded-md p-1.5 text-quiet transition duration-150 ease-out hover:bg-paper-lift hover:text-ink active:scale-95 motion-reduce:transition-none"
          >
            <StormIcon name="logout" size={16} />
          </button>
        )}
      </div>
    </>
  );
}
