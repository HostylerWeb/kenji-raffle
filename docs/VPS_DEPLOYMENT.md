# VPS deployment guide

Deploy Kenji Raffle Platform on a production VPS: platform console, API, worker, tenant websites, Postgres, Redis, and MinIO.

**Related docs:** [instructions.md](../instructions.md) (local dev), [BACKUP_RUNBOOK.md](BACKUP_RUNBOOK.md), [OPERATOR_ONBOARDING.md](OPERATOR_ONBOARDING.md).

---

## 1. What you are deploying

```
                    Cloudflare (DNS + SSL + optional custom hostnames)
                                    │
                    ┌───────────────┴───────────────┐
                    │  Nginx / Caddy (reverse proxy) │
                    └───────────────┬───────────────┘
                                    │
     ┌──────────────────────────────┼──────────────────────────────┐
     │                              │                              │
 platform.kenji-raffle.co.ke   {slug}.kenji-raffle.co.ke    customers.kenji-raffle.co.ke
 (platform console :3003)      (tenant web :3002)            (CNAME target for operator domains)
     │                              │                              │
     └──────────────────────────────┼──────────────────────────────┘
                                    │
                         API :4002 (tenant routing by Host header)
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
         PostgreSQL              Redis                MinIO
    kenji_platform +          BullMQ queues         kenji-raffle bucket
    kenji_tenant_* DBs        sessions/MFA          (file uploads)
              │
         Worker process (provisioning, rollups, DNS verify, destroy)
```

| Process | Role | Default port |
|---------|------|--------------|
| `@kenji-raffle/platform` | Platform staff console | 3003 |
| `@kenji-raffle/web` | Operator public site + `/admin` | 3002 |
| `@kenji-raffle/api` | REST API, tenant resolution | 4002 |
| `@kenji-raffle/worker` | Background jobs (required) | — |
| Postgres | Platform registry + per-tenant DBs | 5432 (internal) |
| Redis | Queues + refresh tokens | 6379 (internal) |
| MinIO | S3-compatible object storage | 9000 (internal) |

**GRA dependency:** Kenji Government (`kenji-government`) must be deployed and reachable at `GRA_INGEST_URL` (ingest API, port **4001** locally). GRA staff use the government console only — operators **push** signed JSON to ingest. Payment ledger rows in GRA require the **payment gateway** (`kenji-gateway`) to call `POST /v1/gateway/notify`, not raffle outbound events alone. See [IMPORTANT.md](../IMPORTANT.md).

---

## 2. Server requirements

| Item | Recommendation |
|------|----------------|
| OS | Ubuntu 22.04 / 24.04 LTS |
| CPU | 4+ vCPU for demo/small prod; 8+ with many tenants |
| RAM | 8 GB minimum; 16 GB+ for 50+ operators |
| Disk | 100 GB+ SSD (tenant DBs grow with orders) |
| Node.js | **22.x** (`node -v`) |
| Docker | 24+ for Postgres, Redis, MinIO |
| Reverse proxy | Nginx or Caddy |
| DNS | Cloudflare (recommended for operator custom domains) |

---

## 3. Initial server setup

```bash
# As root or with sudo
apt update && apt upgrade -y
apt install -y git curl build-essential ufw fail2ban

# Firewall — only expose SSH + HTTP/S; apps bind locally
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Node 22 via NodeSource (or nvm)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Docker
curl -fsSL https://get.docker.com | sh
```

Create an app user (optional but recommended):

```bash
adduser --disabled-password --gecos "" kenji
mkdir -p /var/www
chown kenji:kenji /var/www
```

---

## 4. Clone and install

```bash
cd /var/www
git clone <your-repo-url> Kenji-raffle
cd Kenji-raffle
cp .env.example .env
npm install
```

---

## 5. Infrastructure (Docker)

Use the raffle stack **or** a dedicated Postgres/Redis/MinIO — do not share production DBs with unrelated projects without planning backups and resource limits.

```bash
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml ps
```

This starts:

| Container | Port on host (dev compose) |
|-----------|----------------------------|
| `kenji-raffle-postgres` | 5437 → 5432 |
| `kenji-raffle-redis` | 6383 → 6379 |
| `kenji-raffle-minio` | 9000, 9001 |

**Production:** Prefer binding Postgres/Redis/MinIO to **127.0.0.1 only** (edit compose ports) so they are not public.

### Create MinIO bucket

