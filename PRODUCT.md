# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Customers:** men buying online coaching. They arrive through the marketing site,
choose a package, pay, complete an onboarding assessment, and then live inside
Everfit for the actual coaching. They touch this product rarely after signup —
mostly to check status or billing.

**Admin/ops team (primary users of the admin panel):** a small ops team of roughly
1–3 people working the customer queue daily as a real job. They filter, scan, and
unblock customers stuck between pipeline steps, issue refunds, retry failed
Everfit provisioning, and manage packages/programmes/assignment rules. Primary
context is desktop or laptop at a desk for sustained queue-working; they also
check the attention queue from a phone between sessions, so mobile must be
genuinely designed, not merely reflowed.

Two admin roles exist: `admin` and `staff`.

## Product Purpose

Sell coaching packages and automate Everfit customer provisioning. The website
owns marketing, package selection, accounts, payment, onboarding, programme
selection logic, Everfit provisioning, and customer status tracking. Everfit owns
the coaching itself: workouts, nutrition, habits, check-ins, and coach
communication.

Success means a customer goes from visitor to active, programme-assigned Everfit
client with minimal manual administration, and that any customer who falls out of
that pipeline is visible and fixable by ops before the customer notices.

## Positioning

Programme assignment is rules-driven rather than manual: onboarding answers are
evaluated against admin-editable rules (goal × training location × training days,
combinable) to select an Everfit programme automatically. Ops staff tune the rules
themselves, without a deploy, and can dry-run them before they affect real
customers.

## Operating Context

The customer pipeline is a state machine on `Membership.status`:
`pending_payment → onboarding_pending → onboarding_complete → provisioning →
provisioned`, with `payment_failed`, `provisioning_failed`, `canceled`, and
`refunded` as off-ramps. Everfit provisioning has its own sub-states:
`not_started → client_created → programme_assigned → activated | failed`.

Ops work is fundamentally queue-shaped: find customers stuck between steps
("paid but onboarding incomplete", "onboarding complete but Everfit pending",
"Everfit provisioning failed"), then act on them. Admin actions with real
consequences — refunds, programme overrides, manual status corrections — are
written to an audit log.

## Capabilities and Constraints

- Stack: Next.js 14 App Router + TypeScript + Tailwind (frontend), FastAPI +
  SQLAlchemy + Alembic (backend), SQLite locally and Postgres-ready.
- Auth is JWT in httpOnly cookies, with separate customer and admin sessions
  (distinct cookie names and a role claim).
- Payments run through real Stripe Checkout; membership status changes only via
  verified, idempotent webhooks. A payment is never faked.
- Everfit has no public self-serve provisioning API today, so provisioning runs
  against a clearly-marked mock behind a swappable `EverfitServiceBase`
  interface.
- Admin surfaces: overview, requires-attention queue, customers list and detail,
  packages, programmes, assignment rules, discount codes, contact messages.
- Pricing and packages are admin-editable data, not hardcoded.

## Brand Commitments

Product name in the interface: **Biohacking** (admin wordmark "Biohacking Admin").
The public-facing marketing site uses a premium dark aesthetic — obsidian
background, white type, electric cyan accents, deep blue, subtle ultraviolet,
frosted-glass panels, soft glow. That world is committed for the marketing and
customer-facing surfaces.

The product must stay inside a coaching and education boundary: it never
prescribes medication, never recommends or adjusts steroid/TRT/peptide doses, and
never diagnoses. Individual medical decisions belong to independent qualified
medical professionals.

## Evidence on Hand

Results/transformation content is explicitly labelled example/illustrative — there
are no real client outcomes, testimonials, or named clients, and none may be
fabricated. Team profiles on the About page are placeholder data meant to be
edited. Seeded packages, programmes, and assignment rules are illustrative sample
data, not committed business pricing.

## Product Principles

1. **The pipeline is the product.** Every admin surface exists to move customers
   forward through it or to reveal where they stalled.
2. **Nothing stalls silently.** Any customer who falls out of the happy path
   surfaces in an operational queue with a stated reason.
3. **Automate the default, expose the override.** Rules assign programmes
   automatically; humans can override, and overrides are audited.
4. **Customers never see machinery.** Technical failures reach ops in full detail
   and reach customers as calm, non-technical status.
5. **Money operations are deliberate.** Refunds, cancellations, and status
   corrections require intent and leave a trail.

## Accessibility & Inclusion

No product-specific standard was established beyond general good practice:
semantic HTML, keyboard operability, visible focus, accessible form labelling and
errors, adequate contrast on the dark ground, and reduced-motion support.
