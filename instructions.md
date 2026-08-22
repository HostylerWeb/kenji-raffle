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

## Ops runbook

| Issue | Fix |
|-------|-----|
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

Demo tenant hostname: `demo.kenji-raffle.local` (add to `/etc/hosts` when provisioned).

## Player flows (public site)

Players use the **tenant web** (`{slug}.kenji-raffle.local:3002`), not the platform console.

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
