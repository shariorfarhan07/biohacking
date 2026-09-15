# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A premium online men's coaching platform. Customers buy a coaching package
via Stripe, complete an 8-step onboarding assessment, and are automatically
provisioned into Everfit for ongoing coaching. Staff manage the whole
pipeline from a separate admin dashboard.

```
frontend/   Next.js 14 (App Router) + TypeScript + Tailwind
backend/    FastAPI + SQLAlchemy + Alembic
```

The frontend never talks to Stripe or Everfit directly — every third-party
call and every secret lives in the backend. The frontend only calls the
backend's own API (`NEXT_PUBLIC_API_URL`), authenticated via cookies.

See `README.md` for the full customer journey and local setup, `DEPLOY.md`
for the production deploy flow (`./deploy.sh` automates it — see below),
`PRODUCT.md`/`DESIGN.md` for product and design-system context (read by the
`impeccable` skill), and `LOGIN.md` for local dev credentials.

## Two isolated worlds — never cross them

This codebase renders **two completely separate design systems** in one
Next.js app, and the API enforces two separate auth realms to match. Never
blend them, never reuse a component across the boundary, and never let a
design pass on one touch the other.

- **Customer-facing ("Obsidian Room")** — marketing site, checkout,
  onboarding wizard, and the logged-in customer dashboard
  (`app/(marketing)`, `app/(auth)`, `app/(checkout)`, `app/(onboarding)`,
  `app/(dashboard)`). Dark, fixed theme (obsidian-950/900 ground, cyan-400 /
  accentblue accents, fog-* type ramp, frosted-glass `GlassPanel`, Manrope
  display + Inter body). Never uses Tailwind `dark:` variants — the theme is
  fixed, not toggled.
- **Admin panel ("Framer Product Console" / Storm)** — `app/(admin)`,
  `components/admin/*`. A completely different visual world (white ground,
  soft-gray surfaces, one calm accent blue), scoped under `.storm` /
  `#storm-root`. Its own light/dark toggle lives here (`ThemeProvider` sets
  `dark` on `.storm`, never on `<html>`). Tailwind's `darkMode: "class"` is
  scoped so this can't leak into the customer world.
- Cookies are separate per realm too: `access_token`/`refresh_token` for
  customers vs `admin_access_token`/`admin_refresh_token` for admins
  (`backend/app/core/security.py`), checked by `get_current_customer` vs
  `get_current_admin` (`backend/app/core/deps.py`).

When asked to redesign or polish one world, treat the other as out of scope
by default — say so if a request is ambiguous about which one it means.

## Backend conventions

- Models: `Base`, `UUIDPKMixin`, `TimestampMixin` mixins
  (`backend/app/models/`). Enums are Python `str` enums stored as
  `Enum(X, native_enum=False, length=N)` — see `app/models/enums.py`.
- Auth: `Depends(get_current_customer)` / `Depends(get_current_admin)`
  (`app/core/deps.py`), never mixed on the same route.
- Ownership checks return **404, not 403**, when a resource exists but isn't
  owned by the caller (see `_get_owned_membership` / `_get_owned_ticket`
  pattern) — avoids confirming a resource ID exists to someone who shouldn't
  see it.
- Migrations: Alembic autogenerate, reviewed before applying — see
  `alembic/versions/`.
- CSRF: every mutating request (non-GET/HEAD/OPTIONS, outside
  `/api/webhooks`) must send header `X-Requested-With: fetch` — the exact
  string `"fetch"`, enforced in `app/main.py`. `api-client.ts` already sets
  this on every call; a raw `fetch`/Playwright script driving the API
  directly must set it manually or every mutation 403s.
- CORS: `allow_origins=[settings.FRONTEND_URL]` — single origin, credentialed.
- Tests: `cd backend && pytest` (56 tests as of this writing — auth, Stripe
  webhooks incl. idempotency/replay, onboarding, rules engine, mock Everfit
  provisioning, blog, support tickets, and the full admin CRUD surface).

## Frontend conventions

- `lib/api-client.ts` — one `ApiError` type, one client per resource
  (`dashboardApi`, `billingApi`, `ticketsApi`, `adminTicketsApi`, …). Add new
  backend routes here rather than calling `fetch` ad hoc from a page.
- `lib/types.ts` / `lib/constants.ts` — shared types and status-label maps
  (e.g. `MEMBERSHIP_STATUS_LABELS`, `TICKET_STATUS_LABELS`) kept in sync with
  backend enums by hand — there's no codegen.
- Shared customer-portal UI: `components/ui/*` (`GlassPanel`, `Button`,
  `Input`, `Textarea`, `StatusBadge`, `Skeleton`, `ErrorState`, `EmptyState`,
  `Toast`, …) and `components/dashboard/*` (`PortalPageHeader`,
  `JourneyTracker`). Reuse these instead of one-off markup when building new
  dashboard pages.
- Shared admin UI: `components/admin/*` (`StormRoster`, `StormSection`,
  `StormState`, `StormIcon`, `StormFilterBar`, `StormSelect`, `StormTextarea`,
  `StormButton`, …) — the Storm-world equivalents; don't mix with the
  customer-world components above.
- `npx tsc --noEmit` and `next lint` are expected to stay clean; there's no
  test runner configured on the frontend (`package.json` has no `test`
  script) — verification here is typecheck + lint + manual/Playwright
  screenshots, not unit tests.

## Hazard: entrance animation + `position: fixed`

Any one-shot entrance animation (`animation-fill-mode: both` or `forwards`)
applied to a **persistent/keyed wrapper** must strip its own class in
`onAnimationEnd`. Left in place, the fill-mode keeps a resolved `transform`
on that element forever, which silently turns it into a containing block and
breaks any `position: fixed` descendant (e.g. a modal or drawer rendered
inside it). The `.fade-rise-in` utility in `frontend/app/globals.css`
documents this inline; when reusing it, always pair it with:

```tsx
<div className="fade-rise-in" onAnimationEnd={(e) => e.currentTarget.classList.remove("fade-rise-in")}>
```

## Deployment

`./deploy.sh` automates the redeploy flow documented in `DEPLOY.md` against
the live server at `169.58.83.145` (Caddy + Docker Compose). Configurable via
env vars (`DEPLOY_USER`, `DEPLOY_HOST`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`),
supports `--logs`. It tars and syncs the repo (same excludes as DEPLOY.md),
runs `docker compose build && docker compose up -d` remotely, then
`docker compose ps` and a curl smoke check. Alembic migrations run
automatically on backend container boot — no separate migration step needed.
**Never run this without the user asking** — it's a production deploy.

## Design work in this repo

This project uses the `impeccable` skill (see `PRODUCT.md`, `DESIGN.md`,
`.impeccable/`) for UI work. Read those files and follow the skill's
context-loading step before making visual changes rather than reinventing
conventions already recorded there.
