#!/usr/bin/env bash
# Immediately relay pending gra_outbound_events for the demo operator (platform worker logic).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OPERATOR_ID="${DEMO_OPERATOR_ID:-27734cf6-257f-46fd-88b7-2f2d70ae732c}"

node <<NODE
require("dotenv").config();
const { processGraOutboundForOperator } = require("./packages/shared/dist/gra-outbound.js");

processGraOutboundForOperator("${OPERATOR_ID}")
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
NODE

echo ""
echo "Queue status:"
python3 scripts/demo-gra-check.py
