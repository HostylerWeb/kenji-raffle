# Raffle Platform — Project Plan

**Kenya multi-tenant raffle platform**

Last updated: August 2026

**Project folder:** `/var/www/Kenji-raffle` (folder name temporary — product branding TBD)  
**Prerequisite:** GRA government portal (`/var/www/kenji-government`) live with ingest API

---

## 1. What this project is

The **Raffle Platform** is a **managed SaaS** for Kenya — one production system hosts **many licensed operator websites**. Operators get their brand, domain, and admin panel. They **never** receive source code or their own server. The **platform operator** (you) runs the stack, onboarding, scaling, and updates.

This is **not** a clone of any other product. It is a **Kenya + GRA** business model: regulated operators, KES, tax split, Play Safe, real-time government feed.

### Three layers of users

| Layer | Who | Access | URL pattern |
|-------|-----|--------|-------------|
| **Platform super-admin** | Platform staff | All operators, onboarding, health, cross-site metrics | `platform.kenji-raffle.local` |
| **Operator admin** | Licensed operator staff | **Only their site** — raffles, orders, users, reports | `safarijackpot.co.ke/admin` |
| **Players** | Public | Browse and buy on operator site | `safarijackpot.co.ke` |

### Ecosystem

| Project | Role |
|---------|------|
| `kenji-government` | GRA oversight — registry, ingest, tax, AML, live feed |
| **Raffle Platform** (this repo) | Multi-tenant raffle SaaS — many sites, one control plane |
| Harambe Payment Gateway | `/var/www/kenji-gateway` — mock checkout in raffle repo; live gateway notifies GRA |

### Multi-tenant deployment + database-per-tenant

- **One codebase**, **one app tier**, **many hostnames** — standard multi-tenant SaaS.
- **One database per operator website** — physical data isolation (not one giant shared tables).
- **One platform database** — registry, domains, credentials, platform staff, rollups.
- **Not** one VPS per website. **Not** separate code deploy per operator.
- **50–100+ sites** = 50–100 **tenant databases** on a Postgres **cluster**, plus platform DB.

```
  safarijackpot.co.ke     another.co.ke     site3.kenji-raffle.co.ke
         │                      │                    │
         └──────── Cloudflare / Nginx ──────────────┘
                              │
                    Raffle Platform (shared app tier)
              (web + API + worker — horizontal scale)
                    │                    │
         Platform DB (registry)     Tenant DB op-001
         operators, domains        Tenant DB op-002
         rollups, audit             Tenant DB op-003 …
                    │
              Redis + S3 (prefix per tenant)
```

**Why DB-per-tenant:** each operator’s data stays in its own database — smaller, faster queries, isolated backups, better business trust, no cross-tenant table bloat.

### Kenya product rules

- Ticket sales in **KES**; tax split on every payment; GRA ingest per operator.
- **Play Safe**, spending limits, county-based anonymised aggregates.
- **Instant wins:** site credit, cash, physical only.
- **Coupons:** % or fixed discount.
- **No** skill questions, gamification, wheels, affiliates, or loyalty schemes.

---

## 2. Build order (critical)

**Platform first, raffle product second.**

| Order | What | Why |
|-------|------|-----|
| **1** | Platform DB + super-admin + **tenant DB provisioning** | Create operators, provision DB, domains, GRA keys |
| **2** | Hostname routing + dynamic DB connection | Each request → correct tenant database |
| **3** | Operator admin (tenant-scoped) | Staff only connect to **their** DB |
| **4** | Raffle engine | Catalog, cart, checkout, draws in tenant DB |
| **5** | GRA + payment integration | Per-tenant outbound events; Harambe mock → live |

Production architecture from day one — not an MVP rewritten at 50 sites.

---

## 3. Scope

### In scope

| Area | Detail |
|------|--------|
| Platform super-admin | All operators, onboarding, domains, health, cross-site rollups |
| **Database-per-tenant** | Automated create DB + migrate on operator onboarding |
| **Platform database** | Registry, domains, GRA keys, platform users, audit, analytics rollups |
| **Tenant database** | All player/raffle/order data — one DB per operator site |
| Operator admin | Per-tenant staff console (single tenant DB connection) |
| Public player site | Per-tenant branding on operator hostname |
| Instant wins | Site credit, cash, physical |
| Coupons | % or fixed |
| Harambe Payment Gateway | Mock in raffle API; live via `/var/www/kenji-gateway` → GRA `gateway/notify` |
| GRA feed | Per-tenant API key — push to ingest (`/events/*`); staff console read-only |
| Scale path | **100+ tenant databases** on shared Postgres cluster |

### Out of scope

| Excluded |
|----------|
| Skill-based questions |
| Gamification (XP, badges, wheels, mini-games) |
| Affiliate / referral programmes |
| Operators self-hosting or accessing source code |
| One shared business database for all operators (row-level multi-tenancy) |

---

## 4. Multi-tenant architecture (database silo)

### 4.1 Two database layers

| Database | Name (example) | Contents |
|----------|----------------|----------|
| **Platform** | `kenji_platform` | `operators`, `operator_domains`, `tenant_databases`, `operator_settings`, `platform_users`, `platform_audit_logs`, `tenant_daily_rollups` |
| **Tenant** (×N) | `kenji_tenant_{slug}` e.g. `kenji_tenant_safarijackpot` | `users`, `raffles`, `tickets`, `orders`, `payments`, `operator_staff`, `gra_outbound_events`, … |

Tenant databases share the **same schema** (one Prisma tenant model) but are **separate Postgres databases**. No `operator_id` column on tenant tables — isolation is by database boundary.

### 4.2 Request flow

**Operator / player request** (`safarijackpot.co.ke`):

