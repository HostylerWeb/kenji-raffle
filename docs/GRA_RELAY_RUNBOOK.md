# GRA relay runbook

Operations guide for the Kenji Raffle **platform GRA relay** (worker-only egress to GRA ingest).

## Quick health checks

1. **Platform console** → Reports → GRA health (pending depth, oldest pending age, heartbeat)
2. **Platform dashboard** → alerts for `gra_stale_pending`, `gra_heartbeat_failed`, `gra_failures`
3. **Worker** → System page → last job `gra-outbound-sweep` or `process-gra-outbound`
4. **GRA ingest** → `GET /v1/status` with operator credentials (or platform **Test GRA connection**)

## Normal operation

| Job | Schedule | Purpose |
|-----|----------|---------|
| `process-gra-outbound` | On demand after checkout/refund | Fast delivery per operator |
| `gra-outbound-sweep` | Every 5 minutes | Safety net for all tenants |
| `gra-heartbeat` | Daily 06:00 UTC | Credential + connectivity check |

Structured relay logs (JSON):

```json
{"event":"gra_relay_run","operator_id":"...","gra_relay_events_sent":3,"gra_relay_backlog":0}
```

## Retry failed events

**Operator admin** (`/admin/gra-events`) or **platform drill-down** (`/operators/{id}/data`):

1. Only `failed` events (or `pending` stuck > 6 hours on operator admin)
2. Retry resets row to `pending`, clears `next_attempt_at`
3. Enqueues `process-gra-outbound` — **does not** HTTP from API

## Credential rotation

1. GRA staff → Settings → generate new API key + HMAC for operator site
2. Platform console → operator → GRA credentials → paste new values → Save
3. **Test GRA connection**
4. No tenant redeploy or per-site `.env` change required

## IP allowlist

If GRA admin enables IP allowlist on operator credentials:

- Whitelist **worker egress IP** (not tenant API pods)
- Re-run **Test GRA connection** from platform console (diagnostic HTTP — acceptable exception)

## Rate limits

GRA ingest: **60 requests/minute per API key**. Relay defaults to **50/min** (`GRA_RELAY_MAX_PER_MINUTE`).

On HTTP 429, events stay `pending` with `next_attempt_at` set from `Retry-After` or 1 minute.

## Dev workflow (two paths)

### Operator events (tickets, play safe, returns)

Kenji raffle checkout → queue → worker relay → GRA `/events/*`

### Payment ledger (regulatory)

**Option A — GRA simulator (no gateway build):**

```bash
cd /var/www/kenji-government
bash tools/gateway-simulator/simulate-charge.sh 1000
```

**Option B — kenji-gateway scaffold:**

```bash
cd /var/www/kenji-gateway
cp .env.example .env
npm install && npm run dev
# POST http://localhost:4003/v1/charge
```

Mock raffle checkout (`GATEWAY_DEV_MOCK=true`) completes orders but **does not** call `gateway/notify` — run simulator or gateway separately for ledger rows.

## Troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Events stuck `pending` | Missing GRA keys | Platform console → configure credentials |
| `failed` with 400 | Validation / missing county | Fix payload; retry after correction |
| `failed` with 401 | Wrong API key or HMAC | Rotate credentials |
| Backlog growing, 429 in `last_error` | Burst sales | Wait for backoff; tune `GRA_RELAY_MAX_PER_MINUTE` ≤ 60 |
| Heartbeat failed | GRA down or network | Check ingest URL, firewall, allowlist |
| Payments in raffle but not GRA ledger | No gateway notify | Use `kenji-gateway` or simulator |

## Related docs

- `docs/GRA_INTEGRATION_ARCHITECTURE.md`
- `kenji-government/docs/OPERATOR_INTEGRATION.md`
- `kenji-government/docs/PAYMENT_GATEWAY_PROJECT.md`
