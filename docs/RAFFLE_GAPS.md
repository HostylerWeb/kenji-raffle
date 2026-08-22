# Raffle product gaps tracker

Functional scope for tenant raffle sites (`apps/web` + tenant API + worker). Platform control plane gaps live in `PLATFORM_GAPS.md`.

**Last updated:** 2026-08-22 (GRA platform relay, kenji-gateway scaffold)

---

## Open gaps (payment & GRA)

What is **mock / temporary today**, what **ships in this repo now**, and what **must wait for `kenji-gateway`**.

| Gap | Status now | Mock / dev substitute | Replace with (production) |
|-----|------------|----------------------|---------------------------|
| **kenji-gateway** scaffold | GRA handler **done** in `kenji-government` | `bash kenji-government/tools/gateway-simulator/simulate-charge.sh 1000` | **`kenji-gateway`** `POST /v1/charge` → `gateway/notify` (scaffold at `/var/www/kenji-gateway`) |
| **Gateway fee on `payments`** | **Done** — columns + callback persistence | Mock checkout: fees = `0`; live callback stores real fees | Values from **`kenji-gateway`** webhook (`gateway_fee_rate`, `gateway_fee_amount`) |
| **Live checkout redirect** | Redirect URL + **`POST /v1/payments/gateway/callback`** **done** | `GATEWAY_DEV_MOCK=true` + `HARAMBE_GATEWAY_URL=…/dev-mock-gateway/pay` | Real **`kenji-gateway`** pay page + M-Pesa/card |
| **Raffle completes order** | Mock: `POST /v1/payments/harambe/complete` | Dev mock page or mock mode | Gateway webhook → `gateway/callback` only |
| **Refund → GRA payment ledger** | **`ticket.voided`** per ticket (correct) | Same — no fake payment reversal | Future: gateway refund API + GRA schema (`refunded` or reversal notify) |
| **GRA live feed tax on payment** | `/events/payment` is gross-only (regulatory tax on `gateway/notify`) | N/A | Optional GRA schema extension only |

### Dev mock gateway (temporary)

```env
HARAMBE_PAYMENT_MODE=live
HARAMBE_CALLBACK_SECRET=dev-callback-secret
GATEWAY_DEV_MOCK=true
HARAMBE_GATEWAY_URL=http://localhost:4002/v1/payments/dev-mock-gateway/pay
DEFAULT_GATEWAY_FEE_RATE=0.025
```

Open checkout → redirect to mock pay page → **Pay** calls `POST /v1/payments/gateway/callback` → tickets issued.  
**Does not** call GRA `gateway/notify` — run the GRA simulator separately for ledger rows.

### Production env (when gateway exists)

```env
HARAMBE_PAYMENT_MODE=live
HARAMBE_GATEWAY_URL=https://payments.your-domain/v1/pay   # kenji-gateway, NOT :4001
HARAMBE_CALLBACK_SECRET=<shared-with-gateway>
GATEWAY_DEV_MOCK=false
```

---

## Status: v1 feature complete

Planned operator console + player website scope from `PROJECT_PLAN_2.md` is implemented. Remaining items are **out of scope** (referral/cashback), **production ops** (P7 hardening), **`kenji-gateway` scaffold** (separate repo), or **optional** (deep Playwright journeys, GRA E2E automation).

## Checkout auth model

Browsing and cart work without an account. **Checkout requires login or register** — there is no anonymous/guest checkout without a player account. Cart items merge into the account on login/register via `cart_session_id`.

## Recent fixes

- **Gateway fees:** `payments.gateway_fee_rate`, `gateway_fee_amount`, `gateway_transaction_id`; unified `POST /v1/payments/gateway/callback`
- **Dev mock gateway:** `GET /v1/payments/dev-mock-gateway/pay` when `GATEWAY_DEV_MOCK=true` (replace with `kenji-gateway`)
- **Checkout:** order lines snapshot `ticket_numbers` at checkout — payment completes against the order, not the live cart
- **Pending orders:** one pending order per user; cart cleared at checkout; ticket reservations extended (`CHECKOUT_PENDING_TTL_MINUTES`, default 60); worker auto-fails stale pending orders every 5 min
- **Pricing:** per-ticket `purchase_price` allocated after coupons/site credit; sums match payment total for GRA (hard fail if mismatch)
- **Draw RNG:** Fisher–Yates shuffle (unbiased winner selection)
- **Tax:** rounded to 2dp; `operator_amount + tax_amount = amount`
- **`purchased_at`** on tickets (actual sale time, not raffle generation time)
- **Mock vs live:** mock endpoint blocked on live orders; live callbacks require secret + `live_callback` path
- **failPayment:** only affects pending orders; releases tickets from order snapshot
- **Refunds:** blocked after draw/winning tickets; GRA void uses correct amounts/times
- **Reports:** `tickets_sold` and sales-by-raffle use completed orders + `purchase_price`; GGR includes `gateway_fee_total` + `operator_net`
- **Limits:** ticket caps and spending limits include pending orders
- **Monthly GRA return:** `tickets_sold` uses `purchased_at`, not ticket generation time
- Raffle `start_date` / `end_date` enforced on cart add, checkout, and public listing
- Worker auto-activates `listed` → `active` when `start_date` passes
- Admin dashboard: **active raffles** count + **low tickets** alert
- Failed payment releases reserved tickets and clears cart
- Play Safe auto-clears after cooling-off period expires
- Reports date range filter in admin UI
- Reports CSV export + instant win frequency/total edit on raffle page
- **GRA platform relay:** single worker egress, rate limit, sweep, daily heartbeat, latency metrics, unified retry rules
- **Play Safe:** county required before GRA enqueue; clear `GraQueueError` for operators
- **Monthly return:** deduped per `reporting_year` / `reporting_month`