1. Read `Host` header → lookup `operator_domains` in **platform DB**.
2. Load `tenant_databases` row → decrypt `database_url` (or connection params).
3. Open **tenant Prisma client** for that operator only.
4. All raffle/cart/order queries run against **that tenant DB**.

**Platform super-admin request** (`platform.kenji-raffle.co.ke`):

1. Use **platform DB** only for registry and rollups.
2. Cross-tenant live detail: connect to specific tenant DB by operator id (audit-logged), or read **rollup tables** in platform DB.
3. Never join tenant tables across DBs in SQL — aggregate via rollups or explicit per-tenant connections.

Fallback for dev: `X-Operator-Slug` header on localhost only.

### 4.3 Tenant database provisioning (automated)

On operator onboarding (platform admin):

1. Create Postgres database `kenji_tenant_{slug}` (or dedicated instance for enterprise tier).
2. Create DB user with access **only** to that database.
3. Run tenant schema migrations (`prisma migrate deploy` against tenant URL).
4. Store encrypted connection string in `tenant_databases` (platform DB).
5. Assign subdomain + optional custom domain.
6. Seed operator owner staff in **tenant DB** `operator_staff`.

Rollback on failure: drop database, mark operator `onboarding_failed`.

### 4.4 Domain types

| Type | Example | When |
|------|---------|------|
| **Platform** | `platform.kenji-raffle.co.ke` | Platform super-admin only |
| **Tenant subdomain** | `safarijackpot.kenji-raffle.co.ke` | Instant go-live after onboarding |
| **Custom domain** | `safarijackpot.co.ke` | Cloudflare CNAME to platform edge |

### 4.5 Isolation rules (non-negotiable)

| Rule | Implementation |
|------|----------------|
| **Physical DB boundary** | Tenant A cannot query Tenant B — separate databases |
| Connection routing | API never uses tenant URL from client; only from platform registry |
| Operator staff JWT | Includes `operator_id` → resolves to one tenant DB |
| Platform access | `platform_admin` may open tenant DB for support — every access audit-logged |
| Storage | S3 prefix `tenants/{operator_id}/…` |
| GRA credentials | Encrypted in platform `operator_settings` |
| Rate limits | Per tenant + per IP |
| Backups | **Per tenant database** — independent restore |

### 4.6 Designed for 100+ tenant databases

| Concern | Production approach |
|---------|---------------------|
| Many databases | One Postgres cluster hosts many DBs; monitor total size and connections |
| Connections | PgBouncer with **per-database pools** or capped dynamic pool; limit max concurrent tenant connections |
| Ticket hot path | Small tenant DB — `SELECT … FOR UPDATE` on `tickets` only within one raffle |
| Cross-site dashboard | **Nightly worker** rolls GGR/sales into `tenant_daily_rollups` on platform DB |
| Live platform dashboard | Read rollups + registry — not live query of 100 DBs on every page load |
| Onboarding | Fully automated provision in < 15 minutes |
| Enterprise tier (optional) | Single tenant on dedicated Postgres instance — same code path, different `database_url` |

---

## 5. Technology stack

### 5.1 Applications

| App | Purpose | Hostname |
|-----|---------|----------|
| `apps/platform` | Next.js — platform console (super-admin) | `platform.kenji-raffle.*` |
| `apps/web` | Next.js — public + operator `/admin` | Operator domains |
| `apps/api` | NestJS — tenant DB routing middleware | API / internal |
| `apps/worker` | BullMQ — jobs per tenant DB | — |

### 5.2 Shared stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 22 |
| API | NestJS on Fastify |
| UI | Next.js 15, React 19, Tailwind, shadcn/ui |
| ORM | Prisma — **two schemas**: `platform` + `tenant` |
| Platform DB | PostgreSQL 16 — `kenji_platform` |
| Tenant DBs | PostgreSQL 16 — `kenji_tenant_*` (many on one cluster) |
| Queue / cache | Redis 7 + BullMQ (job payload includes `operator_id`) |
| Files | MinIO / S3 |
| Edge | Cloudflare (DNS, SSL, custom hostnames) |

### 5.3 Payments — Harambe Payment Gateway

| Stage | Behaviour |
|-------|-----------|
| **Now** | Mock checkout in API — branded **Harambe Payment Gateway** |
| **Later** | Live gateway; per-tenant merchant config in platform `operator_settings` |

### 5.4 Port allocation (shared demo VPS with GRA)

| Service | Port | Notes |
|---------|------|-------|
| GRA web | 3000 | kenji-government |
| Platform admin | **3003** | Platform console (super-admin) |
| Tenant web | **3002** | Public + operator admin |
| GRA API | 4000 | |
| GRA ingest | 4001 | |
| Platform API | **4002** | |
| Harambe gateway | **4003** (local; see [IMPORTANT.md](../IMPORTANT.md)) |
| Postgres GRA | 5436 | |
| Postgres (platform) | **5437** | Platform DB + all tenant DBs on same instance (dev) |
| Redis GRA | 6382 | |
| Redis (platform) | **6383** | |
| MinIO | 9000 | Buckets / prefixes per tenant |

See [.env.example](../.env.example).

### 5.5 Docker (local dev)

`docker/docker-compose.yml` provisions:

| Service | Port | Notes |
|---------|------|-------|
| Postgres 16 | **5437** | Creates `kenji_platform` DB + user with **`CREATEDB`** for tenant provisioning |
| Redis 7 | **6383** | |

The `kenji_platform` Postgres user must have **`CREATEDB`** so `provision-tenant` can create `kenji_tenant_*` databases. For production, use a restricted provisioning role or managed DB API — never expose superuser to the app.

MinIO reuses host `localhost:9000` (shared with kenji-government) with bucket `kenji-raffle`.

---

## 6. Platform super-admin (build first)

Platform staff manage **all operators** from one console. Live business detail for a site connects to **that tenant DB** (audited); overview metrics read **rollup tables**.

