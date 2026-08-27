#!/usr/bin/env bash
# Parameterized smoke test for a provisioned operator (optional live payment curl check).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API="${API:-https://api.force42.com}"
OPERATOR_SLUG="${OPERATOR_SLUG:-demo}"
TENANT_HOST="${TENANT_HOST:-${OPERATOR_SLUG}.force42.com}"
GRA_REGISTRY_ID="${GRA_REGISTRY_ID:-}"
CUSTOM_HOSTNAME="${CUSTOM_HOSTNAME:-}"
SKIP_PAYMENT="${SKIP_PAYMENT:-false}"

echo "=== Onboard operator E2E smoke (slug=$OPERATOR_SLUG host=$TENANT_HOST) ==="

if [[ -n "$GRA_REGISTRY_ID" ]]; then
  echo "GRA registry id: $GRA_REGISTRY_ID"
fi

echo "--- Wait for provision ---"
WAIT_OUT="$(python3 scripts/wait-for-provision.py --slug "$OPERATOR_SLUG")"
echo "$WAIT_OUT"
OPERATOR_ID="$(python3 -c 'import json,sys; print(json.loads(sys.stdin.read())["operator_id"])' <<<"$WAIT_OUT")"

if [[ -n "${GRA_API_KEY:-}" && -n "${GRA_HMAC_SECRET:-}" ]]; then
  echo "--- Configure GRA ---"
  python3 scripts/configure-operator-gra.py \
    --operator-id "$OPERATOR_ID" \
    --gra-api-key "$GRA_API_KEY" \
    --gra-hmac-secret "$GRA_HMAC_SECRET"
fi

echo "--- Public site + tenant context ---"
SITE_CODE="$(curl -s -o /dev/null -w "%{http_code}" "https://${TENANT_HOST}" 2>/dev/null || echo "000")"
CTX_CODE="$(curl -s -o /dev/null -w "%{http_code}" "$API/v1/tenant/context" -H "x-forwarded-host: $TENANT_HOST" 2>/dev/null || echo "000")"
echo "Site HTTPS: $SITE_CODE  Tenant context: $CTX_CODE"
if [[ "$SITE_CODE" != "200" && "$SITE_CODE" != "301" && "$SITE_CODE" != "302" ]]; then
  echo "WARN: public site returned $SITE_CODE"
fi
if [[ "$CTX_CODE" != "200" ]]; then
  echo "ERROR: tenant context failed ($CTX_CODE)" >&2
  exit 1
fi

if [[ -n "$CUSTOM_HOSTNAME" ]]; then
  echo "--- Custom hostname marker (manual DNS step) ---"
  echo "Add $CUSTOM_HOSTNAME in operator admin → Domains, CNAME to customers.force42.com, verify in Cloudflare."
fi

if [[ "$SKIP_PAYMENT" == "true" ]]; then
  echo "Skipping live payment check (SKIP_PAYMENT=true)"
  exit 0
fi

echo "--- Live payment pay page reachable ---"
PAY_URL="https://pay.force42.com/v1/pay?order_id=00000000-0000-4000-8000-000000000099&amount=50&tenant_host=${TENANT_HOST}"
PAY_CODE="$(curl -s -o /dev/null -w "%{http_code}" "$PAY_URL" 2>/dev/null || echo "000")"
echo "Pay page: $PAY_CODE ($PAY_URL)"
if [[ "$PAY_CODE" != "200" ]]; then
  echo "ERROR: pay page not available" >&2
  exit 1
fi

echo "E2E smoke checks passed. Run full checkout manually on $TENANT_HOST."
