---
name: Biohacking
description: Two worlds under one roof — an obsidian premium customer surface and Framer Product Console, the admin panel modeled on Framer's own product UI, now with first-class light/dark theming.
colors:
  # --- Framer Product Console (admin world, scoped under #storm-root/.storm) ---
  # Light values shown; every key also has a dark value defined via CSS
  # custom property on .storm.dark — see "Dark Mode" below.
  paper: "#FFFFFF"
  paper-lift: "#F7F8FA"
  paper-lift-hover: "#F0F2F5"
  elevated: "#FFFFFF"
  ink: "#101828"
  rain: "#475467"
  mist: "#E4E7EC"
  quiet: "#98A2B3"
  border-strong: "#D0D5DD"
  signal: "#D92D20"
  signal-soft: "#FEF3F2"
  accent: "#2563EB"
  accent-hover: "#1D4ED8"
  accent-soft: "#EFF4FF"
  ok: "#067647"
  ok-soft: "#ECFDF3"
  pending: "#B54708"
  pending-soft: "#FFFAEB"
  scrim: "rgba(16,24,40,0.4)"
  # --- Customer world (marketing, auth, checkout, onboarding, dashboard) ---
  obsidian-950: "#07080A"
  obsidian-900: "#0B0D10"
  obsidian-800: "#12151A"
  obsidian-700: "#1A1E25"
  obsidian-600: "#232833"
  fog-100: "#F5F7FA"
  fog-200: "#DDE2E9"
  fog-300: "#A7B0BD"
  fog-400: "#7C8592"
  fog-500: "#5B626D"
  cyan-300: "#67E8F9"
  cyan-400: "#22D3EE"
  cyan-500: "#00C2E0"
  accentblue-600: "#2563EB"
  accentblue-800: "#1E3A8A"
  violet-400: "#A78BFA"
  violet-500: "#7C3AED"
  success: "#34D399"
  warning: "#FBBF24"
  danger: "#F87171"
typography:
  monument:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.625rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  legend:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  data:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum 1"
  prose:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  micro:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  display-customer:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body-customer:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  2xl: "28px"
components:
  storm-button-solid:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    typography: "{typography.data}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  storm-button-solid-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#FFFFFF"
  storm-button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  storm-button-outline-hover:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
  storm-button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.rain}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  storm-button-destructive:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.signal}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  storm-button-destructive-hover:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal}"
  storm-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  storm-field-focus:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  storm-state-attention:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal}"
    typography: "{typography.micro}"
  storm-state-flight:
    backgroundColor: "{colors.pending-soft}"
    textColor: "{colors.pending}"
    typography: "{typography.micro}"
  storm-state-settled:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    typography: "{typography.micro}"
  storm-state-spent:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.quiet}"
    typography: "{typography.micro}"
  storm-dialog:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "28px"
    width: "32rem"
  storm-toast:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
    width: "24rem"
---

# Design System: Biohacking

## Overview

**Creative North Star: "Framer Product Console" (admin) over "The Obsidian Room" (customer)**

This project ships **two distinct visual worlds**, and they are not variants of each other. They share a Tailwind config and nothing else.

**The customer-facing world** — marketing site, auth, checkout, the onboarding wizard, the customer dashboard — is a premium dark room: near-black obsidian ground, white type, electric cyan accents over deep blue and a trace of ultraviolet, frosted-glass panels, soft glow, generous corner radii, Inter for body and Manrope for display. It is defined in `frontend/app/globals.css` and the base of `frontend/tailwind.config.ts`. **This world is documented here as-is and was not touched by either admin pass. Do not rewrite it, and do not import Framer Product Console rules into it.**

**The admin world, "Framer Product Console,"** replaced the prior "Alphabet Storm" ink-ledger system outright. This EXTEND/HARDEN pass (the second admin-focused session, no new direction contract) took that white-ground console and hardened it into a modern, premium, production-grade SaaS dashboard in the Linear/Vercel/Stripe/Raycast register: **first-class dark mode**, a command palette, a notifications popover, a collapsible sidebar, bulk row selection with CSV export, sticky table headers, and a small, disciplined set of entrance/transition animations layered on top of the existing white-ground system without discarding it. The white-ground light theme, the one-accent-blue rule, the four-family soft-fill status system, Inter throughout, and the rounded/shadowed shape language are all unchanged and still the console's identity in light mode; dark mode is a second, equally first-class expression of the same system, not a bolt-on.

