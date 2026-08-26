# Raffle Platform — Run Instructions

Multi-tenant raffle SaaS. Full plan: [docs/PROJECT_PLAN_2.md](docs/PROJECT_PLAN_2.md).

## Architecture

```
platform.kenji-raffle.local:3003  → Platform console (all operators, rollups)
{slug}.kenji-raffle.local:3002    → Operator public site + /admin (built later)
localhost:4002                    → API (hostname → tenant DB)
```

One control plane, many operator websites — multi-tenant SaaS.

**Database model:** `kenji_platform` (registry) + **one Postgres database per operator** (`kenji_tenant_{slug}`).

## Prerequisites

- Node.js 22, npm, Docker
- kenji-government running (staff API **4000**, ingest **4001**)
- Optional: kenji-gateway for live payment tests (port **4003** locally — avoids clash with platform API **4002**)

## Port allocation (shared demo VPS with GRA)

| Service | Port |
|---------|------|
| GRA web | 3000 |
| Tenant web (public + operator admin) | **3002** |
| Platform console | **3003** |
| GRA API | 4000 |
| GRA ingest | 4001 |
| Platform API | **4002** |
| Payment gateway (`kenji-gateway`) | **4003** (local; gateway repo defaults 4002 if run alone) |
| Postgres GRA | 5436 |
| Postgres (platform) | **5437** |
| Redis GRA | 6382 |
| Redis (platform) | **6383** |
| MinIO | 9000 |

## /etc/hosts

```
127.0.0.1 platform.kenji-raffle.local
```

Add operator subdomains when you onboard tenants in the platform console (demo raffle site comes later).

## Setup

```bash
cd /var/www/Kenji-raffle
cp .env.example .env
npm install
docker compose -f docker/docker-compose.yml up -d
npm run generate -w @kenji-raffle/database-platform
npm run generate -w @kenji-raffle/database-tenant
npm run migrate:platform
npm run db:seed:platform
npm run build -w @kenji-raffle/shared && npm run build -w @kenji-raffle/database-platform
```

Operators are created in the **platform console** (not via CLI). CLI provisioning remains available for ops:

```bash
npm run provision:tenant -- --slug demo --gra-id op-001 --name "Demo Operator"
```

After tenant schema changes in development:

```bash
npm run migrate:tenants          # all active tenant DBs
npm run migrate:tenant -- --slug <slug>   # one tenant
```

## Run apps

```bash
npm run dev:api        # :4002
npm run dev:worker     # BullMQ — required for tenant DB provisioning
npm run dev:platform   # :3003
npm run dev:web        # :3002 — operator sites (later)
```

Platform login: `admin@platform.local` / `ChangeMe123!`

Custom domains: set `CUSTOM_DOMAIN_CNAME_TARGET` in `.env` (default ingress target shown in operator domain DNS instructions).

## Local dev — CORS and API proxy

The platform console and tenant sites use **custom hostnames** in `/etc/hosts` (e.g. `platform.kenji-raffle.local`, `demo.kenji-raffle.local`), while the API listens on **`localhost:4002`**. Browsers treat those as **different origins**, so calling `http://localhost:4002` directly from the UI causes **“Failed to fetch”** on login and other actions (CORS preflight fails).

**Fix (local only):** the platform Next app proxies API calls on the **same origin**:

| What | Value |
|------|--------|
| Browser calls | `http://platform.kenji-raffle.local:3003/platform-api/...` |
| Next.js forwards to | `http://127.0.0.1:4002/...` (see `apps/platform/next.config.js`) |
| `.env` | `NEXT_PUBLIC_PLATFORM_API_URL="/platform-api"` |

Use **`platform.kenji-raffle.local:3003`** (not bare `localhost:3003`) so hostnames match `/etc/hosts`. Restart `dev:platform` after changing `next.config.js` or `NEXT_PUBLIC_*` vars.

**Production (VPS)** is different: the platform build uses `NEXT_PUBLIC_PLATFORM_API_URL=https://api.force42.com`, and the API allowlists origins via `CORS_ALLOWED_ORIGINS` (see [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)). The `/platform-api` rewrite is **disabled when `NODE_ENV=production`** — live traffic always hits the public API URL directly.

Tenant sites (`demo.force42.com`, operator custom domains) call `https://api.force42.com` with the **`X-Forwarded-Host`** header so the API resolves the correct tenant. That header must appear in the API CORS **`allowedHeaders`** list (`apps/api/src/main.ts`). If it is missing, browser logins show **“Failed to fetch”** even though `curl` works.

**After `git pull`:** if operator pages return **500 Internal server error**, run `npm run migrate:platform` — new GRA onboarding columns live in platform migrations (e.g. `operator_settings.legal_name`).

## Ops runbook

