# IMPORTANT — Kenji Raffle ↔ Payment Gateway ↔ GRA

This file tracks **what still needs to be done in this repo** and how this project fits the three-platform scheme.

| Project | Path | Role |
|---------|------|------|
| **Kenji Raffle** (this repo) | `/var/www/Kenji-raffle` | Operator raffle websites — sell tickets, checkout, operator admin |
| **Payment Gateway** | `/var/www/kenji-gateway` | Process card/M-Pesa, calculate tax + gateway fees, notify GRA |
| **GRA Platform** | `/var/www/kenji-government` | Government oversight console — compliance, payments oversight, tax escrow, reports |

---

## Still open — do not forget

Work **not done yet** across the three repos. Update this table when an item ships.

| # | Item | Where | Notes |
|---|------|--------|-------|
| 1 | **Production payment gateway** | `kenji-gateway` | Dev scaffold only (`POST /v1/charge`, test cards). Still need real M-Pesa/card processor, persistent gateway ledger DB, and per-operator credential mapping. |
| 2 | **Gateway remote + deploy** | `kenji-gateway` | Local git commit exists; **no GitHub remote** yet. Deploy on VPS `:4003`, set raffle `HARAMBE_GATEWAY_URL` + `HARAMBE_CALLBACK_SECRET`. |
| 3 | **Payment ledger to GRA** | `kenji-gateway` → GRA `:4001` | Regulatory `POST /v1/gateway/notify` — **only the gateway** (or dev simulator), never the raffle relay. Raffle relay handles live-feed events only. |
| 4 | **Production systemd deploy** | Kenji Raffle VPS | Services still run via `npm run dev:*`. Use [docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md) for systemd + Nginx + process supervision. |
| 5 | **P7 production hardening** | Kenji Raffle | CSRF, monitoring/alerting, load tests — see `docs/PROJECT_PLAN_2.md` §P7. |
| 6 | **GRA relay rate limit (multi-worker)** | Kenji Raffle worker | In-memory limiter is fine for **one** worker. If you scale to multiple workers, move `GRA_RELAY_MAX_PER_MINUTE` to a Redis-backed limiter. |
| 7 | **GRA E2E automation** | Kenji Raffle tests | Optional: automated test for purchase → `gra_outbound_events` → worker relay → GRA ingest. Manual smoke works today. |
| 8 | **GRA ingest always on (VPS)** | `kenji-government` | Relay queues when ingest is down. Ensure `npm run dev:ingest` (or prod equivalent) on `:4001` is supervised like other services. |

**Quick checks**

```bash
curl -s http://localhost:4001/v1/gateway/health    # GRA ingest up?
curl -s http://localhost:4003/health               # kenji-gateway up? (after deploy)
cd /var/www/Kenji-raffle && npm run test:gra-relay-integration
```

---

## How GRA “sees” operator sites

**GRA staff do not log into operator raffle websites.** There is no GRA browser session on tenant domains.

| Who | Where | Direction |
|-----|--------|-----------|
| **GRA staff** | Staff console (e.g. `https://srv1781529.hstgr.cloud`) | Read-only oversight UI |
| **Operator raffle site** | Tenant subdomain or custom domain (`{slug}.kenji-raffle.local`, operator `.co.ke`) | Players + operator admin |
| **Payment gateway** | Separate service (`kenji-gateway`, port **4003** locally to avoid clashing with platform API **4002**) | Charges customers |
| **Data to GRA** | `POST {GRA_INGEST_URL}/…` (port **4001** locally) | **Push only** — operators and gateway send signed JSON |

Linking an operator to GRA:

1. Create operator in GRA registry (`external_id` e.g. `op-001`).
2. Issue **API credentials** in GRA **Settings → Operator API Credentials** for that operator’s **site**.
3. In platform console, set **`gra_registry_id`** = GRA `external_id` and store the same **API key + HMAC secret** (encrypted in `operator_settings`).

