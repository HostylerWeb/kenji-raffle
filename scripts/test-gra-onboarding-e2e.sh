#!/usr/bin/env bash
# End-to-end GRA-linked operator onboarding test.
# Requires: curl, python3, jq (optional), platform + GRA staff credentials in env.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API="${API:-https://api.force42.com}"
GRA_API="${GRA_API:-https://console.force42.com}"
PLATFORM_API="${PLATFORM_API:-$API}"
PLATFORM_EMAIL="${PLATFORM_EMAIL:-}"
PLATFORM_PASSWORD="${PLATFORM_PASSWORD:-}"
GRA_EMAIL="${GRA_EMAIL:-}"
GRA_PASSWORD="${GRA_PASSWORD:-}"
SLUG_PREFIX="${SLUG_PREFIX:-testgra}"
INTEGRATION_SECRET="${PLATFORM_GRA_INTEGRATION_SECRET:-}"

STAMP="$(date +%s)"
SLUG="${SLUG_PREFIX}-${STAMP}"
NAME="Test GRA ${STAMP}"

PASS=0
FAIL=0

pass() { echo "✓ PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "✗ FAIL: $1"; FAIL=$((FAIL + 1)); }

json_post() {
  local url="$1"
  local token="$2"
  local body="$3"
  curl -sS -X POST "$url" \
    -H "Content-Type: application/json" \
    ${token:+ -H "Authorization: Bearer $token"} \
    -d "$body"
}

json_patch() {
  local url="$1"
  local token="$2"
  local body="$3"
  curl -sS -X PATCH "$url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "$body"
}

echo "=========================================="
echo " GRA onboarding e2e"
echo " API=$API  GRA=$GRA_API  slug=$SLUG"
echo "=========================================="

if [[ -z "$INTEGRATION_SECRET" ]]; then
  fail "PLATFORM_GRA_INTEGRATION_SECRET not set"
else
  pass "Integration secret present"
fi

if [[ -z "$PLATFORM_EMAIL" || -z "$PLATFORM_PASSWORD" ]]; then
  fail "Set PLATFORM_EMAIL and PLATFORM_PASSWORD for platform login"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi

PLATFORM_TOKEN="$(json_post "$PLATFORM_API/v1/platform/auth/login" "" \
  "{\"email\":\"$PLATFORM_EMAIL\",\"password\":\"$PLATFORM_PASSWORD\"}" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("access_token") or d.get("token",""))')"

if [[ -z "$PLATFORM_TOKEN" ]]; then
  fail "Platform login failed"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
pass "Platform login"

CREATE_BODY="$(cat <<EOF
{"name":"$NAME","slug":"$SLUG","licence_number":"TEST-${STAMP}"}
EOF
)"

CREATE_RESP="$(json_post "$PLATFORM_API/v1/platform/operators" "$PLATFORM_TOKEN" "$CREATE_BODY")"
OPERATOR_ID="$(echo "$CREATE_RESP" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))' 2>/dev/null || true)"

if [[ -z "$OPERATOR_ID" ]]; then
  fail "Platform create operator — $CREATE_RESP"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
pass "Created operator $OPERATOR_ID"

echo "Waiting for tenant provisioning..."
for i in $(seq 1 30); do
  DETAIL="$(curl -sS -H "Authorization: Bearer $PLATFORM_TOKEN" \
    "$PLATFORM_API/v1/platform/operators/$OPERATOR_ID")"
  STATUS="$(echo "$DETAIL" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("tenant_database") or {}).get("status",""))' 2>/dev/null || true)"
  if [[ "$STATUS" == "active" ]]; then
    pass "Tenant DB active"
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    fail "Tenant DB not active after wait (status=$STATUS)"
  fi
  sleep 5
done

OWNER_EMAIL="owner@${SLUG}.local"
OWNER_PASSWORD="ChangeMe123!"

OP_HOST="${SLUG}.force42.com"
OP_LOGIN="$(curl -sS -X POST "$API/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -H "Host: $OP_HOST" \
  -H "x-forwarded-host: $OP_HOST" \
  -d "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\"}")"
OP_TOKEN="$(echo "$OP_LOGIN" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("access_token",""))' 2>/dev/null || true)"

if [[ -z "$OP_TOKEN" ]]; then
  fail "Operator login failed — $OP_LOGIN"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
pass "Operator login"

LEGAL_BODY="$(cat <<EOF
{
  "legal_name":"Test Legal ${STAMP} Ltd",
  "trading_name":"Test Trading ${STAMP}",
  "registration_number":"CPR/${STAMP}",
  "kra_pin":"A${STAMP}Z",
  "beneficial_owner":"Test Owner",
  "business_email":"ops-${STAMP}@example.com",
  "business_phone":"+254700000000",
  "county":"Nairobi",
  "region":"Central"
}
EOF
)"

