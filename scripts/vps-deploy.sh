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