### 6.1 Capabilities

| Module | Functions |
|--------|-----------|
| **Dashboard** | Active tenants, total sales today (rollups), failed GRA events, provisioning status |
| **Operators** | Create, edit, suspend; link `gra_registry_id`; **provision tenant DB** |
| **Domains** | Subdomain + custom domain DNS workflow |
| **Onboarding** | Wizard: operator → **create DB** → migrate → subdomain live → GRA key → invite staff |
| **GRA credentials** | Encrypted per operator in platform DB |
| **Cross-operator reports** | From `tenant_daily_rollups` — not live scan of 100 DBs |
| **Tenant drill-down** | Open specific operator — audited connection to tenant DB |
| **Audit** | All platform admin actions |
| **Platform users** | Platform staff (`platform_admin`, `platform_support`) |
| **System** | DB cluster health, connection pool stats, worker queues |

### 6.2 Platform routes (`apps/platform`)

| Route | Page |
|-------|------|
| `/` | Platform dashboard (rollups) |
| `/operators` | All tenants |
| `/operators/new` | Onboard + provision DB |
| `/operators/[id]` | Detail, DB status, domains, GRA |
| `/operators/[id]/domains` | Domain setup |
| `/operators/[id]/data` | Audited tenant DB drill-down |
| `/reports` | Cross-operator analytics |
| `/platform-users` | Platform staff |
| `/system` | Health, pools, jobs |
| `/audit` | Platform audit log |

---

## 7. Operator admin (tenant-scoped)

Operator staff JWT resolves to **one tenant database**. No cross-tenant queries possible. All routes live in `apps/web` under `/admin` on the **operator hostname** (not the platform hostname).

### 7.1 Roles (tenant DB `operator_staff`)

| Role | Typical access |
|------|----------------|
| `owner` | Full tenant access, staff, settings, payouts |
| `manager` | Raffles, orders, draws, coupons, reports |
| `support` | Users, orders (read), prize claims |
| `finance` | Payments, reports, refunds (no raffle edits) |

### 7.2 Operator admin routes

| Route | Page |
|-------|------|
| `/admin` | Dashboard — sales today, active raffles, pending claims, low tickets |
| `/admin/raffles` | Raffle list |
| `/admin/raffles/new` | Create raffle |
| `/admin/raffles/[id]` | Edit raffle, gallery, prizes, instant wins |
| `/admin/raffles/[id]/tickets` | Ticket pool — generate, view sold/available/reserved |
| `/admin/orders` | Order search, refund, CSV export |
| `/admin/payments` | Payment list, reconcile with Harambe records |
| `/admin/users` | Player search |
| `/admin/users/[id]` | Player detail — limits, KYC, disable, tickets |
| `/admin/winners` | Run draw, pick winners, announce |
| `/admin/prize-claims` | Physical prize shipping queue |
| `/admin/coupons` | Coupon campaigns |
| `/admin/reports` | GGR, sales by raffle, tax summary (tenant DB only) |
| `/admin/settings` | Branding preview, licence display, support email (writes platform `operator_settings`) |
| `/admin/staff` | Operator staff accounts and roles |
| `/admin/gra-events` | Failed GRA outbound events + retry (tenant DB queue) |

### 7.3 Operator admin features

| Module | Detail |
|--------|--------|
| Dashboard | Sales today, active raffles, open claims, tickets running low |
| Raffles CRUD | Create, edit, publish, gallery, main prizes, instant win prizes |
| Ticket pool | Generate N tickets; monitor `available` / `reserved` / `purchased` |
| Orders | Search, refund (releases tickets + GRA void event), export |
| Payments | List, filter by status, link to orders |
| Users | Search, spending limits, disable account, KYC status |
| Winners | Manual draw, automatic draw config, winner announcement |
| Prize claims | Physical prize fulfilment — pending → shipped → delivered |
| Coupons | % or fixed discount; usage limits and validity window |
| Reports | GGR, tax, sales by raffle — reads **tenant DB only** |
| Settings | Branding and licence (stored in platform DB); payment display name |
| Staff | Invite operator staff; RBAC |
| GRA queue | View `gra_outbound_events` failures; manual retry |

---

## 8. Public player site

All player data lives in **that operator’s tenant database**. The same email on two operator sites = two independent accounts in two separate DBs. Routes are in `apps/web` on the **operator hostname**.

### 8.1 Public routes

| Route | Page |
|-------|------|
| `/` | Home — featured raffles, categories, recent winners |
| `/raffles` | Browse all active raffles — filter by category, ending soon, featured |
| `/raffles/[slug]` | Raffle detail — gallery, prizes, ticket counter, buy UI |
| `/cart` | Cart — multi-raffle, expiry countdown, edit quantities |
| `/checkout` | Checkout — login/register, coupon, Harambe Payment Gateway step |
| `/checkout/success` | Order confirmation — ticket numbers, instant win reveal |
| `/checkout/failed` | Payment failed — retry or return to cart |
| `/login` | Player login |
| `/register` | Player registration — age gate, county, email |
| `/account` | Account overview |
| `/account/tickets` | My tickets — numbers, raffle links |
| `/account/wins` | My wins — draw + instant |
| `/account/settings` | Profile, spending limits, Play Safe |
| `/winners` | Public winner list (operator-configurable) |
| `/faq` | FAQ |
| `/contact` | Support form |
| `/terms` | Terms of use |
| `/privacy` | Privacy policy |
| `/play-safe` | Play Safe information + activation |

### 8.2 Public features