It is still scoped entirely under a `.storm` class (now specifically on `#storm-root`, a wrapper inside the `(admin)` layout — not `<html>`) so it cannot leak into the always-dark customer world, which shares the same Tailwind config but never uses `dark:` utilities.

Because the customer world styles `h1..h4` globally for a dark ground, the storm scope re-claims its own headings (family, colour, tracking all reset to `inherit`). Any new global heading rule in `globals.css` must be checked against that reclaim.

**Key Characteristics:**
- Two scoped worlds; `.storm` (rooted at `#storm-root`) is the hard boundary and nothing crosses it.
- Admin light: white ground (`#FFFFFF`) with soft-gray surfaces (`#F7F8FA`) on hairline borders, ink text (`#101828`), one accent blue (`#2563EB`), one family (Inter).
- Admin dark: a measured, non-inverted hierarchy — near-black ground (`#0A0A0A`), a distinct surface (`#111111`) and elevated plane (`#181818`), lifted accent/status hues, and hairlines rendered as translucent white rather than solid grey.
- Status is carried by colour again, as small soft-fill pills with a leading dot — four families (attention / flight / settled / spent) — identically in both themes.
- Every surface — card, button, dialog, toast, popover — carries a soft, multi-layer wash shadow; nothing in this world sits flat.
- Corners are consistently rounded (`rounded-md` controls, `rounded-xl` cards and dialogs); there is no zero-radius override left anywhere in `.storm`.
- A deliberately small, disclosed animation system: page transitions, modal/dropdown/drawer/toast entrances, a checkbox check-in, the sidebar's width transition, the KPI ring sweep, and the status cross-fade — all reduced-motion-safe, and governed by one hard rule (see Motion & Animation).

## Colors

Two palettes: a dark accented one for customers, and a white-and-soft-gray-by-default, dark-mode-capable one for operators where a single accent blue and four status hues carry meaning in either theme.

### Primary

- **Accent Blue** (`accent`): the admin world's one accent — solid buttons, active nav item (text + soft-fill background), links, focus outlines, selected filter chips, the distribution bars on the overview page, the command-palette's active row. Light `#2563EB` / hover `#1D4ED8` / soft `#EFF4FF`; dark `#3B82F6` / hover `#60A5FA` / soft `rgba(59,130,246,0.14)`. It is the only colour with no status meaning; everywhere it appears, it means "you can act here."
- **Electric Cyan** (`cyan-400`, with `cyan-300` and `cyan-500`): the customer world's single accent — links, focus rings, glow, primary calls to action on obsidian. Unchanged, out of scope for this pass.

### Secondary

- **Signal Red** (`signal`): the admin world's "needs a human now" hue — the attention status pill, the sidebar's attention-count badge, the notification-bell dot, destructive button text/hover, field errors and required-field asterisks. Light `#D92D20` / soft `#FEF3F2`; dark `#F87171` / soft `rgba(248,113,113,0.12)` — lifted in dark mode so it stays legible without glowing, rather than a straight invert.
- **Pending Amber** (`pending`): "moving under its own power." Light `#B54708` / soft `#FFFAEB`; dark `#FBBF24` / soft `rgba(251,191,36,0.12)`.
- **Settled Green** (`ok`): "arrived, asks for nothing." Light `#067647` / soft `#ECFDF3`; dark `#34D399` / soft `rgba(52,211,153,0.12)`.
- **Deep Blue** (`accentblue-600` / `accentblue-800`) and **Ultraviolet** (`violet-400` / `violet-500`): customer-world only, unchanged.

### Neutral

