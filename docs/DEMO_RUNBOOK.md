# Demo site runbook — demo.force42.com

Operational guide for refreshing demo content and running a stakeholder walkthrough.

**Related:** [DEMO_GRA.md](./DEMO_GRA.md) (GRA compliance demo), [RAFFLE_FUNCTIONAL_TEST.md](./RAFFLE_FUNCTIONAL_TEST.md)

---

## 1. Demo hygiene (after testing)

Purchases and draws deplete raffles. The homepage can go empty if all raffles are drawn or none are flagged featured.

**Refresh everything:**

```bash
cd /var/www/Kenji-raffle
bash scripts/refresh-demo.sh
```

**Also populate `/winners` after purchases exist:**

```bash
bash scripts/refresh-demo.sh --with-draw
```

**First-time or after GRA credential loss:**

```bash
bash scripts/refresh-demo.sh --gra
# or
CONFIGURE_GRA=1 bash scripts/refresh-demo.sh
```

| Script | Purpose |
|--------|---------|
| `scripts/seed-demo-tenant.py` | 3 live raffles, categories, legal copy, test player |
| `scripts/run-demo-draw.py` | Manual draw → public winners |
| `scripts/configure-demo-gra.py` | Platform GRA keys for demo operator |
| `scripts/demo-gra-check.py` | Queue status (pending/sent/failed) |
| `scripts/trigger-gra-relay.sh` | Instant relay (don't wait 5 min sweep) |
| `scripts/refresh-demo.sh` | Runs the above in order |

---

## 2. Credentials (demo only)

| Role | URL | Login |
|------|-----|-------|
| **Player** | https://demo.force42.com | `player@demo.local` / `ChangeMe123!` |
| **Operator admin** | https://demo.force42.com/admin | `owner@demo.local` / `ChangeMe123!` |
| **Platform staff** | https://platform.force42.com | `admin@platform.local` / `ChangeMe123!` |
| **GRA staff** | https://console.force42.com | GRA admin (see kenji-government) |

VPS: `PLAYER_AUTO_VERIFY_EMAIL=true` — purchases work without email verify step.

---

## 3. Stakeholder demo script (~20 min)

Run on **https://demo.force42.com** in a clean browser (or incognito).

### A. Public discovery (3 min)

1. **Home** — hero, categories, live raffles grid, recent winners (if draw was run)
2. **Raffles** — filters, price sort (`?sort=price_asc`)
3. **Raffle detail** — gallery, prize tabs, ticket selector
4. **Winners** — table + mobile cards
5. **FAQ / Terms / Privacy** — operator legal copy

### B. Player commerce (7 min)

1. **Add to cart** — guest OK; cart badge updates
2. **Cart** — reservation countdown, thumbnails, qty stepper
3. **Checkout** — login as `player@demo.local` if prompted
4. **Mock payment** — Continue → **Pay successfully**
5. **Success** — order ID, ticket numbers, instant wins (on `cash-*-live` raffles)
6. **Account → Tickets / Orders** — confirm purchase persisted

### C. Operator back office (5 min)

Same hostname: **https://demo.force42.com/admin**

1. **Dashboard** — active raffles, orders
2. **Orders** — find the demo purchase
3. **GRA events** (`/admin/gra-events`) — `ticket.purchased`, `payment.completed` queued then **sent** by platform worker (see [DEMO_GRA.md](./DEMO_GRA.md))
4. **Raffles** — catalog, ticket pool

### D. Platform control plane (3 min)

**https://platform.force42.com**

1. **Operators** — demo operator active, GRA registry `op-001`
2. **Operator → Test GRA connection** — ingest reachable
3. **Reports → GRA health** — pending depth, heartbeat

### E. GRA oversight (optional, 5 min)

See [DEMO_GRA.md](./DEMO_GRA.md) — live feed from operator events + payment ledger via gateway simulator.

---

## 4. Automated smoke

```bash
cd apps/web
CI=true PLAYWRIGHT_BASE_URL=https://demo.force42.com npx playwright test e2e/smoke.spec.ts
```

8 tests including full mock purchase → account tickets.

---

## 5. Deploy after code changes

```bash
# From dev machine with SSH access
rsync -avz apps/web/src/ root@152.239.119.54:/var/www/Kenji-raffle/apps/web/src/
ssh root@152.239.119.54 'cd /var/www/Kenji-raffle && npm run build -w @kenji-raffle/web && pm2 restart raffle-web'
```

Then run `bash scripts/refresh-demo.sh` if demo content was affected.

---

## 6. What is intentionally not demo-ready

| Item | Notes |
|------|-------|
| Real M-Pesa/card | Mock checkout only until `kenji-gateway` on pay.force42.com |
| Player site design | Functional shell — design refresh deferred |
| Operator `/admin` UI | Legacy styling — separate restyle |
| Email verify gate | Off on VPS for easy demos; turn off `PLAYER_AUTO_VERIFY_EMAIL` for prod-like test |