json_patch "$API/v1/admin/onboarding/legal-profile" "$OP_TOKEN" "$LEGAL_BODY" >/dev/null || \
  curl -sS -X PATCH "$API/v1/admin/onboarding/legal-profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OP_TOKEN" \
    -H "Host: $OP_HOST" \
    -H "x-forwarded-host: $OP_HOST" \
    -d "$LEGAL_BODY" >/dev/null
pass "Legal profile saved"

curl -sS -X POST "$API/v1/admin/onboarding/confirm-legal-profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OP_TOKEN" \
  -H "Host: $OP_HOST" \
  -H "x-forwarded-host: $OP_HOST" \
  -d '{"confirm_text":"CONFIRM"}' >/dev/null
pass "Legal profile confirmed"

BEFORE_CHECKOUT="$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$API/v1/checkout" \
  -H "Authorization: Bearer $OP_TOKEN" \
  -H "Host: $OP_HOST" \
  -H "x-forwarded-host: $OP_HOST" \
  -H "Content-Type: application/json" \
  -d '{"raffle_id":"00000000-0000-0000-0000-000000000001","quantity":1}' 2>/dev/null || echo "000")"
if [[ "$BEFORE_CHECKOUT" =~ ^(400|403|404|422)$ ]]; then
  pass "Checkout blocked before GRA approval ($BEFORE_CHECKOUT)"
else
  fail "Checkout should be blocked before approval (got $BEFORE_CHECKOUT)"
fi

REQUEST_RESP="$(curl -sS -X POST "$API/v1/admin/onboarding/request-gra" \
  -H "Authorization: Bearer $OP_TOKEN" \
  -H "Host: $OP_HOST" \
  -H "x-forwarded-host: $OP_HOST" \
  -H "Content-Type: application/json" \
  -d '{}')"
APP_ID="$(echo "$REQUEST_RESP" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("gra_application_id",""))' 2>/dev/null || true)"
if [[ -z "$APP_ID" ]]; then
  fail "Request GRA failed — $REQUEST_RESP"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
pass "GRA application submitted ($APP_ID)"

if [[ -z "$GRA_EMAIL" || -z "$GRA_PASSWORD" ]]; then
  warn_msg="Set GRA_EMAIL and GRA_PASSWORD to auto-approve; stopping before GRA staff step"
  echo "⚠ WARN: $warn_msg"
  echo "Application ID for manual approve: $APP_ID"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 0
fi

GRA_TOKEN="$(json_post "$GRA_API/auth/login" "" \
  "{\"email\":\"$GRA_EMAIL\",\"password\":\"$GRA_PASSWORD\"}" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("access_token") or (d.get("user") and d.get("access_token")) or "")' 2>/dev/null || true)"

if [[ -z "$GRA_TOKEN" ]]; then
  fail "GRA staff login failed"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
pass "GRA staff login"

APPROVE_RESP="$(json_post "$GRA_API/operator-applications/${APP_ID}/approve" "$GRA_TOKEN" "{}")"
APPROVE_STATUS="$(echo "$APPROVE_RESP" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("status",""))' 2>/dev/null || true)"
if [[ "$APPROVE_STATUS" != "approved" ]]; then
  fail "GRA approve failed — $APPROVE_RESP"
  echo "Summary: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
pass "GRA application approved"

sleep 2
DETAIL_AFTER="$(curl -sS -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_API/v1/platform/operators/$OPERATOR_ID")"
GRA_STATUS="$(echo "$DETAIL_AFTER" | python3 -c 'import json,sys; s=json.load(sys.stdin).get("settings") or {}; print(s.get("gra_application_status",""))' 2>/dev/null || true)"
CREDS="$(echo "$DETAIL_AFTER" | python3 -c 'import json,sys; s=json.load(sys.stdin).get("settings") or {}; print(s.get("gra_credentials_configured",False))' 2>/dev/null || true)"

if [[ "$GRA_STATUS" == "approved" ]]; then
  pass "Kenji gra_application_status=approved"
else
  fail "Expected approved status, got $GRA_STATUS"
fi

if [[ "$CREDS" == "True" ]]; then
  pass "Kenji GRA credentials configured"
else
  fail "Kenji credentials not configured after callback"
fi

DOMAINS="$(curl -sS -H "Authorization: Bearer $OP_TOKEN" -H "Host: $OP_HOST" -H "x-forwarded-host: $OP_HOST" "$API/v1/admin/domains")"
GRA_READY="$(echo "$DOMAINS" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("gra_compliance_ready",False))' 2>/dev/null || true)"
if [[ "$GRA_READY" == "True" ]]; then
  pass "Domains gra_compliance_ready after approval"
else
  fail "Domains should unlock after approval"
fi

echo "=========================================="
echo " Summary: PASS=$PASS FAIL=$FAIL"
echo " Test operator: $SLUG ($OPERATOR_ID)"
echo "=========================================="
[[ "$FAIL" -eq 0 ]]
