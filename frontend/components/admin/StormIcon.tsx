/*
 * Authored icon set for the console. One stroke weight (1.5), one 24px grid,
 * square caps throughout. No unicode glyphs anywhere.
 */

type IconName =
  | "menu"
  | "close"
  | "right"
  | "left"
  | "down"
  | "search"
  | "check"
  | "alert"
  | "external"
  | "plus"
  | "retry"
  | "sort"
  | "grid"
  | "users"
  | "box"
  | "dumbbell"
  | "sliders"
  | "tag"
  | "mail"
  | "logout"
  | "sun"
  | "moon"
  | "monitor"
  | "panel"
  | "bell"
  | "download"
  | "dots"
  | "edit"
  | "ticket";

const PATHS: Record<IconName, React.ReactNode> = {
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  close: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  right: <path d="M9 5l7 7-7 7" />,
  left: <path d="M15 5l-7 7 7 7" />,
  down: <path d="M5 9l7 7 7-7" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.25" />
      <path d="M15.6 15.6L20.5 20.5" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  alert: (
    <>
      <path d="M12 3.5v11" />
      <path d="M12 18.5v1.5" />
    </>
  ),
  external: (
    <>
      <path d="M8 16l8-8" />
      <path d="M9.5 8H16v6.5" />
    </>
  ),
  plus: <path d="M12 4.5v15M4.5 12h15" />,
  retry: (
    <>
      <path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <path d="M20 4v4.5h-4.5" />
    </>
  ),
  sort: <path d="M8 9.5L12 5l4 4.5M8 14.5l4 4.5 4-4.5" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" />
      <rect x="13" y="13" width="7.5" height="7.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.25 19c0-3.5 2.5-5.5 5.75-5.5s5.75 2 5.75 5.5" />
      <path d="M15.5 4a3 3 0 0 1 0 5.8" />
      <path d="M20.5 19c0-3-1.7-4.9-3.75-5.4" />
    </>
  ),
  box: (
    <>
      <path d="M4 8l8-4.25L20 8l-8 4.25L4 8z" />
      <path d="M4 8v8l8 4.25 8-4.25V8" />
      <path d="M12 12.25V20.5" />
    </>
  ),
  dumbbell: (
    <>
      <rect x="2.5" y="9.5" width="3" height="5" />
      <rect x="18.5" y="9.5" width="3" height="5" />
      <rect x="6.75" y="7.5" width="2.5" height="9" />
      <rect x="14.75" y="7.5" width="2.5" height="9" />
      <path d="M9.25 12h5.5" />
    </>
  ),
  sliders: (
    <>
      <path d="M3.5 6.5H12M16.5 6.5h4" />
      <circle cx="14" cy="6.5" r="2" />
      <path d="M3.5 12h3M10.5 12h10" />
      <circle cx="7.5" cy="12" r="2" />
      <path d="M3.5 17.5H12M16.5 17.5h4" />
      <circle cx="14" cy="17.5" r="2" />
    </>
  ),
  tag: (
    <>
      <path d="M20.25 13.06L13.06 20.25a1 1 0 0 1-1.42 0l-8-8A1 1 0 0 1 3.35 11.6V4.75a1 1 0 0 1 1-1h6.85c.27 0 .52.1.71.3l8 8a1 1 0 0 1 0 1.41z" />
      <circle cx="8.1" cy="8.1" r="1.35" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" />
      <path d="M3.5 6.5l8.5 7 8.5-7" />
    </>
  ),
  logout: (
    <>
      <path d="M9.5 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h4" />
      <path d="M14 8l4.5 4-4.5 4" />
      <path d="M18.25 12H9.25" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2.25M12 19.25v2.25M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.5 12h2.25M19.25 12h2.25M4.4 19.6l1.6-1.6M18 6l1.6-1.6" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  monitor: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </>
  ),
  panel: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M9.5 4.5v15" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11.5" />
      <path d="M7.5 11.5L12 16l4.5-4.5" />
      <path d="M4.5 18.5v1a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-1" />
    </>
  ),
  dots: (
    <>
      <circle cx="12" cy="5.5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="12" cy="18.5" r="1.4" />
    </>
  ),
  edit: (
    <>
      <path d="M14.5 5l4.5 4.5L8 20.5H3.5V16z" />
      <path d="M12.5 7l4.5 4.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.25a1.75 1.75 0 0 0 0 3.5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.25a1.75 1.75 0 0 0 0-3.5z" />
      <path d="M14.5 6.5v11" strokeDasharray="2.2 2.2" />
    </>
  ),
};

export function StormIcon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