| Feature | Detail |
|---------|--------|
| Home | Featured raffles, categories, recent winners |
| Raffle detail | Gallery, prizes, “X tickets left”, quantity selector |
| Cart | Multi-raffle basket; reservation TTL countdown |
| Checkout | Guest or logged-in path; coupon code; Harambe mock checkout |
| Order confirmation | Ticket numbers list; instant win notification if applicable |
| Account | Profile, tickets, wins, site credit balance |
| Play Safe | Self-exclusion + cooling-off; blocks checkout |
| Legal | FAQ, Terms, Privacy; GRA licence number in footer |
| Contact | Support form to operator support email |

### 8.3 Automated jobs (tenant-aware, `apps/worker`)

| Job | Schedule | Scope |
|-----|----------|--------|
| Release expired cart reservations | Every 1 min | Per tenant DB |
| End raffle at `end_date` | Scheduled | Per tenant DB |
| Auto-draw (if configured) | After end + min tickets met | Per tenant DB |
| GRA webhook retry | BullMQ on failure | Per tenant DB queue |
| Email — order confirm, win, claim | On event | Per tenant |
| **Platform rollup** | Nightly 02:00 EAT | All active tenants → `tenant_daily_rollups` |

---

## 9. Database structure

Lowercase tables/columns, plural names, lowercase enums.

### 9.1 Platform database (`kenji_platform`)

#### `operators`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| gra_registry_id | unique — e.g. `op-001` |
| name, slug | slug unique — drives `kenji_tenant_{slug}` |
| status | `onboarding`, `active`, `suspended`, `archived`, `onboarding_failed` |
| licence_number | GRA display |
| default_tax_rate | decimal — default **0.30** (30%) on checkout; align with GRA `GOVERNMENT_TAX_RATE` for gateway payments |
| created_at, updated_at | |

#### `tenant_databases`

| Column | Notes |
|--------|-------|
| operator_id | FK unique |
| database_name | e.g. `kenji_tenant_safarijackpot` |
| database_host | Postgres host |
| database_port | |
| database_user | scoped to this DB only |
| database_password_encrypted | |
| connection_url_encrypted | full URL for app use |
| schema_version | tenant migration version |
| provisioned_at | |
| status | `provisioning`, `active`, `failed` |

#### `operator_domains`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| operator_id | FK |
| hostname | unique — full hostname e.g. `safarijackpot.kenji-raffle.co.ke` |
| domain_type | `subdomain`, `custom` |
| verification_status | `pending`, `verified`, `failed` |
| ssl_status | `pending`, `active` |
| is_primary | boolean |
| created_at | |

#### `operator_settings` (platform DB)

| Column | Notes |
|--------|-------|
| operator_id | FK unique |
| logo_url | |
| primary_color | hex |
| support_email | |
| footer_licence_text | |
| social_links | jsonb |
| gra_api_key_encrypted | |
| gra_hmac_secret_encrypted | |
| payment_merchant_ref_encrypted | nullable |
| created_at, updated_at | |

#### `platform_users`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| email | unique |
| password_hash | |
| role | `platform_admin`, `platform_support` |
| last_login_at | timestamptz |
| created_at, updated_at | |

#### `platform_audit_logs`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| platform_user_id | FK |
| operator_id | FK nullable |
| action | varchar |
| entity_type | varchar |
| entity_id | varchar nullable |
| metadata | jsonb |
| created_at | |

#### `tenant_daily_rollups`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| operator_id | FK |
| date | date |
| gross_sales | decimal |
| tax_collected | decimal |
| orders_count | integer |
| active_raffles | integer |
| failed_gra_events | integer |
| created_at | |

Unique: `(operator_id, date)`. Used for platform dashboard — not live queries across tenant DBs.

### 9.2 Tenant database (`kenji_tenant_{slug}`) — same schema for every operator

**No `operator_id` on tables** — entire database belongs to one operator.

#### `operator_staff`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| email | unique in tenant DB |
| password_hash | |
| role | `owner`, `manager`, `support`, `finance` |
| last_login_at | timestamptz |
| created_at, updated_at | |

#### `users` (players)

| Column | Notes |
|--------|-------|
| id | uuid PK |
| email | unique in tenant DB |
| phone | Kenya +254 |
| password_hash | |
| full_name | |
| date_of_birth | date — 18+ gate |
| county | Kenya county |
| email_verified_at | timestamptz |
| site_credit_balance | decimal(18,2) KES |
| spending_limit | decimal nullable |
| spending_limit_period | `weekly`, `monthly` |
| play_safe_active | boolean |
| play_safe_until | timestamptz nullable |
| kyc_status | `none`, `pending`, `verified` |
| account_disabled | boolean |
| registration_ip | |
| last_login_at | timestamptz |
| created_at, updated_at | |

#### `user_shipping_addresses`

`user_id`, `label`, `county`, `town`, `address_line`, `postal_code`, `is_default`.

#### `login_logs`

`user_id` nullable, `operator_staff_id` nullable, success, ip_address, created_at.

#### `categories`

`name`, `slug` unique, `image_url`, `sort_order`.

#### `raffles`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| title, slug | slug unique in tenant DB |
| description | text |
| category_id | FK nullable |
| start_date, end_date | timestamptz |
| ticket_price | decimal KES |
| max_entries | total pool size |
| min_tickets | minimum before draw |
| ticket_limit_per_user | integer nullable |
| draw_type | `manual`, `automatic`, `scheduled` |
| number_of_winners | integer |
| status | `draft`, `listed`, `active`, `to_be_drawn`, `drawn`, `cancelled`, `failed` |
| is_featured | boolean |
| featured_image_url | |
| cash_alternative_amount | decimal nullable |
| created_at, updated_at | |

#### `raffle_gallery`

`raffle_id`, `image_url`, `sort_order`.

#### `prizes` (main draw)

`raffle_id`, `name`, `prize_type` (`physical`, `cash`, `site_credit`), `value_kes`, `image_url`, `sort_order`.

#### `instant_win_prizes`

