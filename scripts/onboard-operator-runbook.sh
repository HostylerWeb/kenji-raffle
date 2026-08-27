#!/usr/bin/env bash
# Generic first-operator onboarding runbook (no hardcoded demo tenant).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OPERATOR_SLUG="${OPERATOR_SLUG:-}"
OPERATOR_ID="${OPERATOR_ID:-}"
GRA_REGISTRY_ID="${GRA_REGISTRY_ID:-}"
GRA_API_KEY="${GRA_API_KEY:-}"
GRA_HMAC_SECRET="${GRA_HMAC_SECRET:-}"

usage() {
  cat <<EOF
Usage:
  OPERATOR_SLUG=mybrand GRA_REGISTRY_ID=op-mybrand \\
    GRA_API_KEY=... GRA_HMAC_SECRET=... \\
    bash scripts/onboard-operator-runbook.sh

Steps performed:
  1. Remind platform team to register operator in GRA console first
  2. Wait for tenant provisioning (if OPERATOR_ID or OPERATOR_SLUG set)
  3. Configure GRA keys + test connection
  4. Print customer handoff block

Create the operator in platform UI first:
  https://platform.force42.com/operators/new

Required env:
  OPERATOR_SLUG or OPERATOR_ID
  GRA_API_KEY, GRA_HMAC_SECRET (from GRA console for matching gra_registry_id)
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ -z "$OPERATOR_SLUG" && -z "$OPERATOR_ID" ]]; then
  echo "ERROR: set OPERATOR_SLUG or OPERATOR_ID" >&2
  usage
  exit 1
fi

echo "=== Kenji operator onboarding runbook ==="
echo
echo "Before continuing, ensure GRA registry exists:"
if [[ -n "$GRA_REGISTRY_ID" ]]; then
  echo "  external_id: $GRA_REGISTRY_ID"
else
  echo "  GRA console → Operators → register external_id (e.g. op-\${OPERATOR_SLUG:-<slug>})"
fi
echo "  GRA Settings → Operator API Credentials → generate key + HMAC"
echo "  Platform → New operator with matching gra_registry_id"
echo

WAIT_ARGS=()
if [[ -n "$OPERATOR_SLUG" ]]; then
  WAIT_ARGS+=(--slug "$OPERATOR_SLUG")
fi
if [[ -n "$OPERATOR_ID" ]]; then
  WAIT_ARGS+=(--operator-id "$OPERATOR_ID")
fi

echo "--- Waiting for provisioning ---"
PROVISION_JSON="$(python3 scripts/wait-for-provision.py "${WAIT_ARGS[@]}")"
echo "$PROVISION_JSON"
OPERATOR_ID="$(python3 -c 'import json,sys; print(json.loads(sys.stdin.read())["operator_id"])' <<<"$PROVISION_JSON")"
HOSTNAME="$(python3 -c 'import json,sys; print(json.loads(sys.stdin.read())["hostname"])' <<<"$PROVISION_JSON")"

if [[ -z "$GRA_API_KEY" || -z "$GRA_HMAC_SECRET" ]]; then
  echo
  echo "WARNING: GRA_API_KEY / GRA_HMAC_SECRET not set — skipping configure-operator-gra.py"
else
  echo
  echo "--- Configuring GRA credentials ---"
  GRA_ARGS=(--operator-id "$OPERATOR_ID" --gra-api-key "$GRA_API_KEY" --gra-hmac-secret "$GRA_HMAC_SECRET")
  python3 scripts/configure-operator-gra.py "${GRA_ARGS[@]}"
fi

SLUG="${OPERATOR_SLUG:-$(python3 -c 'import json,sys; import urllib.request; print("unknown")')}"
if [[ -z "$OPERATOR_SLUG" ]]; then
  SLUG="$(python3 - <<PY
import json, os, urllib.request
api = os.environ.get("KENJI_API_URL", "https://api.force42.com")
host = os.environ.get("PLATFORM_HOST", "platform.force42.com")
email = os.environ.get("PLATFORM_EMAIL", "admin@platform.local")
password = os.environ.get("PLATFORM_PASSWORD", "ChangeMe123!")
import json as j
req = urllib.request.Request(
    f"{api}/v1/platform/auth/login",
    data=j.dumps({"email": email, "password": password}).encode(),
    headers={"Content-Type": "application/json", "x-forwarded-host": host},
    method="POST",
)
with urllib.request.urlopen(req) as resp:
    token = j.loads(resp.read())["access_token"]
req2 = urllib.request.Request(
    f"{api}/v1/platform/operators/{os.environ['OPERATOR_ID']}",
    headers={"Authorization": f"Bearer {token}", "x-forwarded-host": host},
)
with urllib.request.urlopen(req2) as resp:
    print(j.loads(resp.read())["slug"])
PY
)"
fi

echo
echo "=== Customer handoff (copy to operator) ==="
cat <<HANDOFF
Operator slug: ${SLUG}
Staging site: https://${HOSTNAME}
Admin: https://${HOSTNAME}/admin
Owner login: owner@${SLUG}.local
Temporary password: ChangeMe123!

First steps: change password, upload logo in Settings, create raffles.
Custom domain: Admin → Domains → CNAME to customers.force42.com at your Cloudflare.
Live checkout: requires kenji-gateway on pay.force42.com (see gap-scan-first-operator.sh).
HANDOFF

echo
echo "Run gap scan before manual test:"
echo "  bash scripts/gap-scan-first-operator.sh"
