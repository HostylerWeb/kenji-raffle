import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../../../.env") });

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4002";

function signHs256(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

test("platform forgot-password then reset-password with JWT", async (t) => {
  const forgot = await fetch(`${API}/v1/platform/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@platform.local" }),
  });
  assert.ok(forgot.ok, `forgot-password ${forgot.status}`);
  const forgotBody = await forgot.json();
  assert.match(String(forgotBody.message ?? ""), /reset/i);

  const bad = await fetch(`${API}/v1/platform/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "not-a-token", password: "ChangeMe123!" }),
  });
  assert.equal(bad.ok, false);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    t.skip("JWT_SECRET not set");
    return;
  }

  const login = await fetch(`${API}/v1/platform/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@platform.local",
      password: "ChangeMe123!",
    }),
  });
  if (!login.ok) {
    t.skip("Cannot login as seed admin");
    return;
  }
  const session = await login.json();
  const userId = session.user?.id;
  if (!userId) {
    t.skip("Login did not return user id");
    return;
  }

  const token = signHs256(
    { sub: userId, purpose: "platform-password-reset" },
    secret,
  );

  const reset = await fetch(`${API}/v1/platform/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password: "ChangeMe123!" }),
  });
  const resetBody = await reset.json().catch(() => ({}));
  assert.ok(reset.ok, JSON.stringify(resetBody));
  assert.equal(resetBody.ok, true);
});
