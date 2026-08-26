#!/usr/bin/env bash
# Mandatory pre-handoff checklist for first real operator go-live.
# Run until FAIL=0 before manual testing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API="${API:-https://api.force42.com}"
PLATFORM="${PLATFORM:-https://platform.force42.com}"
PAY="${PAY:-https://pay.force42.com}"
INGEST="${INGEST:-https://ingest.force42.com}"
CONSOLE="${CONSOLE:-https://console.force42.com}"
DEMO_HOST="${DEMO_HOST:-demo.force42.com}"
VPS_HOST="${VPS_HOST:-root@152.239.119.54}"
SSH_OPTS=(-o StrictHostKeyChecking=no)

PASS=0
FAIL=0
WARN=0

pass() { echo "✓ PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "✗ FAIL: $1"; FAIL=$((FAIL + 1)); }
warn() { echo "⚠ WARN: $1"; WARN=$((WARN + 1)); }

run_ssh() {
  if [[ -n "${SSHPASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
    sshpass -e ssh "${SSH_OPTS[@]}" "$@"
  else
    ssh "${SSH_OPTS[@]}" "$@"
  fi
}

echo "=========================================="
echo " First-operator gap scan"
echo " API=$API  PAY=$PAY"
echo "=========================================="

# --- Health endpoints ---
check_health() {
  local label="$1"
  local url="$2"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")"
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    pass "Health $label ($code)"
  else
    fail "Health $label ($code) — $url"
  fi
}

check_reachable() {
  local label="$1"
  local url="$2"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")"
  if [[ "$code" != "000" ]]; then
    pass "Reachable $label ($code)"
  else
    fail "Unreachable $label — $url"
  fi
}

check_health "raffle-api" "$API/health"
check_health "platform" "$PLATFORM"
check_health "pay-gateway" "$PAY/health"
check_reachable "gra-ingest" "$INGEST/v1"
check_health "gra-console" "$CONSOLE"

# --- PM2 on VPS ---
if run_ssh "$VPS_HOST" "pm2 jlist" >/tmp/gap-pm2.json 2>/dev/null; then
  for proc in raffle-api raffle-web raffle-worker raffle-platform kenji-gateway; do
    if python3 - <<PY
import json
names = {p["name"] for p in json.load(open("/tmp/gap-pm2.json"))}
raise SystemExit(0 if "$proc" in names else 1)
PY
    then
      online="$(python3 - <<PY
import json
for p in json.load(open("/tmp/gap-pm2.json")):
    if p["name"] == "$proc":
        print(p.get("pm2_env", {}).get("status", "?"))
        break
PY
)"
      if [[ "$online" == "online" ]]; then
        pass "PM2 $proc online"
      else
        fail "PM2 $proc status=$online"
      fi
    else
      fail "PM2 process missing: $proc"
    fi
  done
else
  warn "Could not SSH to VPS for PM2 checks (set SSHPASS for full scan)"
fi

# --- VPS env (live payment + tenant domain) ---
if run_ssh "$VPS_HOST" "grep -E '^(HARAMBE_|NEXT_PUBLIC_TENANT|CUSTOM_DOMAIN|GRA_INGEST|GATEWAY_DEV)' /var/www/Kenji-raffle/.env 2>/dev/null" >/tmp/gap-raffle-env.txt 2>/dev/null; then
  grep -qE 'NEXT_PUBLIC_TENANT_BASE_DOMAIN=(\"?force42.com\"?)' /tmp/gap-raffle-env.txt && pass "NEXT_PUBLIC_TENANT_BASE_DOMAIN=force42.com" || fail "NEXT_PUBLIC_TENANT_BASE_DOMAIN not force42.com"
  grep -qE 'CUSTOM_DOMAIN_CNAME_TARGET=(\"?customers.force42.com\"?)' /tmp/gap-raffle-env.txt && pass "CUSTOM_DOMAIN_CNAME_TARGET set" || fail "CUSTOM_DOMAIN_CNAME_TARGET missing"
  grep -q 'HARAMBE_PAYMENT_MODE=live' /tmp/gap-raffle-env.txt && pass "HARAMBE_PAYMENT_MODE=live" || fail "HARAMBE_PAYMENT_MODE not live"
  grep -qE 'HARAMBE_GATEWAY_URL=(\"?)https://pay.force42.com/v1/pay(\"?)' /tmp/gap-raffle-env.txt && pass "HARAMBE_GATEWAY_URL → pay.force42.com" || fail "HARAMBE_GATEWAY_URL not set to pay.force42.com/v1/pay"
  grep -q 'GATEWAY_DEV_MOCK=false' /tmp/gap-raffle-env.txt && pass "GATEWAY_DEV_MOCK=false" || fail "GATEWAY_DEV_MOCK not false"
  grep -qE 'GRA_INGEST_URL=(\"?)https://ingest.force42.com/v1(\"?)' /tmp/gap-raffle-env.txt && pass "GRA_INGEST_URL on worker path" || fail "GRA_INGEST_URL not production ingest"
else
  warn "Could not read raffle .env on VPS"
fi

if run_ssh "$VPS_HOST" "grep -E '^(GRA_INGEST|RAFFLE_CALLBACK|RAFFLE_API)' /var/www/kenji-gateway/.env 2>/dev/null" >/tmp/gap-gateway-env.txt 2>/dev/null; then
  grep -q 'GRA_INGEST_URL=https://ingest.force42.com/v1' /tmp/gap-gateway-env.txt && pass "Gateway GRA_INGEST_URL" || fail "Gateway GRA_INGEST_URL missing"
  grep -q 'RAFFLE_API_URL=https://api.force42.com' /tmp/gap-gateway-env.txt && pass "Gateway RAFFLE_API_URL" || fail "Gateway RAFFLE_API_URL missing"
  grep -q 'RAFFLE_CALLBACK_SECRET=' /tmp/gap-gateway-env.txt && pass "Gateway RAFFLE_CALLBACK_SECRET set" || fail "Gateway RAFFLE_CALLBACK_SECRET missing"
else
  fail "kenji-gateway .env not found on VPS"
fi

# --- Pay page ---
PAY_CODE="$(curl -s -o /dev/null -w "%{http_code}" "$PAY/v1/pay?order_id=00000000-0000-4000-8000-000000000001&amount=100&tenant_host=$DEMO_HOST" 2>/dev/null || echo "000")"
if [[ "$PAY_CODE" == "200" ]]; then
  pass "GET /v1/pay returns 200"
else
  fail "GET /v1/pay ($PAY_CODE)"
fi

# --- Tenant context on demo ---
TENANT_CODE="$(curl -s -o /dev/null -w "%{http_code}" "$API/v1/tenant/context" -H "x-forwarded-host: $DEMO_HOST" 2>/dev/null || echo "000")"
if [[ "$TENANT_CODE" == "200" ]]; then
  pass "Tenant context on $DEMO_HOST"
else
  fail "Tenant context ($TENANT_CODE) on $DEMO_HOST"
fi

# --- Platform new-operator page mentions force42.com ---
if curl -sf "$PLATFORM/operators/new" 2>/dev/null | grep -q 'force42.com'; then
  pass "Platform new-operator page shows force42.com"
else
  fail "Platform new-operator page missing force42.com (rebuild platform web?)"
fi

# --- Docs: no kenji-raffle.local in onboarding ---
if grep -r 'kenji-raffle.local' docs/OPERATOR_ONBOARDING.md docs/DEMO_RUNBOOK.md 2>/dev/null; then
  fail "Onboarding docs still reference kenji-raffle.local"
else
  pass "Onboarding docs use production hostnames"
fi

# --- Security retest (production API) ---
if API="$API" HOST="$DEMO_HOST" NODE_ENV=production bash scripts/security-retest.sh >/tmp/gap-security.txt 2>&1; then
  if grep -qE 'FAIL=0[^0-9]|FAIL=0$' /tmp/gap-security.txt; then
    pass "Security retest PASS=0"
  else
    fail "Security retest reported failures — see /tmp/gap-security.txt"
  fi
else
  fail "Security retest script failed"
fi

# --- Gateway charge accepts requests (env loaded) ---
CHARGE_BODY='{"order_id":"00000000-0000-4000-8000-000000000099","gross_amount":50,"currency":"KES","ticket_reference":"gap-scan","callback_url":"https://api.force42.com/v1/payments/gateway/callback","tenant_host":"demo.force42.com","card_number":"4242424242424242"}'
CHARGE_RESP="$(curl -s -X POST "$PAY/v1/charge" -H "Content-Type: application/json" -d "$CHARGE_BODY" 2>/dev/null || echo '{}')"
if echo "$CHARGE_RESP" | grep -q 'gra_credentials_missing'; then
  fail "Gateway /v1/charge missing GRA env (PM2 not loading .env?)"
elif echo "$CHARGE_RESP" | grep -qE '"status":"(completed|failed)"'; then
  pass "Gateway /v1/charge processes test card"
else
  fail "Gateway /v1/charge unexpected response: $CHARGE_RESP"
fi

# --- CORS allows tenant subdomains ---
CORS_NEW="$(curl -s -I "$API/v1/tenant/context" \
  -H "Origin: https://newoperator.force42.com" \
  -H "x-forwarded-host: $DEMO_HOST" 2>/dev/null | grep -i 'access-control-allow-origin' || true)"
if echo "$CORS_NEW" | grep -qi 'newoperator.force42.com'; then
  pass "CORS allows new *.force42.com tenant origins"
else
  fail "CORS blocks new tenant subdomains — add https://*.force42.com to CORS_ALLOWED_ORIGINS on VPS"
fi

# --- Cloudflare token (optional) ---
CF_TOKEN=""
if [[ -f /var/www/kenji-government/ssh.txt ]]; then
  CF_TOKEN="$(grep -E '^API token:' /var/www/kenji-government/ssh.txt | sed 's/^API token:[[:space:]]*//' || true)"
fi
if [[ -n "$CF_TOKEN" ]]; then
  cf_status="$(curl -s -H "Authorization: Bearer $CF_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify | python3 -c 'import sys,json; print(json.load(sys.stdin).get("result",{}).get("status","?"))' 2>/dev/null || echo "?")"
  if [[ "$cf_status" == "active" ]]; then
    pass "Cloudflare API token active"
  else
    warn "Cloudflare token verify status=$cf_status"
  fi