- **Paper** (`paper`): the admin ground. Light `#FFFFFF`; dark `#0A0A0A`. Resolves through an RGB-triplet custom property (`--paper-rgb`) so `bg-paper/95` opacity modifiers work.
- **Paper Lift** (`paper-lift`) / **Paper Lift Hover** (`paper-lift-hover`): the soft neutral fill and its hover step. Light `#F7F8FA` / `#F0F2F5`; dark `#111111` / `#1A1A1A`.
- **Elevated** (`elevated`): the plane dialogs, popovers and the command palette sit on — distinct from `paper` specifically in dark mode (`#181818` vs `#0A0A0A`) so a modal reads as a lifted plane rather than blending into the page. Light `#FFFFFF` (same as paper, no light-mode distinction needed).
- **Ink** (`ink`): primary text. Light `#101828`; dark `#F5F5F5`. **Inverts** between themes — see the scrim/badge rule below.
- **Rain** (`rain`): secondary text. Light `#475467`; dark `#A1A1AA`.
- **Quiet** (`quiet`): the most muted text. Light `#98A2B3`; dark `#8B8B8B` — see Named Rules, this exact value is load-bearing.
- **Mist** (`mist`) / **Border Strong** (`border-strong`): hairlines. Light `#E4E7EC` / `#D0D5DD` (solid greys); dark `rgba(255,255,255,0.08)` / `rgba(255,255,255,0.14)` (translucent whites, not solid greys — a deliberate lower-contrast register at the edges).
- **Scrim** (`scrim`): the dedicated overlay-dim token for dialogs, the command palette and the mobile drawer. Light `rgba(16,24,40,0.4)`; dark `rgba(0,0,0,0.6)`. See Named Rules — this exists specifically so overlays never reach for `ink`.
- **Obsidian 950–600** and **Fog 100–500**: customer-world only, unchanged.

### Named Rules

**The One Accent Rule.** `accent` is the only colour in the admin world with no status meaning. It marks "you can act here" — buttons, links, active nav, focus, the command palette's highlighted row. It never appears as a KPI number, a status pill, or a decorative fill.

**The Soft-Fill Status Rule.** Status returns to colour in this world: attention/flight/settled/spent each get a fixed hue pair (full-strength text on a soft-tint background), applied identically everywhere a status appears — pills, badges, KPI numbers, in both themes. A status rendered only in grey, or in a colour outside its assigned family, is a bug.

**The Always-Elevated Rule.** Every rounded surface in `.storm` — button, card, dialog, toast, dropdown-shaped control, popover — carries one of the `storm-xs` / `storm-sm` / `storm-md` / `storm-lg` soft washed shadows. Nothing in this world sits flat; a bare `border` with no shadow on a card-shaped element is a regression, not a stylistic choice.

**The Ink-Inverts Rule.** `ink` is near-black in light mode and near-white in dark mode — it flips. Anything opacity-blended for a scrim, overlay, or a fixed-colour badge (e.g. the wordmark chip) must **not** be built from `ink` or reach for a colour that inverts; use the dedicated non-inverting token instead (`scrim` for overlays, `accent` for fixed-colour brand chips). This was an actual defect this pass fixed twice: the dialog/palette/drawer scrim now uses `scrim` instead of an `ink`-derived tint, and the login page's wordmark badge was moved from `bg-ink` (which went white-on-white in dark mode) to `bg-accent`.

**The Measured Minimum-Contrast Rule.** `quiet` (`--ink-muted`) in dark mode is fixed at `#8B8B8B`, not a darker mid-gray that "reads as quiet at a glance." It carries real text — hints, placeholders, "Not recorded" values — and was set to this value after measuring 5.21–5.54:1 relative-luminance contrast against both `--surface` and `--elevated`, clearing the 4.5:1 AA floor with margin. Do not regress this token to a lower-contrast value for a "quieter" look; a quiet-but-illegible token is a defect, not a design choice.

**Implementation note (not a design token):** `storm.css` also defines `--surface`, `--surface-hover`, `--elevated`, `--ink-secondary`, `--border-strong`, `--ink-muted` and `--overlay-scrim` as CSS custom properties on `.storm` / `.storm.dark`. Every admin Tailwind colour key (`paper-lift`, `elevated`, `rain`, `mist`, `quiet`, `border-strong`, `scrim`, plus opacity-enabled `paper`/`accent`/`signal`/`ok`) resolves through these variables via `tailwind.config.ts`, so a single set of class names repaints for both themes with zero per-component `dark:` variants anywhere in admin markup. Use the Tailwind keys, not raw CSS-variable names or `dark:` utilities, when writing new admin markup.