**Sandbox dev keys** (GRA seed, site for `op-001`):

```text
API Key:     gra_sandbox_op001_devkey0001
HMAC Secret: sandbox_hmac_op001_secret_32chars_min
Ingest URL:  http://localhost:4001/v1
```

---

## Architecture (target state)

```text
Player browser
    │
    ▼
Kenji Raffle (checkout) ──redirect──▶ Payment Gateway (charge)
    │                                        │
    │                                        ├── calculates tax + gateway fee
    │                                        ├── POST /v1/gateway/notify ──▶ GRA ingest
    │                                        └── POST webhook ──▶ Kenji Raffle
    │
    └── GRA operator ingest (separate) ──▶ GRA ingest
        tickets, play safe, session aggregates, monthly returns
```

**Rules:**

- The raffle site **must not** process card payments or call `POST /v1/gateway/notify`. Only the **payment gateway** does that.
- **`POST /v1/gateway/notify`** creates the regulatory **payment ledger** in GRA (`payment_transactions`, tax escrow, AML).
- **`POST /v1/events/*`** feeds the **live dashboard** and regional analytics — lighter payloads, separate from the payment ledger.

---

## What GRA already has (do not rebuild here)

Implemented in `kenji-government`:

| Capability | Notes |
|------------|--------|
| `POST /v1/gateway/notify` | Completed/failed payments with tax + gateway fee fields |
| `payment_transactions` | `gateway_fee_rate`, `gateway_fee_amount`, operator net |
| **Payments → Operators / Transactions** | Aggregated and per-row gateway economics |
| **Regional & Player Safety** | Anonymised county analytics from ingest events |
| **Settings (staff UI)** | Treasury account ref only (editable). **Tax rate** = `GOVERNMENT_TAX_RATE` env (default **30%**). **Gateway fee rate is not configured in GRA** — owned by the gateway project |
| Gateway simulator | `kenji-government/tools/gateway-simulator/simulate-charge.sh` |

Reference docs in GRA repo:

- `kenji-government/docs/OPERATOR_INTEGRATION.md` — operator ingest (returns, events, player safety)
- `kenji-government/docs/PAYMENT_GATEWAY_PROJECT.md` — gateway → GRA notify contract
- `kenji-government/packages/shared/src/payments.ts` — `gatewayPaymentSchema`
- `kenji-government/packages/shared/src/player-safety.ts` — player safety + session aggregate schemas

---

## Tax rates (read carefully)

| Context | Rate | Where set |
|---------|------|-----------|
| **Checkout on raffle site** | Default **30%** (`0.30`) | Platform `operators.default_tax_rate` per operator |
| **GRA gateway payment ingest** | Default **30%** | GRA env `GOVERNMENT_TAX_RATE` |
| **GRA monthly returns** (submissions) | Default **15%** on GGR for `tax_due` if omitted | GRA ingest default (`packages/shared/src/ingest.ts`) |

Checkout and gateway payments should use **30%** unless legal/product says otherwise. Monthly return submissions may still use GRA’s **15%** default until aligned — coordinate with GRA before changing either side.

---

## Money rules (align with GRA + gateway)

```text
Customer pays gross
  → tax_amount           = gross × tax_rate              (to GRA)
  → operator_amount      = gross - tax_amount
  → gateway_fee_amount = gross × gateway_fee_rate      (to payment gateway)
  → operator_net         = operator_amount - gateway_fee_amount
```

**Example** — 1,000 KES, 30% tax, 2.5% gateway fee:

| Line | Amount |
|------|--------|
| Gross | 1,000.00 |
| Tax to GRA | 300.00 |
| Operator share (before gateway fee) | 700.00 |
| Gateway fee | 25.00 |
| Operator net | 675.00 |

Gateway fee **rate** is owned by **`kenji-gateway`** (per-operator fee schedules). GRA only stores what the gateway sends on `gateway/notify`; if fee fields are omitted, GRA applies a **code fallback** (2.5% of gross), not a staff Settings value.

