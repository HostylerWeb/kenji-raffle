#!/usr/bin/env bash
# Security regression tests — run against local or remote API.
# Usage: API=http://localhost:4002 HOST=demo.kenji-raffle.local ./scripts/security-retest.sh

set -euo pipefail

API="${API:-http://localhost:4002}"
HOST="${HOST:-demo.kenji-raffle.local}"
PASS=0
FAIL=0
WARN=0
SKIP=0

pass() { echo "✓ PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "✗ FAIL: $1"; FAIL=$((FAIL + 1)); }
warn() { echo "⚠ WARN: $1"; WARN=$((WARN + 1)); }
skip() { echo "- SKIP: $1"; SKIP=$((SKIP + 1)); }

echo "=========================================="
echo " Security re-test: $API"
echo " Tenant host: $HOST"
echo "=========================================="

# --- CORS ---
CORS=$(curl -s -I -X OPTIONS "$API/v1/me" \
  -H "Origin: https://evil-attacker.example" \
  -H "Access-Control-Request-Method: GET" \
  -H "x-forwarded-host: $HOST" 2>/dev/null | grep -i "access-control-allow-origin" || true)
if echo "$CORS" | grep -qi "evil-attacker"; then
  fail "CORS reflects arbitrary evil origin"
else
  pass "CORS blocks evil origin"
fi

# --- Swagger ---
SW=$(curl -s -o /dev/null -w "%{http_code}" "$API/docs" 2>/dev/null || echo "000")
if [ "$SW" = "200" ]; then
  if [ "${SWAGGER_ENABLED:-}" = "true" ] || [ "${NODE_ENV:-development}" != "production" ]; then
    warn "Swagger reachable (HTTP 200) — OK in dev if intentional"
  else
    fail "Swagger public in production mode"
  fi
else
  pass "Swagger not publicly reachable ($SW)"
fi

# --- Security headers ---
HDRS=$(curl -s -I "$API/health" 2>/dev/null | grep -iE "x-content-type-options|x-frame-options" | wc -l)
if [ "$HDRS" -gt 0 ]; then
  pass "Security headers present (helmet)"
else
  fail "Missing security headers"
fi

# --- Register + login ---
EMAIL="sec-$(date +%s)@test.local"
curl -s -X POST "$API/v1/auth/register" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-host: $HOST" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"ChangeMe123!\",\"full_name\":\"Sec Test\",\"date_of_birth\":\"1990-01-01\",\"county\":\"Nairobi\"}" >/dev/null

LOGIN=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-host: $HOST" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"ChangeMe123!\"}")
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  skip "Auth tests (login failed — tenant may be unavailable)"
else
  pass "Register + login works"

  # --- KYC URL endpoint removed ---
  KYC=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/v1/account/kyc" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "x-forwarded-host: $HOST" \
    -d '{"document_url":"http://169.254.169.254/"}')
  if [ "$KYC" = "404" ] || [ "$KYC" = "405" ]; then
    pass "KYC external URL endpoint removed ($KYC)"
  else
    fail "KYC external URL endpoint still accepts requests ($KYC)"
  fi

  # --- Order IDOR ---
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/v1/account/orders/00000000-0000-0000-0000-000000000099" \
    -H "Authorization: Bearer $TOKEN" \
    -H "x-forwarded-host: $HOST")
  [ "$CODE" = "404" ] && pass "Order IDOR blocked (404)" || fail "Order IDOR returned $CODE"

  # --- Mock payment on fake order ---
  M=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/v1/payments/harambe/complete" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "x-forwarded-host: $HOST" \
    -d '{"order_id":"00000000-0000-0000-0000-000000000001"}')
  if [ "${HARAMBE_PAYMENT_MODE:-mock}" = "mock" ]; then
    [ "$M" = "404" ] && pass "Mock complete on foreign order blocked" || warn "Mock complete returned $M"
  else
    [ "$M" = "404" ] && pass "Mock payment endpoint disabled in live mode" || fail "Mock payment allowed in live mode ($M)"
  fi
fi

# --- Invalid Bearer on cart ---
CART=$(curl -s -o /dev/null -w "%{http_code}" "$API/v1/cart" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.e30.invalid" \
  -H "x-forwarded-host: $HOST" \
  -H "x-cart-session: unsigned-session-id")
[ "$CART" = "401" ] && pass "Invalid Bearer on cart returns 401" || fail "Invalid Bearer on cart returned $CART"

# --- Signed cart session ---
CART1=$(curl -s "$API/v1/cart" -H "x-forwarded-host: $HOST" -H "x-cart-session: bad-session-12345678")
SID=$(echo "$CART1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session_id',''))" 2>/dev/null || echo "")
if echo "$SID" | grep -qE '^[0-9a-f-]+\.[0-9a-f]{16}$'; then
  pass "Cart session is HMAC-signed"
else
  fail "Cart session not signed (got: ${SID:0:40})"
fi

# --- Webhook without signature ---
ORDER="550e8400-e29b-41d4-a716-446655440000"
CB=$(curl -s -X POST "$API/v1/payments/gateway/callback" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-host: $HOST" \
  -d "{\"order_id\":\"$ORDER\",\"status\":\"completed\"}")
if echo "$CB" | grep -q "invalid_signature\|live_mode_disabled"; then
  pass "Gateway callback rejects unsigned/forged request"
else
  warn "Gateway callback response: $(echo "$CB" | head -c 100)"
fi

# --- HMAC webhook with valid signature (live mode only) ---
if [ "${HARAMBE_PAYMENT_MODE:-mock}" = "live" ] && [ -n "${HARAMBE_CALLBACK_SECRET:-}" ]; then
  BODY="{\"order_id\":\"$ORDER\",\"status\":\"completed\"}"
  TS=$(python3 -c "import time; print(int(time.time()*1000))")
  SIG=$(python3 -c "import hmac,hashlib,os; b=os.environ['BODY']; s=os.environ['SECRET']; print(hmac.new(s.encode(), b.encode(), hashlib.sha256).hexdigest())" BODY="$BODY" SECRET="${HARAMBE_CALLBACK_SECRET:-dev-callback-secret}")
  CB2=$(curl -s -X POST "$API/v1/payments/gateway/callback" \
    -H "Content-Type: application/json" \
    -H "x-forwarded-host: $HOST" \
    -H "x-gateway-signature: $SIG" \
    -H "x-gateway-timestamp: $TS" \
    -d "$BODY")
  if echo "$CB2" | grep -q "order_not_found\|no_pending_payment"; then
    pass "Valid HMAC accepted; order correctly rejected (not forged completion)"
  elif echo "$CB2" | grep -q "invalid_signature"; then
    fail "Valid HMAC rejected (signature verification bug)"
  else
    warn "HMAC callback: $(echo "$CB2" | head -c 80)"
  fi
else
  skip "HMAC live callback test (HARAMBE_PAYMENT_MODE not live)"
fi

# --- Public KYC path blocked ---
PUB=$(curl -s -o /dev/null -w "%{http_code}" "$API/v1/media/files/00000000-0000-0000-0000-000000000001/kyc/test.png")
[ "$PUB" = "404" ] && pass "Public KYC media path blocked" || fail "Public KYC path returned $PUB"

echo ""
echo "=========================================="
echo " RESULTS: PASS=$PASS  FAIL=$FAIL  WARN=$WARN  SKIP=$SKIP"
echo "=========================================="
[ "$FAIL" -eq 0 ]
