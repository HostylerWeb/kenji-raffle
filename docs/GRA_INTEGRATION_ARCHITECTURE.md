# GRA integration architecture

Single source of truth for how Kenji Raffle, the payment gateway, and GRA interact.

## Three systems

| System | Repo | Egress to GRA ingest? |
|--------|------|------------------------|
| **Kenji Raffle** | `/var/www/Kenji-raffle` | **Worker relay only** (`POST /v1/events/*`, `/returns/monthly`, `/heartbeat`) |
| **Payment gateway** | `/var/www/kenji-gateway` | **Yes** — `POST /v1/gateway/notify` only |
| **GRA platform** | `/var/www/kenji-government` | Receives data (ingest `https://ingest.force42.com`, staff `https://console.force42.com`) |

Raffle tenant websites and Nest API processes **never** call GRA on checkout. They insert rows into `gra_outbound_events` in the tenant database.

## Platform relay flow

```text
Checkout / refund / play safe / worker jobs
    │
    ▼
INSERT gra_outbound_events (status=pending)   ← tenant API / worker enqueue only
    │
    ▼
BullMQ process-gra-outbound (per operator, deduped)
    OR gra-outbound-sweep (every 5 min, all tenants)
    │
    ▼
packages/shared/src/gra-outbound.ts
    • per-operator rate limit (50/min default)
    • next_attempt_at backoff on 429/5xx
    • HMAC sign + POST to GRA_INGEST_URL
    │
    ▼
kenji-government ingest API (:4001)
```

## Credentials

- Stored encrypted in **platform DB** (`operator_settings`)
- Configured in platform console (`:3003`) per operator
- `operators.gra_registry_id` must match GRA registry `external_id`

## Event types (operator ingest)

| Queue `event_type` | GRA path |
|--------------------|----------|
| `payment.completed` / `payment.failed` | `/events/payment` |
| `ticket.purchased` / `ticket.voided` | `/events/ticket` |
| `play_safe.activated` | `/events/player-safety` |
| `session.aggregate` | `/events/session-aggregate` |
| `monthly.return` | `/returns/monthly` |

Payment **ledger** (tax escrow, AML) requires **kenji-gateway** → `/gateway/notify`.

## Network deployment

| Component | Outbound to GRA `:4001` |
|-----------|---------------------------|
| Worker (`npm run dev:worker`) | **Required** |
| API (`npm run dev:api`) | **Not required** (queue + Redis only) |
| Tenant web | **No** |

## Key files

- `packages/shared/src/gra-outbound.ts` — mapping, signing, relay processor
- `packages/shared/src/gra-relay.ts` — rate limit, backoff, metrics logging
- `packages/shared/src/gra-relay-queue.ts` — BullMQ enqueue helper
- `apps/worker/src/main.ts` — `process-gra-outbound`, `gra-outbound-sweep`, `gra-heartbeat`
- `apps/api/src/gra/gra-outbound.service.ts` — enqueue on commerce events

## Environment

```env
GRA_INGEST_URL=http://localhost:4001/v1
# Production VPS: GRA_INGEST_URL=https://ingest.force42.com/v1
GRA_RELAY_BATCH_SIZE=50
GRA_RELAY_MAX_PER_MINUTE=50
GRA_RELAY_OPERATOR_CONCURRENCY=3
CREDENTIALS_ENCRYPTION_KEY=...
REDIS_URL=redis://localhost:6383
```

See also: `docs/GRA_RELAY_RUNBOOK.md`, `IMPORTANT.md`, `kenji-government/docs/OPERATOR_INTEGRATION.md`.
