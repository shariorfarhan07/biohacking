import Link from "next/link";

/**
 * One page-header grammar for every portal surface: an optional back link,
 * the title, a one-line description of what this page is for, and an
 * optional action aligned to the right on wide viewports.
 */
export function PortalPageHeader({
  title,
  description,
  back,
  actions,
  badge,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-fog-400 transition-colors hover:text-fog-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-fog-100 sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1.5 max-w-prose text-sm text-fog-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