## Implemented (summary)

- Full commerce: cart, checkout, payments (mock + live redirect + gateway callback), site credit, coupons, instant wins, draws, claims, withdrawals, GRA outbound
- Operator console: dashboard, raffles, orders, payments (incl. gateway fee / operator net), reports, players, staff, domains, media, audit, RBAC nav
- Player account: orders, tickets, wins, claims, site credit, settings, KYC upload, Play Safe
- Auth: player + operator refresh tokens with Redis revocation; operator MFA
- Worker: lifecycle, auto-draw, email queue, migrate-all-tenants, rollups, GRA sweep, pending-order expiry
- Tests: API isolation, purchase E2E, checkout pricing, GRA outbound, Playwright smoke (`npm run test:e2e`)
- Per-tenant rate limits (`TenantRateLimitGuard`)

## Out of scope (plan)

| Item | Notes |
|------|--------|
| Referral / cashback | Explicitly out of scope in `PROJECT_PLAN_2.md` |
| Anonymous checkout | Not supported — login/register required at checkout (by design) |
| P7 production hardening | CSRF, monitoring, load tests — see `PROJECT_PLAN_2.md` §P7 |
| **`kenji-gateway` repo** | **Scaffold** at `/var/www/kenji-gateway` — `POST /v1/charge`, GRA notify, raffle callback; not production card/M-Pesa |

## Migrations (tenant DB)

```bash
npm run migrate:tenants
```

1. `20260820160000_raffle_gap_closure`
2. `20260820180000_operator_console_parity`
3. `20260820190000_operator_staff_mfa`
4. `20260821200000_checkout_order_snapshot`
5. `20260821210000_payment_gateway_fees`
6. `20260822180000_gra_relay_next_attempt` — `gra_outbound_events.next_attempt_at` for relay backoff

**Platform DB** (`npm run migrate:platform`):

1. `20260822180000_gra_heartbeat` — `operator_settings.gra_last_heartbeat_*`

## Test commands

| Command | What |
|---------|------|
| `npm run test:isolation` | Tenant DB isolation |
| `npm run test:operator-isolation` | Cross-hostname operator token rejection |
| `npm run test:purchase-e2e` | Full purchase API pipeline (needs API running) |
| `npm run test:checkout-pricing` | Coupon/site-credit ticket price allocation |
| `npm run test:gra-outbound` | GRA ingest payload mapping |
| `npm run test:gra-relay-integration` | GRA relay contracts + retry rules (shared package) |
| `npm run test:e2e` | Playwright smoke (needs web on 3002; API for live data) |

## GRA integration

Outbound worker sends all queued event types to GRA ingest:

| Event | GRA endpoint | Status |
|-------|--------------|--------|
| `payment.completed` | `/events/payment` | Sent (live feed; not payment ledger) |
| `payment.failed` | `/events/payment` | Sent |
| `ticket.purchased` / `ticket.voided` | `/events/ticket` | Sent |
| `play_safe.activated` | `/events/player-safety` | Sent (no PII; requires county) |
| `session.aggregate` | `/events/session-aggregate` | Sent (stake bands from sum of `purchase_price`) |
| `monthly.return` | `/returns/monthly` | Sent |

**Payment ledger (regulatory):** `POST /v1/gateway/notify` on GRA ingest — **only the payment gateway** (or dev simulator), never the raffle site.

Implementation: `packages/shared/src/gra-outbound.ts`, `gra-relay.ts`, `gra-retry.ts`. See [IMPORTANT.md](../IMPORTANT.md) and [GRA_RELAY_RUNBOOK.md](./GRA_RELAY_RUNBOOK.md).

## Env vars

| Variable | Purpose |
|----------|---------|
| `TENANT_RATE_LIMIT_PER_MINUTE` | Default 300/min per operator + IP |
| `JWT_REFRESH_SECRET` | Player + operator refresh tokens |
| `REDIS_URL` | Player + operator refresh revocation store |
| `ALMOST_SOLD_OUT_THRESHOLD` | Dashboard “almost sold out” highlight (default 50; falls back to `LOW_TICKET_THRESHOLD`) |
| `CART_RESERVATION_TTL_MINUTES` | Cart hold time (default 15) |
| `CHECKOUT_PENDING_TTL_MINUTES` | Pending payment reservation + auto-fail (default 60) |
| `HARAMBE_PAYMENT_MODE` | `mock` (default) or `live` |
| `HARAMBE_GATEWAY_URL` | Gateway checkout URL — **not** GRA ingest `:4001` |
| `HARAMBE_CALLBACK_SECRET` | Verify `gateway/callback` from payment gateway |
| `GATEWAY_DEV_MOCK` | `true` enables dev pay page at `/v1/payments/dev-mock-gateway/pay` |
| `DEFAULT_GATEWAY_FEE_RATE` | Checkout fee **preview** only (default 0.025) |
| `GRA_INGEST_URL` | Outbound worker target (default `http://localhost:4001/v1`) |
| `GRA_RELAY_BATCH_SIZE` | Events per relay batch (default 50) |
| `GRA_RELAY_MAX_PER_MINUTE` | Per-operator rate limit (default 50) |
| `GRA_RELAY_OPERATOR_CONCURRENCY` | Parallel operators per sweep (default 3) |
| `EMAIL_ASYNC=true` | Queue mail to worker |
| `PLAYER_AUTO_VERIFY_EMAIL=true` | Dev/CI — skip email verify before checkout |
| `NEXT_PUBLIC_DEV_TENANT_HOST` | Local tenant hostname for web (e.g. `demo.kenji-raffle.local`) |
