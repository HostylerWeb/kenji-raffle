#!/usr/bin/env bash
# Refresh demo.force42.com tenant content after testing/draws deplete stock.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Seeding demo tenant (raffles, categories, legal, featured flags)..."
python3 scripts/seed-demo-tenant.py

if [[ "${1:-}" == "--with-draw" ]]; then
  echo "==> Running demo draw (requires sold tickets)..."
  python3 scripts/run-demo-draw.py
else
  echo ""
  echo "Tip: after mock purchases exist, populate /winners with:"
  echo "  python3 scripts/run-demo-draw.py"
  echo "  or: $0 --with-draw"
fi

if [[ "${CONFIGURE_GRA:-}" == "1" ]] || [[ "${2:-}" == "--gra" ]]; then
  echo "==> Configuring demo operator GRA credentials..."
  python3 scripts/configure-demo-gra.py
fi

echo ""
echo "Demo refresh complete. Verify: https://demo.force42.com/raffles"