```bash
docker exec kenji-raffle-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec kenji-raffle-minio mc mb local/kenji-raffle --ignore-existing
docker exec kenji-raffle-minio mc ls local
```

MinIO stores **files** (images, exports) — not database data. Bucket name must match `MINIO_BUCKET` in `.env`.

---

## 6. Production environment (`.env`)

Copy from `.env.example` and set **strong random** values for all secrets. Never commit `.env`.

### Core URLs (example production hostnames)

```bash
# --- Public URLs (used by browsers) ---
NEXT_PUBLIC_PLATFORM_URL="https://platform.kenji-raffle.co.ke"
NEXT_PUBLIC_PLATFORM_API_URL="https://api.kenji-raffle.co.ke"
NEXT_PUBLIC_API_URL="https://api.kenji-raffle.co.ke"
NEXT_PUBLIC_PLATFORM_HOSTNAME="platform.kenji-raffle.co.ke"
NEXT_PUBLIC_TENANT_BASE_DOMAIN="kenji-raffle.co.ke"

# Custom domains: operators CNAME www → this hostname (Cloudflare in front)
CUSTOM_DOMAIN_CNAME_TARGET="customers.kenji-raffle.co.ke"

# --- Database (use internal Docker hostnames if apps run on same VPS) ---
PLATFORM_DATABASE_URL="postgresql://kenji_platform:STRONG_PASSWORD@127.0.0.1:5437/kenji_platform?schema=public"
DATABASE_ADMIN_URL="postgresql://kenji_platform:STRONG_PASSWORD@127.0.0.1:5437/postgres?schema=public"
TENANT_DATABASE_HOST="127.0.0.1"
TENANT_DATABASE_PORT=5437

# --- Redis ---
REDIS_URL="redis://127.0.0.1:6383"

# --- MinIO (internal only) ---
MINIO_ENDPOINT="127.0.0.1"
MINIO_PORT=9000
MINIO_ACCESS_KEY="change-me"
MINIO_SECRET_KEY="change-me-long"
MINIO_BUCKET="kenji-raffle"
MINIO_USE_SSL=false

# --- Auth (generate: openssl rand -base64 48) ---
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
CREDENTIALS_ENCRYPTION_KEY="..."   # 32+ bytes for AES

JWT_EXPIRES_IN="30m"
JWT_REFRESH_EXPIRES_IN="7d"

# --- GRA (operator outbound events — not card processing) ---
GRA_INGEST_URL="https://ingest.force42.com/v1"
# GRA_RELAY_BATCH_SIZE=50          # events per relay run (default 50)
# GRA_RELAY_MAX_PER_MINUTE=50      # per-operator cap (GRA limit is 60/min)
# GRA_RELAY_OPERATOR_CONCURRENCY=3 # parallel tenants during sweep

# --- Payments (payment gateway — NOT GRA ingest) ---
HARAMBE_PAYMENT_MODE="live"
# Production VPS (force42.com):
# HARAMBE_PAYMENT_MODE=live
# HARAMBE_GATEWAY_URL=https://pay.force42.com/v1/pay
# HARAMBE_CALLBACK_SECRET=<shared-with-kenji-gateway>
# GATEWAY_DEV_MOCK=false
# CORS_ALLOWED_ORIGINS=https://demo.force42.com,https://platform.force42.com,https://*.force42.com,https://pay.force42.com
# HARAMBE_GATEWAY_URL="http://localhost:4003/v1/pay"   # kenji-gateway :4003 locally

# --- Email (alerts, password reset) ---
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="..."
SMTP_PASS="..."
```

Generate secrets:

```bash
openssl rand -base64 48   # JWT_SECRET, JWT_REFRESH_SECRET
openssl rand -base64 32   # CREDENTIALS_ENCRYPTION_KEY
```

**Important:** `NEXT_PUBLIC_*` variables are baked into Next.js at **build time**. After changing them, rebuild platform and web:

```bash
npm run build -w @kenji-raffle/platform
npm run build -w @kenji-raffle/web
```

---

## 7. Database migrations and seed

```bash
npm run generate -w @kenji-raffle/database-platform
npm run generate -w @kenji-raffle/database-tenant
npm run migrate:platform
npm run db:seed:platform   # first deploy only — creates admin@platform.local (change password immediately)
```

Build all packages:

```bash
npm run build
```

---

## 8. Run with systemd (recommended)

