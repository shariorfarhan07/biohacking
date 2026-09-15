# Deployment

Two containers, one public port: `frontend` (Next.js, standalone build) is
the only thing published to the host. `backend` (FastAPI + SQLite, Alembic
migrations run on boot) has no host port at all — it's reachable only from
`frontend` over Docker's internal network, as `http://backend:8000`.

The browser only ever talks to the frontend's port. Client-side API calls hit
same-origin `/api/...` paths, which `frontend/next.config.js`'s `rewrites()`
forwards internally to the backend — so there is no domain, no TLS
certificate, and no second open port needed just to get a working deployment
on a bare IP. Server-side (SSR) calls skip the proxy hop entirely and reach
`backend:8000` directly (`INTERNAL_API_URL`, set in `docker-compose.yml`).

## Currently deployed

Running on `169.58.83.145`, port `5555`, as `/biohacking` (alongside an
unrelated `digitalworld` project on the same box — this deploy does not touch
its nginx config, ports, or containers). Confirmed working:

- `http://169.58.83.145:5555` — customer-facing site
- `http://169.58.83.145:5555/admin/login` — `admin@example.com` /
  `AdminPass123!`
- Backend port 8000 has no host binding — verified unreachable from outside
  the box.
- Sample packages/programmes/assignment rules seeded via `seed_data.py`.

`backend/.env` on the server has `ENV=development`. That's deliberate, not an
oversight: no real Stripe keys are configured yet, and `ENV=development`
keeps the `/api/checkout/dev-session` skip-payment bypass available so the
onboarding funnel can be tested end to end without them. See **Going to real
production** before this ever takes a real customer or payment.

## Prerequisites (for a new server)

- Docker + the Docker Compose plugin (`docker compose version`).
- Nothing else — no domain, no DNS, no open ports beyond whichever one you
  publish the frontend on.

## First deploy

```bash
# Copy the project to the server (no .git needed; excludes deps/caches/secrets)
tar --exclude='node_modules' --exclude='.next' --exclude='.venv' \
    --exclude='__pycache__' --exclude='.pytest_cache' --exclude='.ruff_cache' \
    --exclude='*.pyc' --exclude='*.db' --exclude='backend/.env' \
    --exclude='frontend/.env.local' --exclude='.git' \
    -czf - . | ssh user@server "mkdir -p /biohacking && tar -xzf - -C /biohacking"

ssh user@server
cd /biohacking

cp backend/.env.example backend/.env
# Edit backend/.env:
#   - JWT_ACCESS_SECRET / JWT_REFRESH_SECRET: generate real values —
#     python3 -c "import secrets; print(secrets.token_urlsafe(64))"
#   - FRONTEND_URL: http://<server-ip>:<port> (or your domain once you have one)
#   - Leave ENV=development until real Stripe keys are set (see above).

# Change the published port if you don't want 5555:
#   FRONTEND_PORT=8080 docker compose up -d
# or edit the "5555:3000" line in docker-compose.yml directly.

docker compose build
docker compose up -d
```

On boot, the backend container runs `alembic upgrade head` before starting
uvicorn, so the schema is always current — no separate migration step.

Create the first admin account:

```bash
docker compose exec backend python scripts/create_admin.py <email> "<password>" --first <First> --last <Last>
```

Optionally seed sample packages/programmes/assignment rules:

```bash
docker compose exec backend python scripts/seed_data.py
```

## Redeploying after a change

Re-run the `tar | ssh ... tar -xzf` step above to sync changed files, then:

```bash
docker compose build
docker compose up -d
```

Migrations run automatically on the new backend container's startup.

## Data and backups

SQLite is the default (`DATABASE_URL=sqlite:////app/data/app.db` inside the
container), persisted in the `backend-data` named volume. Back it up with:

```bash
docker run --rm -v biohacking_backend-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/backend-data-backup.tar.gz -C /data .
```

For real load, switch to Postgres — every model already uses
Postgres-compatible SQLAlchemy types, so this needs no application code
changes. Add a `postgres` service to `docker-compose.yml`, install a
Postgres driver in `backend/requirements.txt` (e.g. `psycopg[binary]`), and
point `DATABASE_URL` in `docker-compose.yml`'s backend `environment:` block
at it instead of the SQLite path.

## Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## Going to real production

Three things to do together before this handles a real customer or payment
— doing only one leaves it broken or insecure:

1. **Get a domain and put TLS in front.** A `Caddyfile` and a two-subdomain
   reverse-proxy pattern are already written (see the repo's `Caddyfile`) for
   when you have `app.example.com` / `api.example.com` DNS records pointing
   here — ask for the matching `docker-compose.yml` changes (adding the
   `caddy` service, publishing 80/443 instead of 5555) when you're ready;
   it's a short change on top of the current setup, deliberately not made
   until there's a domain to point it at.
2. **Set `ENV=production` in `backend/.env`.** This disables the
   `/api/checkout/dev-session` bypass — the only thing currently letting
   onboarding be tested without real Stripe keys.
3. **Add real Stripe keys** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
   and point a Stripe webhook at `https://<domain>/api/webhooks/stripe`.

If you need `ENV=production` (e.g. to disable the bypass) before you have a
domain/TLS, set `COOKIE_SECURE=false` in `backend/.env` too — otherwise the
browser silently refuses to store the session cookie over plain HTTP, and
login will appear to succeed but not persist. Remove it once real TLS is in
place.

## Local development

This compose setup is for deployment, not day-to-day development — keep
using `uvicorn app.main:app --reload` (backend) and `npm run dev` (frontend)
locally, against `backend/.env` / `frontend/.env.local` pointed at
`localhost`.
