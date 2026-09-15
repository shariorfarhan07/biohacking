---
version: 1
slug: "frontend-app-admin-admin-page-tsx"
primary_target: "frontend/app/(admin)/admin/page.tsx"
related_targets: ["frontend/components/layout/AdminShell.tsx","frontend/app/(admin)/admin/customers/page.tsx"]
---

Scope: the admin panel (all `/admin` routes and the admin shell). Visitor mode: Operate.

Audience: 1–3 ops staff working the customer queue daily at a desk, plus phone
checks of the attention queue between sessions. Job: find who is stuck in the
pipeline and unstick them — refunds, provisioning retries, programme overrides,
rule tuning. Constraint: expression may never obscure task, state, or affordance.

Chosen direction: Framer Product Console, replacing Alphabet Storm outright.
User-pinned via explicit reference (framer.com/seo and a Mobbin section) rather
than taken from a rolled hand; the old ink-on-paper world is discarded as
anti-reference, not carried forward. The customer-facing dark obsidian/cyan
world stays untouched.

## Direction contract

THESIS: Refuses both the ink ledger and the neon dark-console default. Ops runs
this like real daily-use software — muted, rounded, one calm accent doing the
work six loud colours used to do worse.

OWN-WORLD: White ground #FFFFFF; soft-gray surfaces #F7F8FA on #E4E7EC hairlines;
ink #101828, secondary #475467, muted #98A2B3; one accent blue #2563EB for
actions/links/active states. Status returns to colour: success #12B76A, pending
#F79009, danger #F04438, each a soft-fill pill. Inter throughout. rounded-lg/xl
cards, inputs, pill buttons; a 1px near-black wash at ~5% opacity for shadow,
never absent.

STORY: Ops opens a clean console — sidebar, KPI row, roster with coloured status
pills — scans by colour and number, acts on the stuck row, it settles.

FIRST VIEWPORT: ~152px sidebar (wordmark, iconed nav, live attention-count
badge) beside a white field: page title top-left, date/filter pill top-right, a
3–4 card KPI row (one card a circular progress ring), then the attention roster
starting directly beneath with coloured status pills per row.

FORM: Framer Product Console — brief-pinned by the user (framer.com/seo, Mobbin
section 6881fc8b-1657-4135-abe0-e039a35e777a, plus live Framer app screens
gathered as evidence); a pinned direction beats the roll, so no concept-seed ran.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

The KPI row's lead card is a circular progress ring (echoing Framer's Core Web
Vitals rings) showing pipeline health as a percentage; its stroke sweeps in once
on load or real change, never on every render, and is still under
reduced-motion. Status pills cross-fade colour and label on a real state change
instead of hard-swapping.

## Unresolved

None blocking. Customer-facing surfaces are explicitly out of scope.