Create units under `/etc/systemd/system/`. All services load `.env` from `/var/www/Kenji-raffle/.env`.

### API

```ini
# /etc/systemd/system/kenji-raffle-api.service
[Unit]
Description=Kenji Raffle API
After=docker.service network.target
Requires=docker.service

[Service]
Type=simple
User=kenji
WorkingDirectory=/var/www/Kenji-raffle
EnvironmentFile=/var/www/Kenji-raffle/.env
ExecStart=/usr/bin/node apps/api/dist/main.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Worker (required)

**GRA egress:** Only this service needs outbound HTTPS to `GRA_INGEST_URL`. The API enqueues `gra_outbound_events` in tenant DBs and schedules BullMQ jobs — it does not POST to GRA on checkout. Exception: platform **Test GRA connection** (admin diagnostic).

Scheduled GRA jobs (BullMQ, in `apps/worker`):

| Job | Schedule | Purpose |
|-----|----------|---------|
| `process-gra-outbound` | On demand after purchase/refund | Per-operator relay |
| `gra-outbound-sweep` | Every 5 min | Safety net for all tenants |
| `gra-heartbeat` | Daily 06:00 UTC | Credential + connectivity check |

Relay logs (JSON): `journalctl -u kenji-raffle-worker | grep gra_relay_run`

```ini
# /etc/systemd/system/kenji-raffle-worker.service
[Unit]
Description=Kenji Raffle Worker
After=kenji-raffle-api.service

[Service]
Type=simple
User=kenji
WorkingDirectory=/var/www/Kenji-raffle
EnvironmentFile=/var/www/Kenji-raffle/.env
ExecStart=/usr/bin/node apps/worker/dist/main.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Platform console

```ini
# /etc/systemd/system/kenji-raffle-platform.service
[Unit]
Description=Kenji Raffle Platform Console
After=kenji-raffle-api.service

[Service]
Type=simple
User=kenji
WorkingDirectory=/var/www/Kenji-raffle/apps/platform
EnvironmentFile=/var/www/Kenji-raffle/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Tenant web

```ini
# /etc/systemd/system/kenji-raffle-web.service
[Unit]
Description=Kenji Raffle Tenant Web
After=kenji-raffle-api.service

