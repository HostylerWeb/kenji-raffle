#!/usr/bin/env bash
# Deploy Kenji-raffle to VPS — run from a machine with SSH access to the server.
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@152.239.119.54}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/Kenji-raffle}"
REPO="${REPO:-git@github.com:HostylerWeb/kenji-raffle.git}"

echo "=== Kenji Raffle VPS deploy ==="

ssh -o StrictHostKeyChecking=accept-new "$VPS_HOST" env DEPLOY_PATH="$DEPLOY_PATH" REPO="$REPO" bash -s <<'REMOTE'
set -euo pipefail

if [ ! -d "$DEPLOY_PATH/.git" ]; then
  mkdir -p "$(dirname "$DEPLOY_PATH")"
  git clone "$REPO" "$DEPLOY_PATH"
fi

cd "$DEPLOY_PATH"
git fetch origin
git checkout main
git pull origin main

if [ ! -f .env ]; then
  cp .env.example .env
  echo "WARNING: Created .env from example — configure production secrets before go-live."
fi

grep -q '^GRA_INTEGRATIONS_URL=' .env || \
  echo 'GRA_INTEGRATIONS_URL="https://console.force42.com/api/integrations/v1"' >> .env
sed -i 's|https://console.force42.com/integrations/v1|https://console.force42.com/api/integrations/v1|g' .env
grep -q '^KENJI_PLATFORM_CALLBACK_URL=' .env || \
  echo 'KENJI_PLATFORM_CALLBACK_URL="https://api.force42.com/v1/platform/integrations/gra/credentials"' >> .env

if grep -q 'change-me-platform-gra-integration-secret' .env 2>/dev/null || \
   ! grep -q '^PLATFORM_GRA_INTEGRATION_SECRET=' .env 2>/dev/null; then
  INTEGRATION_SECRET="$(openssl rand -hex 32)"
  if grep -q '^PLATFORM_GRA_INTEGRATION_SECRET=' .env; then
    sed -i "s|^PLATFORM_GRA_INTEGRATION_SECRET=.*|PLATFORM_GRA_INTEGRATION_SECRET=\"${INTEGRATION_SECRET}\"|" .env
  else
    echo "PLATFORM_GRA_INTEGRATION_SECRET=\"${INTEGRATION_SECRET}\"" >> .env
  fi
fi

# Keep GRA staff API in sync with the same integration secret.
GRA_ENV="/var/www/kenji-government/.env"
if [[ -f "$GRA_ENV" ]]; then
  KENJI_SECRET="$(grep '^PLATFORM_GRA_INTEGRATION_SECRET=' .env | cut -d= -f2- | tr -d '"')"
  if grep -q '^PLATFORM_GRA_INTEGRATION_SECRET=' "$GRA_ENV"; then
    sed -i "s|^PLATFORM_GRA_INTEGRATION_SECRET=.*|PLATFORM_GRA_INTEGRATION_SECRET=\"${KENJI_SECRET}\"|" "$GRA_ENV"
  else
    echo "PLATFORM_GRA_INTEGRATION_SECRET=\"${KENJI_SECRET}\"" >> "$GRA_ENV"
  fi
fi

npm ci
npm run generate -w @kenji-raffle/database-platform
npm run generate -w @kenji-raffle/database-tenant
npm run migrate:platform
npm run migrate:tenants || true
npm run build

pm2 restart raffle-api raffle-web raffle-platform raffle-worker 2>/dev/null || \
  pm2 start npm --name raffle-api -- run start -w @kenji-raffle/api

pm2 save
echo "Deploy complete."
REMOTE

echo "Done. Verify: https://demo.force42.com and https://api.force42.com/health"
