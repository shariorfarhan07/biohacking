# Coaching Platform — Backend

FastAPI backend for package sales, checkout, onboarding, programme assignment,
and Everfit provisioning. See `/docs` (Swagger UI) once running for the full API
reference.

## Stack

- FastAPI + SQLAlchemy 2.0 + Alembic
- SQLite for local development (`DATABASE_URL` swaps to Postgres in production —
  every model uses cross-dialect types, so no code changes are required)
- JWT auth in httpOnly cookies (separate customer/admin sessions)
- Real Stripe SDK (test-mode keys for local dev)
- Everfit integration abstracted behind `EverfitServiceBase`, currently backed by
  a clearly-marked mock (`app/services/everfit/mock_service.py`) since Everfit
  has no public self-serve provisioning API today

## Setup

```bash
python -m venv .venv
./.venv/Scripts/activate        # or `source .venv/bin/activate` on macOS/Linux
pip install -r requirements-dev.txt
cp .env.example .env            # fill in Stripe test keys when you have them

alembic upgrade head
python scripts/seed_data.py                 # sample packages, programmes, rules
python scripts/create_admin.py admin@example.com "a-strong-password"

uvicorn app.main:app --reload   # http://localhost:8000, docs at /docs
```

## Tests

```bash
pytest
```

Every test runs inside a rolled-back transaction on a temporary SQLite file, so
the suite never touches your local `app.db` and tests never leak state into one
another.

## Stripe webhooks locally

```bash
stripe listen --forward-to localhost:8000/api/webhooks/stripe
```

Use the webhook signing secret it prints as `STRIPE_WEBHOOK_SECRET` in `.env`.

## Project layout

- `app/models/` — SQLAlchemy models. `Membership` is the central pipeline object;
  every stage of the customer journey reads/writes its `status`.
- `app/services/` — business logic and third-party integration. Routes stay thin
  and delegate here.
- `app/services/everfit/` — the Everfit integration boundary. Swap
  `mock_service.py` for a real implementation of `EverfitServiceBase` once one
  exists; nothing else in the codebase needs to change.
- `app/services/rules_engine.py` — data-driven programme-assignment engine,
  configured via the `assignment_rules` table rather than code.
- `app/services/provisioning_service.py` — idempotent orchestration of the
  rules engine + Everfit calls after onboarding completes.
- `app/api/routes/webhooks_stripe.py` — the Stripe webhook state machine, with
  an idempotency ledger (`WebhookEvent`) so replayed events are safe.