else
  warn "Cloudflare token not found in kenji-government/ssh.txt"
fi

# --- GRA onboarding integration env (VPS) ---
if run_ssh "$VPS_HOST" "grep -q '^PLATFORM_GRA_INTEGRATION_SECRET=' /var/www/Kenji-raffle/.env 2>/dev/null && grep -q '^PLATFORM_GRA_INTEGRATION_SECRET=' /var/www/kenji-government/.env 2>/dev/null" 2>/dev/null; then
  pass "PLATFORM_GRA_INTEGRATION_SECRET set on Kenji + GRA VPS env"
else
  fail "PLATFORM_GRA_INTEGRATION_SECRET missing on VPS (.env in Kenji-raffle and/or kenji-government)"
fi

if run_ssh "$VPS_HOST" "grep -q '^GRA_INTEGRATIONS_URL=.*api/integrations/v1' /var/www/Kenji-raffle/.env 2>/dev/null" 2>/dev/null; then
  pass "GRA_INTEGRATIONS_URL set on Kenji VPS env (console /api proxy path)"
else
  fail "GRA_INTEGRATIONS_URL missing or wrong on Kenji VPS .env (need https://console.force42.com/api/integrations/v1)"
fi

echo "=========================================="
echo " Gap scan: PASS=$PASS FAIL=$FAIL WARN=$WARN"
echo "=========================================="
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
