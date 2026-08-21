import { test } from "node:test";
import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { platformPrisma } from "@kenji-raffle/database-platform";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../../../.env") });

const API = process.env.API_URL ?? "http://localhost:4002";

test("operator staff token rejected on another tenant hostname", async () => {
  const operators = await platformPrisma.operators.findMany({
    where: { status: "active" },
    include: { domains: { where: { is_primary: true }, take: 1 } },
    take: 2,
  });

  if (operators.length < 2) {
    console.log("Skipping — need 2 active operators for cross-tenant test");
    await platformPrisma.$disconnect();
    return;
  }

  const [opA, opB] = operators;
  const hostA = opA.domains[0]?.hostname ?? `${opA.slug}.kenji-raffle.local`;
  const hostB = opB.domains[0]?.hostname ?? `${opB.slug}.kenji-raffle.local`;

  const loginRes = await fetch(`${API}/v1/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-host": hostA,
    },
    body: JSON.stringify({
      email: `owner@${opA.slug}.local`,
      password: "ChangeMe123!",
    }),
  });

  assert.ok(
    loginRes.status === 200 || loginRes.status === 201,
    "login on operator A should succeed",
  );
  const { access_token } = await loginRes.json();

  const crossRes = await fetch(`${API}/v1/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "x-forwarded-host": hostB,
    },
  });

  assert.equal(
    crossRes.status,
    403,
    "operator A token must be rejected on operator B hostname",
  );

  await platformPrisma.$disconnect();
});
