# Raffle Platform

**Kenya multi-tenant raffle SaaS.** One control plane hosts many licensed operator websites. **Platform staff** use the **platform console**; operators get their domain and `/admin`; players buy tickets on the operator site.

Built for the GRA regulatory model. Standalone product — not a clone of any other codebase.

**Prerequisite:** GRA government portal (`/var/www/kenji-government`) is live with ingest API (`:4001`).

**Integration:** Operators **push** signed events to GRA ingest; GRA staff use the government console only — they do not log into operator sites. See [IMPORTANT.md](IMPORTANT.md).

**Note:** Repo folder `/var/www/Kenji-raffle` is a temporary path name; product branding will be chosen later.

## What we build first

1. **Platform console** — all operators, rollups, domains, health, GRA keys  
2. **Tenant onboarding** — subdomain + custom domain per operator  
3. **Operator admin** — tenant-scoped staff console  
4. **Raffle product** — catalog, cart, checkout, draws, GRA feed  

Designed for **50–100+ operator sites** on one shared stack — **one database per operator website** plus a central platform registry DB.

## Docs

| File | Purpose |
|------|---------|
| [IMPORTANT.md](IMPORTANT.md) | **GRA + payment gateway integration** — event mapping, tax, TODOs |
| [docs/PROJECT_PLAN_2.md](docs/PROJECT_PLAN_2.md) | Full plan — architecture, phases, DB, API |
| [docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md) | **Production VPS deploy**, systemd, Nginx, troubleshooting |
| [instructions.md](instructions.md) | Local setup, ports, hostnames |
| [docs/BACKUP_RUNBOOK.md](docs/BACKUP_RUNBOOK.md) | Backup & restore |
| [docs/OPERATOR_ONBOARDING.md](docs/OPERATOR_ONBOARDING.md) | Customer domain & go-live |
| [.env.example](.env.example) | Environment variables |

## Ecosystem

| Project | Path | Role |
|---------|------|------|
| GRA Government Portal | `/var/www/kenji-government` | Oversight, ingest, tax escrow, AML |
| Raffle Platform (this repo) | `/var/www/Kenji-raffle` | Multi-tenant raffle SaaS |
| Harambe Payment Gateway | `/var/www/kenji-gateway` | Live payments — notifies GRA via `gateway/notify` |

## Local URLs

| App | URL |
|-----|-----|
| Platform console | `http://platform.kenji-raffle.local:3003` |
| Tenant site (example) | `http://safarijackpot.kenji-raffle.local:3002` |
| Platform API | `http://localhost:4002` |
| GRA console | `http://localhost:3000` |
| GRA ingest | `http://localhost:4001` |

Add to `/etc/hosts`:

```
127.0.0.1 platform.kenji-raffle.local
127.0.0.1 safarijackpot.kenji-raffle.local
```

## Quick start

```bash
cd /var/www/Kenji-raffle
cp .env.example .env
# Scaffold starts at Phase P0 — see PROJECT_PLAN_2.md
```