`raffle_id`, `name`, `prize_type` (**`site_credit`, `cash`, `physical`** only), `prize_value`, `win_frequency`, `total_available`, `total_awarded`, `status` (`active`, `paused`, `completed`).

#### `tickets`

| Column | Notes |
|--------|-------|
| id | uuid PK |
| raffle_id | FK |
| ticket_number | integer |
| user_id | FK nullable |
| session_id | guest cart hold |
| order_id, payment_id | FK nullable |
| status | `available`, `reserved`, `purchased`, `cancelled`, `winning` |
| purchase_price | decimal |
| instant_win_prize_id | FK nullable |
| reserved_until | timestamptz |
| created_at, updated_at | |

Unique: `(raffle_id, ticket_number)`. Indexes: `(raffle_id, status)`, `(session_id, raffle_id)`.

#### `cart_items`

`user_id` nullable, `session_id`, `ip_address`, `raffle_id`, `ticket_quantity`, `unit_price`, `subtotal`, `discount_amount`, `final_amount`, `ticket_numbers` jsonb, `coupon_id` nullable, `expires_at`, `created_at`.

#### `orders`

`user_id`, `sub_total`, `discount`, `total`, `coupon_code`, `status` (`pending`, `completed`, `cancelled`, `failed`), `payment_method`, `transaction_id`, `created_at`, `updated_at`.

#### `order_items`

`order_id`, `raffle_id`, `quantity`, `unit_price`, `subtotal`, `discount`, `total`.

#### `coupons`

`code` unique, `discount_type` (`percent`, `fixed`), `discount_value`, `min_order_amount`, `max_uses`, `uses_count`, `valid_from`, `valid_until`, `status` (`active`, `disabled`).

#### `coupon_redemptions`

`coupon_id`, `user_id`, `order_id`, `created_at`.

#### `payments`

`order_id`, `user_id`, `amount` gross, `operator_amount`, `tax_amount`, `tax_rate`, `transaction_id`, `payment_method` (`card`, `mpesa`, `mock`), `status` (`pending`, `completed`, `failed`, `refunded`), `gateway_mode` (`mock`, `live`), `gra_reported_at`, `created_at`.

#### `winners`

`raffle_id`, `user_id`, `ticket_id`, `prize_id`, `announced_at`.

#### `instant_win_awards`

`ticket_id`, `instant_win_prize_id`, `user_id`, `awarded_at`, `status`.

#### `prize_claims`

`user_id`, `winner_id` or `instant_win_award_id`, address fields, `status` (`pending`, `shipped`, `delivered`).

#### `gra_outbound_events`

`event_type`, `payload` jsonb, `status`, `retry_count`, `last_error`, `created_at`, `processed_at`.

#### `media`

`storage_key`, `mime_type`, `size_bytes`, `uploaded_by_staff_id`, `created_at`.

#### `tenant_audit_logs`

`operator_staff_id`, `action`, `entity_type`, `entity_id`, `metadata` jsonb, `created_at`.

### 9.3 Prisma package layout

```
packages/database/
├── platform/
│   └── schema.prisma      # platform DB models
├── tenant/
│   └── schema.prisma      # tenant DB models (applied to each kenji_tenant_*)
└── scripts/
    ├── migrate-platform.sh
    ├── migrate-tenant.sh    # migrate one tenant by operator_id
    └── provision-tenant.ts  # create DB + user + migrate
```

---

## 10. API surface

All tenant routes resolve hostname → platform registry → **tenant DB client**. Platform routes use **platform DB only** (except audited drill-down).

### 10.1 Platform auth — `/v1/platform/auth/*`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/platform/auth/login` | Platform staff login |
| POST | `/v1/platform/auth/logout` | Logout |
| POST | `/v1/platform/auth/refresh` | Refresh JWT |

### 10.2 Platform API — `/v1/platform/*`