## Dark Mode

First-class, not an afterthought: every admin colour token is CSS-variable-backed (`storm.css`, scoped to `#storm-root.storm` / `#storm-root.storm.dark`), so dark mode cascades through structurally different pages — dashboard, customer list/detail, packages, assignment rules, discount codes — with **zero page-specific dark-mode code**. Confirmed by Playwright screenshot pass across ~10 admin pages/states at desktop and mobile viewports in both themes.

**Theming mechanics:**
- `ThemeProvider` (`frontend/lib/theme-context.tsx`) exposes `useTheme()` with `light` / `dark` / `system` modes, persisted to `localStorage` under `biohacking-admin-theme`.
- The resolved theme is applied as a `dark` class on `#storm-root` only — never `<html>` — so Tailwind's `darkMode: "class"` strategy (in `tailwind.config.ts`) matches from any descendant while the customer world, which never uses `dark:` utilities, is untouched.
- A blocking inline script (`THEME_INIT_SCRIPT`) runs during HTML parsing, before hydration, to stamp the class synchronously and prevent a flash of the wrong theme.
- A theme switch briefly adds a `.theme-transitioning` class (colour-only transition, ~180ms, removed after) so the repaint softens without fighting every component's own hover/focus timing; this is not a permanent blanket transition.
- `StormThemeSwitch` (`frontend/components/admin/StormThemeSwitch.tsx`) is the three-way radiogroup control, present in the desktop header and the mobile drawer's rail body.

### Named Rules

**The One System, Two Planes Rule.** Dark mode is not a per-component `dark:` variant exercise — it is the same token names resolving to different CSS-variable values. A new admin component must reach for the Tailwind colour keys (`bg-paper-lift`, `text-rain`, `border-mist`, etc.), never a literal hex value or a `dark:` prefix, or it will silently fail to repaint in dark mode.

## Typography

**Admin display + body + label font:** Inter (with system-ui, sans-serif), loaded through `next/font/google` at weights 400/500/600/700 and exposed as `--font-storm`.
**Customer display font:** Manrope. **Customer body font:** Inter. Both unchanged, out of scope.

**Character:** The admin world runs on the same family as most product software reads all day: Inter at normal case and moderate tracking, sized for scanning rather than stamping. Numerals are tabular everywhere (`tnum`), so every KPI number and table column aligns.

### Hierarchy (admin world) — unchanged this pass

- **Monument** (700, `clamp(1.75rem, 3vw, 2.25rem)`, 1.05 line-height, −0.02em): the rare page-level statement — a KPI hero number.
- **Title** (700, `clamp(1.375rem, 2.2vw, 1.625rem)`, 1.2, −0.02em): page heads and dialog titles. Sentence case.
- **Data** (400, 0.875rem, 1.45, tabular numerals): table cells, fact values, toast messages.
- **Prose** (400, 0.875rem, 1.6, max 68ch): explanatory lines, empty-state lines, dialog descriptions.
- **Legend** (500, 0.8125rem, normal case): section headings, column headers, nav items, field labels, filter-chip text, command-palette result labels.
- **Micro** (400, 0.75rem): field hints and errors, pagination summaries, status-pill text, kbd hints (`⌘K`, `Esc`).

### Named Rules

**The One Family Rule.** Inter carries the entire admin surface, body through label, in both themes. A second family in `.storm` is a defect.

**The Normal-Case Rule.** No admin type role uses uppercase or heavy letter-spacing, with one narrow, pre-existing exception: nav **group** labels ("Pipeline," "Catalog," "Support") in the sidebar use small uppercase tracked text as a structural section marker, not a content kicker — it labels a group of links, never a card, a section of prose, or a KPI. This is not a new device introduced this pass; do not extend it to new contexts.

## Layout

The admin shell is now a **collapsible** fixed left sidebar (`.storm-rail`) beside an open field, plus a sticky header. Expanded width is 14rem (`w-56`); collapsed width is `4.5rem` (icon rail with tooltips). Collapse state persists to `localStorage` (`biohacking-admin-sidebar-collapsed`); the content column's left padding transitions to match (`lg:pl-56` / `lg:pl-[4.5rem]`) via a padding-only transition (not a width thrash on the content column itself). Content stays capped at `max-w-[1180px]`.