| Issue | Fix |
|-------|-----|
| Platform login **“Failed to fetch”** on `*.kenji-raffle.local:3003` | Use `NEXT_PUBLIC_PLATFORM_API_URL="/platform-api"` and access via `platform.kenji-raffle.local:3003` (not cross-origin `localhost:4002`). Restart `dev:platform`. See **Local dev — CORS and API proxy** above. |
| Tenant / operator admin **“Failed to fetch”** on live `*.force42.com` | API CORS must allow `X-Forwarded-Host` (and `X-Cart-Session` for checkout). Restart `dev:api` / redeploy `raffle-api`. |
| Operator detail **500 Internal server error** after pull | Run `npm run migrate:platform` (missing `operator_settings.*` columns). |
| Operator stuck in onboarding | Ensure `npm run dev:worker` is running; check **System** page for failed jobs |
| **System → Worker “Not running”** | Start `npm run dev:worker` from repo root. Heartbeat expires after ~2 min if the process stops. Page auto-refreshes every 30s. |
| **System → Queue failed (high count)** | Usually the worker ran **without `.env`** (`PLATFORM_DATABASE_URL`, `CREDENTIALS_ENCRYPTION_KEY`). Restart worker (it loads `.env` via `--env-file`). On **System**, admins can **Clear failed jobs** after fixing. |
| **System → Queue waiting `-1`** | Fixed in API — refresh; should show `0`+. If not, restart `dev:api`. |
| Platform 500 / `Cannot find module` after build | `rm -rf apps/platform/.next` then restart `dev:platform` |
| API missing routes (404 on cart/checkout) | Restart `dev:api` |
| Rollups show zero | Run worker or wait for nightly job; sales update on payment complete |
| Tenant schema drift | Operator detail → **Run tenant migrate** (admin) |

Restart all platform services:

```bash
cd /var/www/Kenji-raffle
set -a && source .env && set +a
npm run dev:api &    # :4002
npm run dev:worker & # provisioning, rollups, DNS verify jobs
rm -rf apps/platform/.next && npm run dev:platform  # :3003
```

Operator admin (per tenant): `owner@{slug}.local` / `ChangeMe123!` — e.g. demo → `owner@demo.local`

Demo player test account (`demo.force42.com`): `player@demo.local` / `ChangeMe123!` — seed with `python3 scripts/seed-demo-tenant.py`. Populate public winners after purchases with `python3 scripts/run-demo-draw.py`.

**Demo ops:** [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) (refresh + stakeholder script), [docs/DEMO_GRA.md](docs/DEMO_GRA.md) (platform worker → GRA relay, not tenant sites).

Demo tenant hostname: `demo.kenji-raffle.local` (add to `/etc/hosts` when provisioned).

## Player flows (public site)

Players use the **tenant web** (`{slug}.kenji-raffle.local:3002` or custom domain), not the platform console.

**UI/UX delivery plan:** [docs/PLAYER_SITE_UI_PLAN.md](docs/PLAYER_SITE_UI_PLAN.md)

| Step | URL / API |
|------|-----------|
| Browse raffles | `/raffles`, `/raffles/{slug}` |
| Register | `/register` → verify email (`/verify-email?token=...` when `PLAYER_AUTO_VERIFY_EMAIL=false`) |
| Login | `/login` |
| Cart & checkout | `/cart` → `/checkout` → mock payment → `/checkout/success?order_id=...` |
| Account | `/account` — orders, tickets, wins, settings, Play Safe |
| Forgot password | `/forgot-password` → `/reset-password?token=...` |

**Dev shortcut:** `PLAYER_AUTO_VERIFY_EMAIL=true` in `.env` skips verify-email before purchase.

**Production:** set `PLAYER_AUTO_VERIFY_EMAIL=false` on the VPS. See [docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md) §14b and [docs/RAFFLE_FUNCTIONAL_TEST.md](docs/RAFFLE_FUNCTIONAL_TEST.md).

Operator staff use `/admin` on the same hostname (e.g. `demo.kenji-raffle.local:3002/admin`).

## Customer onboarding (who does what)

| Who | Where | Actions |
|-----|--------|---------|
| **Platform team** | Platform console `:3003` | Create operator, GRA keys, monitor, suspend |
| **Customer** | Their site `/admin` | Customise, raffles, **Domains & go live**, DNS at Cloudflare |

**Staging:** `{slug}.kenji-raffle.local:3002` · **Admin:** `/admin` · **Owner:** `owner@{slug}.local`

**Custom domain:** Customer adds `www.theirbrand.co.ke` in Admin → Domains, adds CNAME → `CUSTOM_DOMAIN_CNAME_TARGET` in Cloudflare, clicks Verify DNS. Not an A record on `@` — use CNAME on www or a subdomain.

See [docs/OPERATOR_ONBOARDING.md](docs/OPERATOR_ONBOARDING.md).

## Tenant vs platform

| Console | Who | Sees |
|---------|-----|------|
| Platform console (`:3003`) | Platform staff | All operators, rollups, domains, GRA keys, audited drill-down |
| Operator `/admin` | Operator staff | Only their tenant DB |
| Public site | Players | Only their tenant branding and raffles |

Per-tenant GRA API keys and tenant DB credentials live in the **platform database** (encrypted), not in `.env`. Integration details: [IMPORTANT.md](IMPORTANT.md) (**start with “Still open — do not forget”**), [docs/GRA_INTEGRATION_ARCHITECTURE.md](docs/GRA_INTEGRATION_ARCHITECTURE.md), [docs/GRA_RELAY_RUNBOOK.md](docs/GRA_RELAY_RUNBOOK.md).

**GRA egress:** Only `npm run dev:worker` POSTs to GRA ingest (`:4001`). Tenant API enqueues events only.

**GRA tests:** `npm run test:gra-outbound` or `npm run test:gra-relay-integration`

## Scaling

When the VPS is full, scale the **platform app tier** and Postgres cluster — not deploy per website. See PROJECT_PLAN_2.md §12.

## Production VPS

Full deploy guide (systemd, Nginx, Cloudflare, MinIO, updates, troubleshooting):

**[docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md)**