[Service]
Type=simple
User=kenji
WorkingDirectory=/var/www/Kenji-raffle/apps/web
EnvironmentFile=/var/www/Kenji-raffle/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable kenji-raffle-api kenji-raffle-worker kenji-raffle-platform kenji-raffle-web
systemctl start kenji-raffle-api kenji-raffle-worker kenji-raffle-platform kenji-raffle-web
systemctl status kenji-raffle-api kenji-raffle-worker
```

Logs:

```bash
journalctl -u kenji-raffle-api -f
journalctl -u kenji-raffle-worker -f
```

---

## 9. Nginx reverse proxy

Example hostnames:

| Hostname | Upstream |
|----------|----------|
| `platform.kenji-raffle.co.ke` | `127.0.0.1:3003` |
| `api.kenji-raffle.co.ke` | `127.0.0.1:4002` |
| `*.kenji-raffle.co.ke` | `127.0.0.1:3002` (tenant sites) |
| `customers.kenji-raffle.co.ke` | `127.0.0.1:3002` (operator custom domains CNAME target) |

Minimal Nginx snippet (TLS termination via Cloudflare origin cert or Let's Encrypt):

```nginx
# Platform console
server {
    listen 443 ssl http2;
    server_name platform.kenji-raffle.co.ke;
    ssl_certificate     /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin-key.pem;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API
server {
    listen 443 ssl http2;
    server_name api.kenji-raffle.co.ke;

    location / {
        proxy_pass http://127.0.0.1:4002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Tenant sites — wildcard staging subdomains
server {
    listen 443 ssl http2;
    server_name *.kenji-raffle.co.ke;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Operator custom domains (CNAME target)
server {
    listen 443 ssl http2;
    server_name customers.kenji-raffle.co.ke;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

For **operator custom domains** (e.g. `www.operator-brand.co.ke`), use Cloudflare **Custom Hostnames** (SSL for SaaS) or add each hostname to Nginx / use a dynamic proxy — see [OPERATOR_ONBOARDING.md](OPERATOR_ONBOARDING.md).

Reload: `nginx -t && systemctl reload nginx`

---

## 10. DNS (Cloudflare)

| Record | Type | Value |
|--------|------|--------|
| `platform` | A or CNAME | VPS IP / proxy |
| `api` | A or CNAME | VPS IP / proxy |
| `*` (wildcard) | A or CNAME | VPS IP (staging: `demo.kenji-raffle.co.ke`) |
| `customers` | A or CNAME | VPS IP (operator CNAME target) |

Enable **Proxied** (orange cloud) for SSL and DDoS protection.

---

## 11. Post-deploy checklist

- [ ] `https://platform.…` loads login page
- [ ] Login works; change default admin password and enable 2FA
- [ ] System page: Postgres, Redis, MinIO **OK**
- [ ] Worker **Alive** on System page
- [ ] Create test operator → status **active** (worker running)
- [ ] `https://{slug}.kenji-raffle.co.ke` loads tenant site
- [ ] `https://{slug}.…/admin` loads operator admin
- [ ] GRA test connection on operator detail succeeds
- [ ] Backups scheduled (see [BACKUP_RUNBOOK.md](BACKUP_RUNBOOK.md))

---

## 12. Deploying updates

```bash
cd /var/www/Kenji-raffle
git pull
npm install
npm run generate -w @kenji-raffle/database-platform
npm run generate -w @kenji-raffle/database-tenant
npm run migrate:platform
npm run migrate:tenants          # all active tenant DBs after tenant schema changes
npm run build

systemctl restart kenji-raffle-api
systemctl restart kenji-raffle-worker
systemctl restart kenji-raffle-platform
systemctl restart kenji-raffle-web
```

If platform console shows webpack errors after deploy, clear Next cache before restart:

```bash
rm -rf apps/platform/.next apps/web/.next
npm run build -w @kenji-raffle/platform
npm run build -w @kenji-raffle/web
systemctl restart kenji-raffle-platform kenji-raffle-web
```

---

## 13. Backups

See [BACKUP_RUNBOOK.md](BACKUP_RUNBOOK.md). Minimum production schedule:

- Daily `pg_dump` of `kenji_platform` and all `kenji_tenant_*` databases
- Weekly MinIO mirror
- Off-site copy of backup files

---

## 14. Troubleshooting & common issues

### Platform console HTTP 500 / `Cannot find module './997.js'`

**Cause:** Stale Next.js build cache (`.next`) after code changes or mixed dev/prod builds.

**Fix:**

```bash
systemctl stop kenji-raffle-platform
rm -rf /var/www/Kenji-raffle/apps/platform/.next
cd /var/www/Kenji-raffle && npm run build -w @kenji-raffle/platform
systemctl start kenji-raffle-platform
```

Same pattern for tenant web with `apps/web/.next`.

---

### MinIO shows **Issue** / `UnknownError` or bucket missing

**Cause:** MinIO not running, wrong credentials, or bucket `kenji-raffle` does not exist.

**Fix:**

```bash
docker ps | grep minio
docker exec kenji-raffle-minio mc mb local/kenji-raffle --ignore-existing
```

Verify `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` in `.env` match the container.

---

### Operator stuck in **onboarding** / provisioning never completes

**Cause:** Worker not running or Redis unreachable.

**Fix:**

```bash
systemctl status kenji-raffle-worker
journalctl -u kenji-raffle-worker -n 100
redis-cli -p 6383 ping
```

Ensure `npm run dev:worker` equivalent (`kenji-raffle-worker.service`) is always running in production.

---

### Platform logs you out every few minutes

**Cause:** Access token expired and refresh failed (Redis down, missing refresh token, or parallel refresh race — fixed in recent client builds).

**Fix:** Confirm Redis is up; users should log in again after deploy. Ensure `JWT_REFRESH_SECRET` is set and stable (changing it invalidates all sessions).

---

### 2FA / MFA errors after enabling authenticator

**Cause:** Client navigation after server revoked tokens.

**Fix:** Hard refresh login page. If error persists, clear browser localStorage for the platform domain and sign in again.

---

### API returns 401 on all platform routes

**Causes:** Wrong `NEXT_PUBLIC_PLATFORM_API_URL`, clock skew, expired JWT, or API not reachable from browser.

**Fix:** Browser devtools → Network: confirm API URL is correct HTTPS origin. Check `journalctl -u kenji-raffle-api`. Re-login.

---

### Tenant site shows wrong operator or 404

**Cause:** API resolves tenant by `Host` header; Nginx must pass `Host` unchanged.

**Fix:** Verify `proxy_set_header Host $host;` in Nginx. DNS must point hostname to this VPS. Operator must be **active** in platform console.

---

### Custom domain verify fails

**Causes:** DNS not propagated, wrong CNAME target, apex A record conflict.

**Fix:** Operator adds CNAME `www` → `CUSTOM_DOMAIN_CNAME_TARGET`. Wait 15–30 minutes. See [OPERATOR_ONBOARDING.md](OPERATOR_ONBOARDING.md).

---

### GRA connection / ingest failures

**Cause:** `GRA_INGEST_URL` wrong, GRA service down, operator GRA keys missing, worker not running, or rate limit (429).

**Fix:**

1. `systemctl status kenji-raffle-worker` — relay only runs here
2. `journalctl -u kenji-raffle-worker | grep gra_relay_run` — check `gra_relay_backlog`, `gra_relay_http_429_total`
3. Platform **Reports → GRA health** — pending age, heartbeat status
4. Test ingest: platform console → operator → **Test GRA connection**
5. Retry failed rows: platform drill-down or operator `/admin/gra-events` (resets to `pending`, enqueues job — no API HTTP to GRA)
6. If GRA IP allowlist enabled: whitelist **worker egress IP**, not API pods

See [docs/GRA_RELAY_RUNBOOK.md](GRA_RELAY_RUNBOOK.md). Event mapping: [IMPORTANT.md](../IMPORTANT.md).

---

### Postgres connection errors / too many connections

**Cause:** Many tenant DB pools on one API instance.

**Fix:** Tune `max_connections` in Postgres; consider PgBouncer (`PGBOUNCER_URL` in `.env`). Restart API after infra changes.

---

### `prisma` / migration errors after pull

**Fix:**

```bash
npm run generate -w @kenji-raffle/database-platform
npm run generate -w @kenji-raffle/database-tenant
npm run migrate:platform
npm run migrate:tenants
npm run build -w @kenji-raffle/api
systemctl restart kenji-raffle-api kenji-raffle-worker
```

---

### Port conflicts with kenji-government on same VPS

**Cause:** Both stacks may use 9000 (MinIO), 5436/5437, etc.

**Fix:** Run separate Docker compose stacks with **non-overlapping host ports** or separate VPSes. Document which ports each project uses in `/etc/hosts` or internal networking only.

---

### Payment / checkout not completing

**Cause:** `HARAMBE_PAYMENT_MODE=mock` in dev; live payment gateway not configured or `HARAMBE_GATEWAY_URL` points at GRA ingest by mistake.

**Fix:** Deploy `kenji-gateway`, set `HARAMBE_GATEWAY_URL` to the gateway checkout URL (not `:4001`). Gateway notifies GRA via `gateway/notify` separately.

---

### Email alerts not sent

**Cause:** SMTP not configured; platform currently logs some alerts instead of sending.

**Fix:** Set `SMTP_*` in `.env` and platform settings `alert_email`. Implement/configure SMTP in API if still stubbed.

---

## 14b. Raffle product — post-deploy checklist

After deploying or upgrading the **tenant raffle stack** (`apps/web`, tenant API routes, worker GRA/draw jobs), complete these steps on each environment (staging + production).

### Database

1. Apply platform migrations (analytics + legal columns on `operator_settings`):

```bash
cd /var/www/Kenji-raffle/packages/database-platform
npx prisma migrate deploy
npx prisma generate
```

2. Regenerate Prisma clients if you build from a fresh clone:

```bash
npm run generate -w @kenji-raffle/database-platform
npm run generate -w @kenji-raffle/database-tenant
```

3. Run tenant migrations when tenant schema changed (includes `gra_outbound_events.next_attempt_at` for relay backoff):

```bash
npm run migrate:tenants
```

4. After pull that adds platform heartbeat columns (`operator_settings.gra_last_heartbeat_*`):

```bash
cd /var/www/Kenji-raffle/packages/database-platform && npx prisma migrate deploy
```

### Environment variables (tenant API + worker)

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Transactional email (Mailpit in dev, real SMTP in prod) |
| `PLAYER_AUTO_VERIFY_EMAIL` | `true` in dev; **`false` on VPS** so players must verify email before purchase |
| `GRA_INGEST_URL` | Kenji Government ingest base — **set on worker**; API uses only for Test GRA button |
| `GRA_RELAY_BATCH_SIZE` | Max events per relay batch (default `50`) |
| `GRA_RELAY_MAX_PER_MINUTE` | Per-operator send cap (default `50`, GRA hard limit `60`) |
| `GRA_RELAY_OPERATOR_CONCURRENCY` | Parallel tenants during sweep (default `3`) |
| `CREDENTIALS_ENCRYPTION_KEY` | Decrypt tenant DB URLs + operator GRA keys |
| `HARAMBE_PAYMENT_MODE` | `mock` (default) or `live` when gateway is deployed |
| `HARAMBE_GATEWAY_URL` | **kenji-gateway** checkout URL (port **4003** locally) — not GRA `:4001` |
| `HARAMBE_CALLBACK_SECRET` | Shared secret for gateway → raffle callback |
| `REDIS_URL` | Worker queues (GRA relay, auto-draw, cart expiry) |

### Operator configuration (per tenant)

1. Create operator in GRA with matching `external_id` → set platform **GRA registry ID**.
2. Platform console → operator → set **GRA API key** + **HMAC secret** (same as GRA site credentials).
2. Operator `/admin/settings` → support email, analytics IDs (GA4, Facebook Pixel), legal text (FAQ/terms/privacy), social links.
3. Platform operator feature flag `checkout_enabled` — set `false` to disable purchases without code deploy.

### Worker jobs (must be running)

The worker must process:

- `process-gra-outbound` — relay queued events to GRA (HMAC-signed); triggered after each purchase
- `gra-outbound-sweep` — every 5 minutes, all active tenants
- `gra-heartbeat` — daily credential check; status on platform Reports → GRA health
- `auto-draw-check` — every 15 minutes for `draw_type=automatic` raffles past `end_date`
- `cart-expiry` — every 5 minutes

**Payment ledger:** Raffle relay does **not** populate GRA `payment_transactions`. Deploy **kenji-gateway** (`/var/www/kenji-gateway`, port **4003**) or use `kenji-government/tools/gateway-simulator/simulate-charge.sh` for regulatory ledger rows via `POST /v1/gateway/notify`.

Ops runbook: [docs/GRA_RELAY_RUNBOOK.md](GRA_RELAY_RUNBOOK.md) · Architecture: [docs/GRA_INTEGRATION_ARCHITECTURE.md](GRA_INTEGRATION_ARCHITECTURE.md)

```bash
systemctl status kenji-raffle-worker
journalctl -u kenji-raffle-worker -n 50 --no-pager
```

### GRA smoke test (relay)

1. Platform console → operator → **Test GRA connection**
2. Complete a purchase on tenant site
3. Operator `/admin/gra-events` — rows move `pending` → `sent` within ~1 min (worker running)
4. Platform **Reports → GRA health** — pending depth `0`, heartbeat OK after daily job or manual test
5. For payment **ledger** in GRA staff console: run gateway simulator or `kenji-gateway` charge (separate from raffle relay)

### Smoke test

Use **[docs/RAFFLE_FUNCTIONAL_TEST.md](RAFFLE_FUNCTIONAL_TEST.md)** — at minimum:

1. Register → verify email (if `PLAYER_AUTO_VERIFY_EMAIL=false`) → login → purchase → durable `/checkout/success?order_id=...`
2. Operator `/admin/gra-events` shows `payment.completed` + `ticket.purchased` after purchase
3. `/winners` after manual draw

### Email in dev

Point SMTP at Mailpit/Mailhog on the VPS or local Docker:

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM=noreply@kenji-raffle.local
```

Without `SMTP_HOST`, emails are **logged only** (stub mode).

---

## 15. Security hardening (production)

- Change default platform admin password immediately; enable 2FA for all staff
- Restrict Postgres/Redis/MinIO to localhost or private network
- Use strong unique secrets in `.env`; restrict file permissions: `chmod 600 .env`
- Keep OS and Docker images updated
- Fail2ban + UFW enabled
- Regular backups tested with restore drill
- Separate `DATABASE_ADMIN_URL` credentials with minimal privileges in production (not superuser)

---

## 16. Getting help

When reporting issues, include:

1. `systemctl status` for api, worker, platform, web
2. Last 50 lines of `journalctl -u kenji-raffle-api` and worker
3. System page screenshot (Postgres / Redis / MinIO / Worker)
4. Relevant `.env` keys **without** secret values (only hostnames and ports)