**Header chrome** (new this pass, `lg` and up): breadcrumbs on the left, built from the active nav link plus a detail-page label; on the right, a search/command-palette trigger (`⌘K`), a notifications bell (`StormPopover`, badge-dotted when there's an active attention count), the theme switch, and an account menu (also `StormPopover`). Below `lg`, the same functions collapse into a sticky mobile top bar plus a drawer.

Page structure is otherwise unchanged: page title top-left, then straight into content — a KPI row followed by the requires-attention roster, `gap-10` between major sections, `StormSection` headings on a mist hairline.

Rosters still change shape rather than reflowing (table at `lg`+, stacked cards below). New this pass: rosters can be **selectable** — a checkbox column, a bulk-action toolbar that appears once at least one row is checked, and sticky column headers on desktop.

Breakpoints are unchanged: `sm` (640px, dialogs dock vs. centre) and `lg` (1024px, sidebar/header appear, rosters become tables).

## Elevation & Depth

Unchanged in principle, extended to new surfaces: **the admin world is lifted, not flat**, in both themes. Every rounded surface — KPI card, button, input, dialog, toast, popover, mobile roster card — carries a soft, multi-layer wash shadow.

### Shadow Vocabulary — unchanged values, now used in dark mode too

- **Storm XS** `0 1px 2px rgba(16,24,40,0.05)`: buttons, inputs, KPI cards, mobile roster cards.
- **Storm SM** `0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)`: a surface needing slightly more separation.
- **Storm MD** `0 4px 8px -2px rgba(16,24,40,0.1), 0 2px 4px -2px rgba(16,24,40,0.06)`: toasts.
- **Storm LG** `0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)`: dialog panel, command palette, mobile navigation drawer, popovers — the deepest lift.
- Customer-world shadows (**Cyan Glow**, **Violet Glow**, **Panel**) unchanged, out of scope.

### Named Rules

**The No-Absent-Shadow Rule.** Every card-, button-, dialog- or popover-shaped surface in `.storm` carries a shadow token; disabled controls are the one exception (`shadow-none`).

## Shapes

Unchanged this pass: form controls and small buttons `rounded-md` (10px), KPI cards/dialogs/popovers/mobile roster cards `rounded-xl` (20px), status pills/badges/filter chips fully round. Icons remain the hand-authored 24px-grid, 1.5-stroke set — no icon font, no glyphs — extended this pass with `sun`, `moon`, `monitor`, `panel`, `bell`, `download`, `dots`.

## Components

### Buttons (admin)

Unchanged shape/variant vocabulary (solid / outline / quiet / destructive), hardened with **press feedback**: `active:scale-[0.98]` on every variant (respecting `motion-reduce`), so a click reads as a physical press rather than a colour-only response.

### Theme Switch

`StormThemeSwitch`: a three-segment `radiogroup` (sun/monitor/moon) in a `paper-lift`-toned pill; the active option gets a `paper`-filled, `storm-xs`-shadowed chip inside it — the same "selected chip on a soft track" grammar as the filter bar, reused rather than inventing a new switch shape.

### Command Palette (new, signature)

`StormCommandPalette`: `⌘K`/`Ctrl+K` opens a centred, `storm-lg`-shadowed panel on the `elevated` plane over a `scrim` backdrop. Filters admin nav sections by label as you type; with a non-empty query, appends a "Search customers for…" jump result. Arrow keys move a highlighted row (`accent-soft` fill), Enter activates it, Escape closes. Deliberately not bound to `/`, since the customers page already owns that key for its inline search.

### Notifications & Account Menu (new, `StormPopover`)

A generic trigger+floating-panel primitive: closes on outside click, Escape (returning focus to the trigger) and route change. Panel is `elevated`-plane, `storm-lg` shadow, `storm-dropdown-in` entrance. The notifications instance shows the same requires-attention data as the sidebar badge/dot, capped to 6 items with a "View full queue" link; the account-menu instance shows email/role and sign-out.

### Dialog (admin)

Rounded panel (`rounded-xl`, `rounded-t-xl` only on mobile) on the `elevated` plane (not `paper` — see Colors, this is the deliberate light/dark distinction), 1px mist border, `storm-lg` shadow, over a `scrim`-toned backdrop (not an `ink`-derived tint — see the Ink-Inverts Rule) with a 2px backdrop blur. Entrance is `storm-scrim-in` (backdrop fade) + `storm-modal-in` (panel fade/scale/translate). Focus trapped, Escape closes, body scroll locks, focus returns to trigger. `StormConfirmDialog` pairs a quiet Cancel with a solid or destructive confirm.

### Toast (admin)

Unchanged soft-fill status backgrounds — **the Soft-Fill Status Rule still holds for toasts**: `ok-soft` fill/`ok`-tinted border for success, `signal-soft`/`signal`-tinted border for error, message text staying `ink` for legibility on either tint. New this pass: a `storm-toast-in` entrance (fade + slight rise/scale).

### Roster (signature component)

A hairline-ruled table: tabular numerals, mist rules under the header and between rows. **Row hover now renders as built**: `hover:bg-paper-lift` on the `<tr>` resolves correctly through the Tailwind colour key (a prior note in this file describing this as non-rendering is now stale and has been removed — confirmed fixed both by source inspection and by the finish-reviewer's screenshot pass). Whole-row click remains opt-in via `rowHref`, refuses to fire on a real link/button/field or selected text, and ArrowUp/ArrowDown rove focus between row links.

New this pass:
- **Bulk selection** (`selectable` prop): a checkbox column (indeterminate-aware "select all" in the header), a `Set<string>` of selected row IDs, and a toolbar that appears above the table once ≥1 row is selected, showing a count and a `bulkActions` slot plus a Clear button.
- **Sticky column headers** (desktop only): each `<th>` — not the `<thead>` — carries `sticky top-16 z-10 bg-paper`, and hairline borders live on the `<th>`/`<tr>` rather than relying on `border-collapse` cross-browser quirks with a sticky `<thead>`. `top-16` matches the header's fixed height (`h-16`) so the sticky row docks directly under it rather than overlapping.

### Named Rules

**The Sticky-Header Placement Rule.** Sticky positioning on a table header in this codebase goes on the `<th>` elements individually, with their own background and bottom border, not on `<thead>` — `border-collapse: collapse` makes `<thead>`-level sticky positioning and borders unreliable across browsers. Any future sticky table header should follow the same per-`<th>` pattern.

### KPI Ring / State Register / Absence States / Browser surfaces — unchanged this pass

See prior documentation of `StormRing`, the four-family status pill cross-fade, empty/failure/loading states, and themed selection/caret/scrollbars/focus rings — all still accurate and now correctly themed for dark mode via the same CSS-variable mechanism (no separate dark-mode rules needed).

## Motion & Animation

A small, disclosed set of transform/opacity-based animations, added specifically to support the new chrome — not a general animation pass:

- **Page transition** (`storm-page-in`): fade + 6px rise, applied to the route-content wrapper, keyed by `pathname` so it fires once per navigation.
- **Overlay grammar** (`storm-scrim-in` / `storm-modal-in` / `storm-dropdown-in` / `storm-drawer-in`): shared by dialogs, the command palette, popovers and the mobile drawer — backdrop fades, surface fades with a small translate/scale toward rest. Transform + opacity only, GPU-cheap.
- **Toast entrance** (`storm-toast-in`): fade + slight rise/scale.
- **Checkbox check-in** (`storm-check-in`): scale-in on the roster's new checkbox controls.
- **Sidebar width transition** (`.storm-rail`, `transition: width 200ms`, `will-change: width`): see Named Rules below — a disclosed, bounded exception.
- Pre-existing: the KPI ring's stroke sweep and the status pill cross-fade, unchanged.

All of the above are disabled or reduced under `prefers-reduced-motion`.

### Named Rules

**The Strip-The-Fill-Mode-Class Rule (hard rule).** Any one-shot entrance animation (`animation-fill-mode: both` or `forwards`) applied to a **persistent, keyed wrapper element** — as opposed to an element that unmounts when its animation is done — must strip its animation class in an `onAnimationEnd` handler (or equivalent) once the animation completes. This is not cosmetic: `fill-mode: both/forwards` leaves a resolved `transform` on the element after the animation ends, and per the CSS spec a resolved transform creates a new containing block for any `position: fixed` descendant — silently breaking fixed positioning for every non-portaled dialog/popover rendered inside that wrapper for the rest of the page's life. `AdminShell`'s route-content wrapper (`storm-page-in`) does this correctly; it is the load-bearing reference implementation for the rule, not just an example. Any future one-shot entrance animation on a persistent wrapper must do the same, or avoid `fill-mode: both/forwards` on transform-based keyframes entirely.

**The Bounded Layout-Animation Exception.** The sidebar's `width` transition (`.storm-rail`) animates a layout property, which a mechanical thrash-detector will flag. It is accepted, not fixed, because: it is the literal collapsible-sidebar feature (a genuine reflow between icon-only and labelled states, not a clipped illusion); it is scoped to exactly one fixed-position element; it only fires on a deliberate user click, never continuously or scroll-linked; and it is mitigated with `will-change: width` and disabled under `prefers-reduced-motion`. This is the one sanctioned exception to "prefer transform/opacity animations" in `.storm` — it is not precedent for animating `width`/`height`/`top`/`left` elsewhere; every other admin animation in this system is transform/opacity only.

## Data Export

**Client-side CSV export** (`exportCustomersCsv()` in the customers page): builds a CSV string from selected rows, wraps it in a `Blob`, and triggers a download via `URL.createObjectURL` + a programmatic anchor click. No new backend endpoint. Wired to the roster's bulk-selection toolbar as a `bulkActions` slot. This is a page-level pattern, not (yet) a promoted `Storm*` component — if a second export button appears elsewhere, promote this to a shared helper rather than re-implementing the Blob/anchor dance.

## Do's and Don'ts

### Do:

- **Do** keep every admin style inside the `.storm` scope (rooted at `#storm-root`), and re-check any new global `h1..h4` rule in `globals.css` against the storm heading reclaim.
- **Do** reach for the Tailwind colour keys (`bg-paper-lift`, `text-rain`, `border-mist`, `bg-elevated`, `bg-scrim`, …) for anything that must repaint correctly in dark mode — never a literal hex value or a `dark:` prefix in admin markup.
- **Do** use `scrim` (never `ink` or another inverting token) for any overlay/dim layer, and `accent` (never `ink`) for any fixed-colour brand chip that must not flip between themes.
- **Do** carry status with the four-family soft-fill pill system, applied identically to pills, badges, KPI numbers and toasts, in both themes.
- **Do** give every rounded surface a shadow token (`storm-xs` at minimum) — nothing in this world sits flat.
- **Do** strip a persistent wrapper's fill-mode animation class on `onAnimationEnd` if it uses `both`/`forwards` on a transform-based keyframe.
- **Do** use tabular numerals on every count, price and date so columns align.
- **Do** give every roster a designed sub-`lg` record-card list rather than letting a table scroll sideways.
- **Do** put sticky positioning and borders on individual `<th>` elements, not `<thead>`, for any sticky table header.

### Don't:

- **Don't** reintroduce the discarded ledger system's vocabulary into `.storm`: no zero-radius overrides, no letter-spaced caps kickers or eyebrows outside the existing sidebar group-label exception, no ink-weight-only status, no giant uppercase monument word.
- **Don't** let a hue outside a status pill's assigned family stand in for that status.
- **Don't** animate a status pill on mount — the cross-fade belongs to an actual state change, not to page load.
- **Don't** carry customer-world material (glow shadows, frosted glass, cyan, Manrope) into the admin world, or Framer Product Console material into the customer world.
- **Don't** make whole-row click the only path to a record; the row link stays the keyboard and screen-reader target.
- **Don't** animate `width`/`height`/`top`/`left` in `.storm` outside the one sanctioned, bounded sidebar exception — everything else is transform/opacity.
- **Don't** regress `quiet`'s dark-mode value below `#8B8B8B` for a "quieter" look; it was set there to clear WCAG AA contrast and carries real text.
