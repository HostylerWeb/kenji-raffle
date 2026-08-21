import { test } from "node:test";
import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../../../.env") });

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4002";

async function login() {
  const res = await fetch(`${API}/v1/platform/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@platform.local",
      password: "ChangeMe123!",
    }),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }
  return res.json();
}

test("platform admin can create operator via API", async (t) => {
  const session = await login();
  const slug = `e2e-${Date.now().toString(36)}`;

  const createRes = await fetch(`${API}/v1/platform/operators`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      name: "E2E Test Operator",
      slug,
      gra_registry_id: `gra-${slug}`,
    }),
  });

  if (createRes.status === 0) {
    t.skip("API not reachable");
    return;
  }

  assert.ok(createRes.status === 200 || createRes.status === 201, await createRes.text());
  const operator = await createRes.json();
  assert.equal(operator.slug, slug);
  assert.ok(operator.id);

  const getRes = await fetch(`${API}/v1/platform/operators/${operator.id}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  assert.equal(getRes.status, 200);
  const detail = await getRes.json();
  assert.equal(detail.slug, slug);
});
