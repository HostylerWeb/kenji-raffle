# GRA demo — how Kenji sends data to GRA

Clarifies **who** talks to GRA on the Kenji stack, and how to demo compliance on `demo.force42.com`.

**Architecture reference:** [GRA_INTEGRATION_ARCHITECTURE.md](./GRA_INTEGRATION_ARCHITECTURE.md)

---

## Who sends what (not every client website)

```text
┌─────────────────────────────────────────────────────────────────┐
│  Kenji Raffle PLATFORM (our SaaS)                               │
│                                                                 │
│  demo.force42.com (tenant web)  ──►  tenant API (:4002)       │
│       │                              │                          │
│       │  checkout / cart             │  INSERT gra_outbound_    │
│       │  (no HTTP to GRA)            │  events (pending)        │
│       │                              ▼                          │
│  platform.force42.com            raffle-worker                   │
│  (GRA keys per operator)              │                          │
│                                       │  HMAC POST               │
│                                       ▼                          │
└───────────────────────────────────────┼──────────────────────────┘
                                        │
                                        ▼
                          ingest.force42.com (GRA :4001)
                          /events/ticket, /events/payment, …

┌─────────────────────────────────────────────────────────────────┐
│  Payment gateway (kenji-gateway) — separate path                │
│  POST /v1/gateway/notify  ──►  GRA payment ledger (tax/escrow)  │
└─────────────────────────────────────────────────────────────────┘
```

| Component | Calls GRA ingest? | Role |
|-----------|-------------------|------|
| **Tenant player site** (`demo.force42.com`) | **No** | UI only; calls tenant API |
| **Tenant API** (`api.force42.com`) | **No** (except platform “Test GRA” button) | Enqueues `gra_outbound_events` in tenant DB |
| **Platform worker** (`raffle-worker`) | **Yes** | Single relay: signs + POSTs to `GRA_INGEST_URL` |
| **Platform console** | Config only | Stores encrypted GRA API key + HMAC per operator |
| **kenji-gateway** | **Yes** (`/gateway/notify`) | Regulatory payment ledger only |

**Client operator websites do not push to GRA.** Our **platform worker** relays on their behalf after commerce events.

---

## Two GRA data paths

### Path 1 — Operator compliance events (tickets, payments, play safe)

Triggered by raffle checkout, refunds, Play Safe, monthly export.

1. Tenant API writes rows to `gra_outbound_events` (`pending`)
2. BullMQ job `process-gra-outbound` or cron `gra-outbound-sweep` (every 5 min)
3. Worker reads credentials from **platform DB** (`operator_settings`, encrypted)
4. Worker POSTs to `https://ingest.force42.com/v1/events/*`

**Demo check:**

```bash
python3 scripts/demo-gra-check.py
```

Operator UI: **https://demo.force42.com/admin/gra-events** — status should move `pending` → `sent`.

GRA staff console live ticker: **https://console.force42.com**

### Path 2 — Payment ledger (regulatory tax / escrow)

**Not** sent by raffle outbound events alone. Requires **kenji-gateway** (live on **pay.force42.com**) or the dev simulator:

```bash
# Live checkout on demo → pay.force42.com → gateway calls /gateway/notify automatically

# Or manual simulator (op-001 sandbox keys):
cd /var/www/kenji-government
GRA_INGEST_URL=https://ingest.force42.com/v1 \
  bash tools/gateway-simulator/simulate-charge.sh 1000
```

Uses sandbox credentials for `op-001`. Appears in GRA **Payments** ledger.

For a **new operator** (not demo), update `/var/www/kenji-gateway/.env` `GRA_API_KEY` / `GRA_HMAC_SECRET` to match that operator’s GRA credentials before expecting ledger rows under their registry.

---

## Demo setup (one-time)

Demo operator must have GRA credentials in **platform console** (not in tenant `.env`):

```bash
python3 scripts/configure-demo-gra.py
```

This sets sandbox keys matching GRA registry `op-001`:

- API key: `gra_sandbox_op001_devkey0001`
- HMAC secret: `sandbox_hmac_op001_secret_32chars_min`

Requires:

- `GRA_INGEST_URL=https://ingest.force42.com/v1` on VPS worker `.env`
- `raffle-worker` PM2 process running
- `operators.gra_registry_id = op-001` for demo (already set)

---

## Stakeholder GRA demo flow (~10 min)

1. **Configure** (if queue stuck pending): `python3 scripts/configure-demo-gra.py`
2. **Purchase** on demo — mock checkout on any live raffle
3. **Operator** `/admin/gra-events` — show new `ticket.purchased` + `payment.completed`
4. **Instant relay** (optional): `python3 scripts/demo-gra-check.py --relay` — or wait ≤5 min for worker sweep
5. **GRA console** — live feed shows ticket/payment events
6. **Optional ledger** — run `simulate-charge.sh` for payment row in GRA Payments
7. **Platform** `platform.force42.com` → Reports → GRA health

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| All events `pending`, worker “0 sent” | No GRA keys on operator | `configure-demo-gra.py` |
| Test GRA / relay returns 500 | GRA ingest cannot decrypt `hmac_secret_encrypted` (seed used old `JWT_SECRET`) | `bash /var/www/kenji-government/scripts/fix-gra-sandbox-credentials.sh` |
| Events `failed` 401 | Wrong key/HMAC | Re-save credentials; Test GRA connection |
| Raffle orders OK, no GRA ledger | Mock checkout skips gateway | `simulate-charge.sh` or kenji-gateway |
| Worker not relaying | `raffle-worker` down | `pm2 restart raffle-worker` |
| Stakeholder waiting on sweep | Cron is every 5 min | `python3 scripts/demo-gra-check.py --relay` |

**Re-encrypt GRA ingest credential (VPS):**

```bash
bash /var/www/kenji-government/scripts/fix-gra-sandbox-credentials.sh
```

See also: [GRA_RELAY_RUNBOOK.md](./GRA_RELAY_RUNBOOK.md)
