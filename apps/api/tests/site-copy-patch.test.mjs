import { test } from "node:test";
import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { platformPrisma } from "@kenji-raffle/database-platform";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../../../.env") });

const API = process.env.API_URL ?? "http://localhost:4002";

test("PATCH /v1/admin/site-copy validates allowlist and persists overrides", async () => {
  const operator = await platformPrisma.operators.findFirst({
    where: { status: "active" },
    include: { domains: { where: { is_primary: true }, take: 1 } },
  });

  if (!operator) {
    console.log("Skipping — no active operator");
    await platformPrisma.$disconnect();
    return;
  }

  const host = operator.domains[0]?.hostname ?? `${operator.slug}.kenji-raffle.local`;

  const loginRes = await fetch(`${API}/v1/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-host": host,
    },
    body: JSON.stringify({
      email: `owner@${operator.slug}.local`,
      password: "ChangeMe123!",
    }),
  });

  assert.ok(loginRes.ok, "operator login should succeed");
  const { access_token } = await loginRes.json();

  const customHeadline = `Custom headline ${Date.now()}`;
  const patchRes = await fetch(`${API}/v1/admin/site-copy`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
      "x-forwarded-host": host,
    },
    body: JSON.stringify({
      updates: {
        "home.hero.headline": customHeadline,
        "not.a.real.key": "ignored",
      },
    }),
  });

  assert.equal(patchRes.status, 200, "site-copy patch should succeed");
  const patchBody = await patchRes.json();
  assert.equal(patchBody.site_copy["home.hero.headline"], customHeadline);
  assert.equal(patchBody.site_copy["not.a.real.key"], undefined);

  const contextRes = await fetch(`${API}/v1/tenant/context`, {
    headers: { "x-forwarded-host": host },
  });
  assert.ok(contextRes.ok);
  const context = await contextRes.json();
  assert.equal(context.content.copy["home.hero.headline"], customHeadline);

  const resetRes = await fetch(`${API}/v1/admin/site-copy`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
      "x-forwarded-host": host,
    },
    body: JSON.stringify({
      updates: { "home.hero.headline": null },
    }),
  });
  assert.equal(resetRes.status, 200);
  const resetBody = await resetRes.json();
  assert.equal(resetBody.site_copy["home.hero.headline"], undefined);

  await platformPrisma.$disconnect();
});

test("PATCH /v1/admin/site-copy requires owner or manager role", async () => {
  const operator = await platformPrisma.operators.findFirst({
    where: { status: "active" },
    include: { domains: { where: { is_primary: true }, take: 1 } },
  });

  if (!operator) {
    console.log("Skipping — no active operator");
    await platformPrisma.$disconnect();
    return;
  }

  const host = operator.domains[0]?.hostname ?? `${operator.slug}.kenji-raffle.local`;

  const unauthRes = await fetch(`${API}/v1/admin/site-copy`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-host": host,
    },
    body: JSON.stringify({ updates: { "home.hero.kicker": "Nope" } }),
  });

  assert.equal(unauthRes.status, 401);

  await platformPrisma.$disconnect();
});