---

## What this repo already has

| Area | Status | Location |
|------|--------|----------|
| Checkout + tax split | Done | `apps/api/src/checkout/checkout.service.ts` |
| Mock / live redirect to gateway URL | Partial | `HARAMBE_GATEWAY_URL`, `HARAMBE_PAYMENT_MODE` |
| Harambe / Cashflows callbacks | Done | `apps/api/src/checkout/checkout.controller.ts` |
| `payments` table (amount, tax, operator share) | Done | `packages/database-tenant/prisma/schema.prisma` |
| GRA outbound event queue | Done | `apps/api/src/gra/gra-outbound.service.ts` — tenant DB only, no HTTP |
| GRA platform relay worker | **Done** | `packages/shared/src/gra-outbound.ts` — **only** worker posts to GRA ingest |
| Operator GRA credentials | Done | `operator_settings.gra_api_key_encrypted` (platform DB) |
| Operator `gra_registry_id` | Done | platform `operators` table |
| Session aggregate → GRA | Done | `apps/worker/src/session-aggregate.ts` → queue → relay worker |
| GRA heartbeat (daily) | Done | Worker cron `gra-heartbeat` at 06:00 UTC |

### Tax split today (checkout)

```text
total           = cart total after discounts/site credit
tax_amount      = total × operators.default_tax_rate   (default 30%)
operator_amount = total - tax_amount
```

Stored on `payments` at checkout creation. Gateway fee columns persist from live gateway callbacks (`gateway_fee_rate`, `gateway_fee_amount`).

### GRA platform relay (centralized egress)

Tenant APIs **enqueue** `gra_outbound_events` only. A **single worker relay** (`process-gra-outbound` job + `gra-outbound-sweep` cron) is the only automated component that POSTs to `GRA_INGEST_URL`. See `docs/GRA_INTEGRATION_ARCHITECTURE.md`.

---

## GRA operator ingest — event mapping

All requests: `X-Api-Key`, `X-Signature` (HMAC-SHA256 of raw JSON body), `X-Idempotency-Key`.

**Status (2026-08-21):** Implemented in `packages/shared/src/gra-outbound.ts` — all queued types reach GRA ingest.

**Player safety body** (GRA rejects PII keys such as `user_id`, `email`, `phone`):

```json
{
  "event_type": "play_safe",
  "county": "Nairobi",
  "occurred_at": "2026-08-21T12:00:00.000Z"
}
```

**Session aggregate body** (GRA schema — one POST per county per bucket, not per stake band row):

```json
{
  "county": "Nairobi",
  "bucket_start": "2026-08-21T11:00:00.000Z",
  "session_count": 42,
  "total_session_minutes": 0,
  "stake_band_distribution": {
    "0-50": 10,
    "51-100": 8,
    "101-250": 5,
    "251-500": 2,
    "501-1000": 1,
    "1001+": 0
  }
}
```

GRA stake bands: `0-50`, `51-100`, `101-250`, `251-500`, `501-1000`, `1001+` (`kenji-government/packages/shared/src/player-safety.ts`).

**Do not** send raffle’s internal bands (`0-49`, `50-199`, …) — map or re-bucket before ingest.

Other operator ingest:

| Purpose | GRA endpoint | Kenji-raffle |
|---------|--------------|--------------|
| Monthly return | `POST /returns/monthly` | Automated worker export |
| Document upload | `POST /documents` | Not implemented |
| Heartbeat | `POST /heartbeat` | Daily worker cron + platform test button |

---

## Payment gateway integration (this repo)

**Status (2026-08-22):** Done in raffle codebase except deploying production **`kenji-gateway`**.

