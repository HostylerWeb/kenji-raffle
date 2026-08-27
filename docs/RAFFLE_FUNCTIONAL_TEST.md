# Raffle product — functional test script

Manual checklist for operator tenant sites (`https://{slug}.force42.com`).

## Prerequisites

- Platform and tenant API running (`api.force42.com`), web, worker, Redis, Postgres.
- Demo or test operator provisioned with active tenant DB.
- Live checkout: `HARAMBE_PAYMENT_MODE=live`, `HARAMBE_GATEWAY_URL=https://pay.force42.com/v1/pay`.
- Player checkout: use a verified account (`player@demo.local` on demo) or configure `SMTP_*` for email verify.

## Auth

1. Register at `/register` — receive verify email when auto-verify is off.
2. `/verify-email?token=...` or paste token on `/verify-email`.
3. Login at `/login`.
4. `/forgot-password` → email link → `/reset-password?token=...`.
5. `GET /v1/me` via account dashboard shows profile.

## Operator auth

1. `/admin/login` — staff login.
2. `/admin/forgot-password` and `/admin/reset-password`.
3. Settings → change password.

## Cart & checkout

1. Browse `/raffles`, add tickets to cart.
2. Checkout with coupon optional.
3. Live payment — redirect to **pay.force42.com** → test card `4242…4242` → `/checkout/success?order_id=...`.
4. Refresh success URL — order loads from API (durable).
5. Declined card (ending `0000` on gateway) → failed path / tickets released.

## Account

1. `/account` — dashboard links.
2. `/account/orders` and order detail.
3. `/account/tickets`, `/account/wins`.
4. `/account/settings` — spending limit.
5. `/account/play-safe` — blocks checkout when active.

## Instant wins & GRA

1. Raffle with instant-win prize (`win_frequency` e.g. 2).
2. Purchase tickets — instant wins on success page if triggered.
3. Operator `/admin/gra-events` — expect **`payment.completed`** and **`ticket.purchased`** (only types sent to GRA today).
4. Worker processes outbound (or retry from admin).
5. GRA government console — live feed ticker should show ticket/payment events within ~5s when ingest + keys are correct.
6. GRA **Payments** ledger — requires payment gateway `gateway/notify` (use GRA `tools/gateway-simulator/simulate-charge.sh` if gateway not deployed).

See [IMPORTANT.md](../IMPORTANT.md) for full event mapping and remaining outbound types (`play_safe`, `session.aggregate`, void/failed).

## Draws

1. End raffle → status `to_be_drawn` or use active raffle with min tickets met.
2. Admin raffle → **Run draw**.
3. Public `/winners` lists results.
4. Physical prizes → `/admin/prize-claims`.

## Analytics & site

1. Admin settings — GA4 + Facebook Pixel IDs, enable analytics.
2. Purchase fires client Purchase events on success page.
3. `/faq`, `/terms`, `/privacy` show operator text.
4. `/contact` sends to support email.
5. Footer social links when configured.

## Enforcement

1. Platform operator `checkout_enabled=false` blocks checkout.
2. Unverified email blocks checkout when auto-verify off.
3. Spending limit blocks when exceeded.

## Live Harambe / payment gateway (optional)

1. `HARAMBE_PAYMENT_MODE=live` + `HARAMBE_CALLBACK_SECRET`.
2. `HARAMBE_GATEWAY_URL` → payment gateway checkout (not GRA ingest `:4001`).
3. Gateway completes charge → webhooks raffle → `POST /v1/payments/harambe/callback` with `order_id`.
4. Gateway separately calls GRA `POST /v1/gateway/notify` for regulatory payment ledger.