JWT + `platform_admin` or `platform_support`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/platform/dashboard` | Rollups summary, system health |
| GET | `/v1/platform/operators` | List all operators |
| POST | `/v1/platform/operators` | Create operator + provision tenant DB |
| GET | `/v1/platform/operators/:id` | Operator detail, DB status, domains |
| PATCH | `/v1/platform/operators/:id` | Update operator, suspend, archive |
| POST | `/v1/platform/operators/:id/reprovision-db` | Retry failed DB provisioning |
| GET | `/v1/platform/operators/:id/domains` | List domains |
| POST | `/v1/platform/operators/:id/domains` | Add subdomain or custom domain |
| PATCH | `/v1/platform/operators/:id/domains/:domainId` | Verify / set primary |
| GET | `/v1/platform/operators/:id/settings` | GRA keys, branding (masked secrets) |
| PATCH | `/v1/platform/operators/:id/settings` | Update settings, rotate GRA keys |
| GET | `/v1/platform/operators/:id/rollup` | Daily rollup history |
| GET | `/v1/platform/operators/:id/drill-down/orders` | Audited live read from tenant DB |
| GET | `/v1/platform/reports/cross-operator` | Aggregated rollups |
| GET | `/v1/platform/platform-users` | Platform staff list |
| POST | `/v1/platform/platform-users` | Create platform staff |
| GET | `/v1/platform/audit` | Platform audit log |
| GET | `/v1/platform/system/health` | Postgres, Redis, worker queues |

### 10.3 Tenant auth — `/v1/auth/*`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/auth/register` | Player register |
| POST | `/v1/auth/login` | Player login |
| POST | `/v1/auth/logout` | Logout |
| POST | `/v1/auth/refresh` | Refresh token |
| POST | `/v1/auth/forgot-password` | Password reset request |
| POST | `/v1/auth/verify-email` | Verify email token |

### 10.4 Tenant public API — `/v1/*`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/raffles` | List active raffles |
| GET | `/v1/raffles/:slug` | Detail + availability counts |
| GET | `/v1/cart` | Current cart |
| POST | `/v1/cart/items` | Add tickets (reserve) |
| PATCH | `/v1/cart/items/:id` | Update quantity |
| DELETE | `/v1/cart/items/:id` | Remove + release tickets |
| POST | `/v1/coupons/validate` | Validate coupon code |
| POST | `/v1/checkout` | Create order + open payment |
| POST | `/v1/payments/harambe/complete` | Mock gateway confirm (pilot) |
| GET | `/v1/account/tickets` | My tickets |
| GET | `/v1/account/wins` | My wins |
| PATCH | `/v1/account/profile` | Update profile |
| POST | `/v1/account/play-safe` | Activate Play Safe |

### 10.5 Tenant admin API — `/v1/admin/*`

Operator staff JWT → tenant DB only.

| Area | Endpoints |
|------|-----------|
| Dashboard | `GET /v1/admin/dashboard` |
| Raffles | CRUD `/v1/admin/raffles`, ticket pool generate/list |
| Orders | `GET /v1/admin/orders`, `POST /v1/admin/orders/:id/refund` |
| Payments | `GET /v1/admin/payments` |
| Users | `GET /v1/admin/users`, `GET/PATCH /v1/admin/users/:id` |
| Winners | `POST /v1/admin/raffles/:id/draw`, `GET /v1/admin/winners` |
| Prize claims | CRUD `/v1/admin/prize-claims` |
| Coupons | CRUD `/v1/admin/coupons` |
| Reports | `GET /v1/admin/reports/ggr`, `GET /v1/admin/reports/tax` |
| Staff | CRUD `/v1/admin/staff` |
| GRA queue | `GET /v1/admin/gra-events`, `POST /v1/admin/gra-events/:id/retry` |
| Settings | `GET/PATCH /v1/admin/settings` (proxies platform `operator_settings`) |

### 10.6 Workers

| Job | Payload | Behaviour |
|-----|---------|-----------|
| `cart-expiry` | `operator_id` | Release reservations in tenant DB |
| `raffle-end` | `operator_id`, `raffle_id` | Mark raffle ended |
| `auto-draw` | `operator_id`, `raffle_id` | Run draw if rules met |
| `gra-retry` | `operator_id`, `event_id` | Retry outbound GRA event |
| `send-email` | `operator_id`, template, refs | Transactional email |
| `tenant-rollups` | — | Nightly: all active tenants → platform `tenant_daily_rollups` |
| `migrate-all-tenants` | `schema_version` | Deploy tenant schema to every tenant DB |

OpenAPI / Swagger published for platform and tenant surfaces in Phase P0.

---

## 11. Repository structure

```
Kenji-raffle/   # repo folder — rename later
├── apps/
│   ├── platform/         # Platform console (:3003)
│   ├── web/              # Public + /admin (:3002)
│   ├── api/              # Tenant DB routing (:4002)
│   └── worker/           # Per-tenant + rollup jobs
├── packages/
│   ├── database/
│   │   ├── platform/     # Platform Prisma schema
│   │   ├── tenant/       # Tenant Prisma schema
│   │   └── scripts/      # provision-tenant, migrate-all-tenants
│   ├── shared/
│   └── ui/
├── docker/
│   └── docker-compose.yml
├── docs/
│   └── PROJECT_PLAN_2.md
├── .env.example
├── instructions.md
└── README.md
```

---

## 12. Scaling

Scale the **platform app tier** and **Postgres cluster** — not deploy per website.

| Stage | Setup |
|-------|--------|
| **Early** | One VPS — platform DB + tenant DBs on same Postgres instance |
| **Growth** | Larger Postgres; PgBouncer; more API/worker nodes |
| **100+ tenants** | Managed Postgres cluster; many databases; rollup-heavy platform dashboard |
| **Heavy single tenant** | Move that tenant’s DB to dedicated Postgres instance (same code) |

| Bottleneck | Action |
|------------|--------|
| Postgres connections | PgBouncer, cap concurrent tenant pools |
| One tenant very large | Dedicated DB instance for that tenant |
| Platform dashboard slow | Rollups only — never live-aggregate 100 DBs |
| Disk | Per-tenant backup retention; archive old tenant DBs |

---

## 13. Delivery phases

Phases are **sequential**. All raffle/player data lives in **tenant DBs** unless noted (platform DB).

### Phase P0 — Foundation (3–4 weeks)

| # | Task |
|---|------|
| P0.1 | npm workspaces monorepo — `apps/platform`, `apps/web`, `apps/api`, `apps/worker`, `packages/*` |
| P0.2 | `docker/docker-compose.yml` — Postgres 5437 (`CREATEDB`), Redis 6383 |
| P0.3 | Platform Prisma schema + `npm run migrate:platform` |
| P0.4 | Tenant Prisma schema (full tables in §9.2) |
| P0.5 | `provision-tenant.ts` — create DB, scoped user, migrate, register in `tenant_databases` |
| P0.6 | `migrate-all-tenants.ts` — roll tenant migrations across all active DBs |
| P0.7 | Tenant middleware — hostname → platform registry → tenant Prisma client pool |
| P0.8 | NestJS API — health, OpenAPI, platform JWT auth |
| P0.9 | `apps/platform` — login shell |
| P0.10 | Isolation tests — tenant A API cannot read tenant B DB |
| P0.11 | GitHub Actions — lint, typecheck, platform + tenant schema validate |

**Exit criteria:** Platform staff can log in to platform console; provision `safarijackpot` tenant DB via CLI; hostname routing resolves tenant.

### Phase P1 — Platform super-admin (3–4 weeks)

| # | Task |
|---|------|
| P1.1 | Operator list + create wizard (name, slug, `gra_registry_id`, licence) |
| P1.2 | **Automated DB provisioning** on operator create (async job + status UI) |
| P1.3 | Subdomain auto-register — `{slug}.kenji-raffle.local` / production base domain |
| P1.4 | Custom domain workflow — DNS instructions, verification, SSL status fields |
| P1.5 | Operator detail — DB status, schema version, provision errors |
| P1.6 | GRA credential UI — encrypt/store in `operator_settings` |
| P1.7 | Platform users CRUD + roles |
| P1.8 | Platform audit log UI |
| P1.9 | Platform dashboard — active tenants, rollup totals, failed provisions |
| P1.10 | Suspend / archive tenant — block public + operator routes |
| P1.11 | Nightly `tenant_daily_rollups` worker (shell — zeros until sales exist) |
| P1.12 | System health page — Postgres, Redis, queue depth |

**Exit criteria:** New operator onboarded from UI with tenant DB live on subdomain in < 15 minutes.

### Phase P2 — Operator admin shell (2–3 weeks)

| # | Task |
|---|------|
| P2.1 | `operator_staff` table + register/login in tenant DB |
| P2.2 | Operator staff JWT — scoped to single tenant DB |
| P2.3 | `apps/web` tenant hostname routing |
| P2.4 | `/admin` layout — sidebar, header, tenant branding from platform settings |
| P2.5 | Operator dashboard shell (placeholder KPIs) |
| P2.6 | Operator settings page — branding, licence, support email → platform DB |
| P2.7 | Operator staff invite + RBAC |
| P2.8 | `tenant_audit_logs` writer on admin mutations |
| P2.9 | Pen test isolation — operator A staff token rejected on operator B hostname |

**Exit criteria:** Operator owner can log in at `{slug}.…/admin`; cannot access another tenant’s hostname.

### Phase P3 — Raffle catalog (3–4 weeks)

| # | Task |
|---|------|
| P3.1 | Categories CRUD (operator admin) |
| P3.2 | Raffles CRUD — draft → listed → active lifecycle |
| P3.3 | Ticket pool generation — bulk create `available` tickets |
| P3.4 | Main prizes CRUD per raffle |
| P3.5 | Instant win prizes CRUD (`site_credit`, `cash`, `physical`) |
| P3.6 | Media upload — S3 prefix `tenants/{operator_id}/` |
| P3.7 | Raffle gallery images |
| P3.8 | Public home + `/raffles` list with filters |
| P3.9 | Public `/raffles/[slug]` — detail, gallery, ticket counter |
| P3.10 | Featured raffles on home |

**Exit criteria:** Operator publishes raffle; public site shows it on tenant domain.

### Phase P4 — Cart, checkout, coupons (4–5 weeks)

| # | Task |
|---|------|
| P4.1 | Cart add — reserve tickets + `ticket_numbers` jsonb + TTL |
| P4.2 | Cart expiry worker (per tenant) |
| P4.3 | Guest cart (`session_id`) + logged-in cart merge |
| P4.4 | Coupons CRUD + `POST /v1/coupons/validate` |
| P4.5 | Checkout — create `pending` order from cart |
| P4.6 | Harambe Payment Gateway **mock** UI + `POST /v1/payments/harambe/complete` |
| P4.7 | On payment success — tickets `purchased`, order `completed` |
| P4.8 | Tax split on `payments` row (`operator_amount`, `tax_amount`, `tax_rate`) |
| P4.9 | Order confirmation page — ticket numbers |
| P4.10 | Player auth — register, login, email verification gate before first purchase |
| P4.11 | Order confirmation + payment failed emails |
| P4.12 | Operator admin — orders list, refund (release tickets) |

**Exit criteria:** Full purchase on tenant domain with mock payment; tickets assigned; no double-sale under concurrent test.

### Phase P5 — Wins & player account (3 weeks)

| # | Task |
|---|------|
| P5.1 | Instant win evaluation on purchase (site credit, cash, physical) |
| P5.2 | Site credit balance updates on instant win |
| P5.3 | Manual draw — operator selects winners |
| P5.4 | Automatic / scheduled draw when raffle ends + min tickets met |
| P5.5 | Public `/winners` page |
| P5.6 | Account — `/account/tickets`, `/account/wins` |
| P5.7 | Physical prize claims + operator shipping queue |
| P5.8 | Play Safe activation + checkout block |
| P5.9 | Spending limits — enforce at checkout |
| P5.10 | Legal pages — FAQ, Terms, Privacy, licence in footer |
| P5.11 | Contact form |

**Exit criteria:** Draw completes; winners visible; instant win credits site balance; Play Safe blocks purchase.

### Phase P6 — GRA integration (2–3 weeks)

**Status (2026-08-21):** Queue + worker **partial** — only `ticket.purchased` and `payment.completed` reach GRA ingest today. See [IMPORTANT.md](../IMPORTANT.md) for endpoint mapping and remaining work.

| # | Task | Status |
|---|------|--------|
| P6.1 | `gra_outbound_events` queue in tenant DB | Done |
| P6.2 | Outbound worker — `ticket.purchased`, `payment.completed` | Done |
| P6.3 | Outbound — `ticket.voided` on refund | **TODO** |
| P6.4 | Outbound — `play_safe.activated` → `/events/player-safety` (no PII) | **TODO** |
| P6.5 | Hourly `session.aggregate` → `/events/session-aggregate` (GRA stake bands) | **TODO** |
| P6.6 | HMAC signing with per-operator keys from platform DB | Done |
| P6.7 | Retry worker + operator `/admin/gra-events` + platform visibility | Done |
| P6.8 | Monthly return export job (optional push to GRA ingest) | Not started |
| P6.9 | E2E test — purchase on tenant domain → GRA live feed < 5s | Manual only |

**Access model:** GRA staff use the government console only. Operators push to ingest; GRA does not log into tenant sites.

**Exit criteria:** Sandbox purchase visible on GRA dashboard; failed events retry; no PII in aggregates; payment ledger via gateway `gateway/notify`.

### Phase P7 — Production hardening (ongoing; start in P4)

| # | Task |
|---|------|
| P7.1 | Rate limiting — per tenant + per IP |
| P7.2 | CSRF, security headers, HTTPS-only cookies |
| P7.3 | Per-tenant DB backup schedule + restore drill |
| P7.4 | Platform DB backup + restore drill |
| P7.5 | Monitoring — error rates per tenant, queue lag, DB connections |
| P7.6 | Alerting — failed provisioning, GRA queue depth, disk |
| P7.7 | Cloudflare custom hostnames — production custom domains |
| P7.8 | PgBouncer + `MAX_TENANT_DB_CONNECTIONS` |
| P7.9 | Load test — 100 tenant DBs × concurrent checkout (scripted provision) |
| P7.10 | Onboarding runbook — 50 operators checklist |
| P7.11 | Operator staff 2FA (TOTP) for `owner` / `manager` |
| P7.12 | Swap Harambe mock → live gateway (`HARAMBE_PAYMENT_MODE=live`) |
| P7.13 | Kenya data residency documentation |
| P7.14 | OWASP review before public launch |

**Exit criteria:** Restore single tenant DB without affecting others; load test passes; monitoring live.

---

## 14. Success criteria

| Metric | Target |
|--------|--------|
| DB isolation | Tenant A DB inaccessible from tenant B context |
| Provisioning | New operator + tenant DB live in < 15 minutes |
| Tenant DB size | Each site scales independently — no shared mega-table |
| Platform dashboard | Cross-site metrics from rollups, sub-second |
| Cart → purchase | No double-sale per tenant DB under load |
| GRA latency | Events on government dashboard < 5s |
| Backups | Per-tenant DB backup + restore tested |
| Scale | 100 tenant databases documented and load-tested |

---

## 15. Local development

### 15.1 URLs and hosts

| Item | Value |
|------|-------|
| Platform DB | `kenji_platform` on `localhost:5437` |
| Tenant DBs | `kenji_tenant_{slug}` on same Postgres instance |
| Platform admin | `http://platform.kenji-raffle.local:3003` |
| Tenant site | `http://{slug}.kenji-raffle.local:3002` |
| API | `http://localhost:4002` |
| GRA ingest | `http://localhost:4001` |
| Env template | [.env.example](../.env.example) |
| Run guide | [instructions.md](../instructions.md) |

`/etc/hosts`:

```
127.0.0.1 platform.kenji-raffle.local
127.0.0.1 safarijackpot.kenji-raffle.local
```

### 15.2 First-time setup

```bash
cd /var/www/Kenji-raffle
cp .env.example .env
npm install
docker compose -f docker/docker-compose.yml up -d
```

### 15.3 Database commands

| Command | Purpose |
|---------|---------|
| `npm run migrate:platform` | Apply platform schema to `kenji_platform` |
| `npm run provision:tenant -- --slug safarijackpot --gra-id op-001 --name "Safari Jackpot"` | Create tenant DB + migrate + register operator |
| `npm run migrate:tenants` | Apply tenant schema changes to **all** active tenant DBs |
| `npm run migrate:tenant -- --slug safarijackpot` | Migrate one tenant DB |

**Order:** `migrate:platform` first, then `provision:tenant` for each operator site.

### 15.4 Run apps (after Phase P0 scaffold)

```bash
npm run dev:platform   # :3003 — platform console
npm run dev:web        # :3002 — tenant public + /admin
npm run dev:api        # :4002
npm run dev:worker
```

### 15.5 GRA sandbox (per tenant)

GRA API keys are stored in platform `operator_settings` when onboarding from platform admin (or seeded during `provision:tenant`). GRA ingest must be running (`localhost:4001`).

1. Create matching operator in GRA with `external_id` = platform `gra_registry_id`.
2. Issue site credentials in GRA **Settings → Operator API Credentials**.
3. Copy the same key + HMAC secret into platform operator detail.

**Sandbox dev keys** (GRA seed, site for `op-001`):

```text
API Key:     gra_sandbox_op001_devkey0001
HMAC Secret: sandbox_hmac_op001_secret_32chars_min
```

**Tax:** Checkout uses operator `default_tax_rate` (30%). GRA gateway payment ingest uses env `GOVERNMENT_TAX_RATE` (30%). Monthly return submissions may still default to 15% on GGR in GRA ingest unless payload includes `tax_due` — see [IMPORTANT.md](../IMPORTANT.md).

**Payments ledger:** Raffle outbound `payment.completed` feeds the live dashboard only. Regulatory payment rows require the **payment gateway** to call `POST /v1/gateway/notify`.

### 15.6 npm scripts (target — implemented in P0)

| Script | Description |
|--------|-------------|
| `dev:platform` | Next.js platform admin |
| `dev:web` | Next.js tenant web |
| `dev:api` | NestJS API |
| `dev:worker` | BullMQ worker |
| `migrate:platform` | Prisma migrate deploy — platform DB |
| `migrate:tenants` | Migrate all tenant databases |
| `migrate:tenant` | Migrate one tenant by slug |
| `provision:tenant` | Create operator + tenant DB |
| `db:seed:platform` | Seed platform admin user |

---

## 16. References

- **Integration checklist:** [IMPORTANT.md](../IMPORTANT.md)
- GRA plan: `/var/www/kenji-government/docs/PROJECT_PLAN.md`
- GRA operator integration: `/var/www/kenji-government/docs/OPERATOR_INTEGRATION.md`
- Payment gateway (future): `/var/www/kenji-government/docs/PAYMENT_GATEWAY_PROJECT.md`
- Custom domain setup: Cloudflare CNAME to platform edge hostname (see `OPERATOR_ONBOARDING.md`)