| Item | Status |
|------|--------|
| `payments.gateway_fee_*` columns + migration | Done |
| `POST /v1/payments/gateway/callback` | Done |
| Dev mock gateway (`GATEWAY_DEV_MOCK`) | Done |
| Admin payments UI (gateway fee, operator net) | Done |
| Reports GGR includes gateway fees | Done |
| Live `kenji-gateway` at `HARAMBE_GATEWAY_URL` | **Deploy** `/var/www/kenji-gateway` |

| Variable | Purpose |
|----------|---------|
| `HARAMBE_GATEWAY_URL` | Gateway checkout (e.g. `http://localhost:4003/v1/charge`) — **not** GRA `:4001` |
| `HARAMBE_PAYMENT_MODE` | `mock` \| `live` |
| `HARAMBE_CALLBACK_SECRET` | Verify gateway → raffle webhooks |
| `GATEWAY_DEV_MOCK` | Dev pay page on raffle API |

---

## GRA platform relay (this repo)

**Status (2026-08-22):** Complete — see `docs/GRA_INTEGRATION_ARCHITECTURE.md` and `docs/GRA_RELAY_RUNBOOK.md`.

| Item | Status |
|------|--------|
| Tenant enqueue only (no GRA HTTP on checkout) | Done |
| Single worker relay (`process-gra-outbound` + sweep) | Done |
| Rate limit + `next_attempt_at` backoff | Done |
| Daily heartbeat cron | Done |
| Play Safe requires county before enqueue | Done |
| Monthly return deduped per period | Done |
| Platform GRA health + alerts | Done |

**Env:** `GRA_INGEST_URL`, `GRA_RELAY_BATCH_SIZE`, `GRA_RELAY_MAX_PER_MINUTE`, `GRA_RELAY_OPERATOR_CONCURRENCY`

**Remaining (external):** Payment ledger via `kenji-gateway` → `POST /v1/gateway/notify` (not raffle relay).

---

## Local dev checklist

1. GRA staff API: `kenji-government` → `npm run dev:api` (**4000**)
2. GRA ingest: `kenji-government` → `npm run dev:ingest` (**4001**)
3. Payment gateway: `kenji-gateway` → see that repo’s `IMPORTANT.md` (**4003** locally recommended)
4. Kenji Raffle: platform API **4002**, tenant web **3002**, platform console **3003**
5. Platform admin → operator → set GRA keys matching GRA site credentials for `gra_registry_id`
6. Test payment path: checkout → gateway (or simulator) → GRA **Payments → Operators**
7. Test live feed: purchase → raffle outbound → GRA dashboard ticker

**Without gateway repo:** `bash kenji-government/tools/gateway-simulator/simulate-charge.sh 1000`

---

## Files to touch (summary)

Most P0/P1 items below are **done**. Remaining work is **`kenji-gateway` deployment** and production ops (P7).

| Priority | Task | Status |
|----------|------|--------|
| P0 | Gateway webhook + live checkout | Done (callback); gateway repo to deploy |
| P0 | `payments` gateway fee columns | Done |
| P1 | GRA relay + all outbound event types | Done |
| P1 | Admin payments UI + reports | Done |
| P2 | Fee preview on checkout | Done (`DEFAULT_GATEWAY_FEE_RATE`) |

---

## What NOT to do

- Do **not** call `POST /v1/gateway/notify` from the raffle site — only the **payment gateway**
- Do **not** point `HARAMBE_GATEWAY_URL` at GRA ingest (`:4001`)
- Do **not** duplicate GRA oversight DB (tax escrow, AML) — lives in `kenji-government`
- Do **not** send PII to GRA player-safety or session endpoints
- Do **not** assume GRA Settings controls tax or gateway fee — tax is env on GRA server; gateway fee is gateway-owned

---

## Related repos

- GRA platform: `/var/www/kenji-government`
- Payment gateway: `/var/www/kenji-gateway` → `IMPORTANT.md`
- GRA operator ingest guide: `kenji-government/docs/OPERATOR_INTEGRATION.md`
