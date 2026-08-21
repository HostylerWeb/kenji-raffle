import { test } from "node:test";
import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { platformPrisma } from "@kenji-raffle/database-platform";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../../../.env") });

const API = process.env.API_URL ?? "http://localhost:4002";

function isSuccessStatus(status) {
  return status >= 200 && status < 300;
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  return { res, body };
}

test("purchase pipeline: cart → checkout → mock payment → tickets", async (t) => {
  const operators = await platformPrisma.operators.findMany({
    where: { status: "active" },
    include: { domains: { where: { is_primary: true }, take: 1 } },
    orderBy: { slug: "asc" },
    take: 1,
  });

  if (operators.length === 0) {
    t.skip("No active operators");
    await platformPrisma.$disconnect();
    return;
  }

  const op = operators[0];
  const host = op.domains[0]?.hostname ?? `${op.slug}.kenji-raffle.local`;
  const tenantHeaders = {
    "Content-Type": "application/json",
    "x-forwarded-host": host,
  };

  const adminLogin = await jsonFetch(`${API}/v1/admin/auth/login`, {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      email: `owner@${op.slug}.local`,
      password: "ChangeMe123!",
    }),
  });

  if (adminLogin.res.status === 0) {
    t.skip("API not reachable");
    await platformPrisma.$disconnect();
    return;
  }

  assert.ok(
    adminLogin.res.status === 200 || adminLogin.res.status === 201,
    JSON.stringify(adminLogin.body),
  );
  const adminToken = adminLogin.body.access_token;

  const slug = `e2e-${Date.now().toString(36)}`;
  const createRaffle = await jsonFetch(`${API}/v1/admin/raffles`, {
    method: "POST",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "E2E Purchase Raffle",
      slug,
      ticket_price: 10,
      max_entries: 50,
      min_tickets: 1,
    }),
  });
  assert.equal(createRaffle.res.status, 201, JSON.stringify(createRaffle.body));
  const raffleId = createRaffle.body.id;

  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await jsonFetch(`${API}/v1/admin/raffles/${raffleId}`, {
    method: "PATCH",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ end_date: endDate }),
  });

  const generateTickets = await jsonFetch(
    `${API}/v1/admin/raffles/${raffleId}/tickets/generate`,
    {
      method: "POST",
      headers: {
        ...tenantHeaders,
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({}),
    },
  );
  assert.ok(
    isSuccessStatus(generateTickets.res.status),
    JSON.stringify(generateTickets.body),
  );

  const publish = await jsonFetch(`${API}/v1/admin/raffles/${raffleId}/status`, {
    method: "PATCH",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "active" }),
  });
  assert.ok(isSuccessStatus(publish.res.status), JSON.stringify(publish.body));

  const playerEmail = `buyer-${Date.now()}@example.com`;
  const register = await jsonFetch(`${API}/v1/auth/register`, {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      email: playerEmail,
      password: "TestPass123!",
      full_name: "E2E Buyer",
      date_of_birth: "1990-01-01",
    }),
  });
  assert.ok(
    register.res.status === 200 || register.res.status === 201,
    JSON.stringify(register.body),
  );

  const login = await jsonFetch(`${API}/v1/auth/login`, {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      email: playerEmail,
      password: "TestPass123!",
    }),
  });
  assert.ok(
    login.res.status === 200 || login.res.status === 201,
    JSON.stringify(login.body),
  );
  const playerToken = login.body.access_token;
  const sessionId = randomUUID();

  const addCart = await jsonFetch(`${API}/v1/cart/items`, {
    method: "POST",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${playerToken}`,
      "x-cart-session": sessionId,
    },
    body: JSON.stringify({ raffle_id: raffleId, ticket_quantity: 2 }),
  });
  assert.ok(isSuccessStatus(addCart.res.status), JSON.stringify(addCart.body));

  const checkout = await jsonFetch(`${API}/v1/checkout`, {
    method: "POST",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${playerToken}`,
      "x-cart-session": sessionId,
    },
    body: JSON.stringify({}),
  });
  assert.ok(isSuccessStatus(checkout.res.status), JSON.stringify(checkout.body));
  const orderId = checkout.body.order_id;
  assert.ok(orderId);

  const pay = await jsonFetch(`${API}/v1/payments/harambe/complete`, {
    method: "POST",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${playerToken}`,
    },
    body: JSON.stringify({ order_id: orderId }),
  });
  assert.ok(isSuccessStatus(pay.res.status), JSON.stringify(pay.body));
  assert.equal(pay.body.status, "completed");

  const orders = await jsonFetch(`${API}/v1/account/orders`, {
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${playerToken}`,
    },
  });
  assert.equal(orders.res.status, 200);
  assert.ok(orders.body.items?.some((o) => o.id === orderId));

  await platformPrisma.$disconnect();
});

test("concurrent cart add cannot oversell single available ticket", async (t) => {
  const operators = await platformPrisma.operators.findMany({
    where: { status: "active" },
    include: { domains: { where: { is_primary: true }, take: 1 } },
    orderBy: { slug: "asc" },
    take: 1,
  });

  if (operators.length === 0) {
    t.skip("No active operators");
    await platformPrisma.$disconnect();
    return;
  }

  const op = operators[0];
  const host = op.domains[0]?.hostname ?? `${op.slug}.kenji-raffle.local`;
  const tenantHeaders = {
    "Content-Type": "application/json",
    "x-forwarded-host": host,
  };

  const adminLogin = await jsonFetch(`${API}/v1/admin/auth/login`, {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      email: `owner@${op.slug}.local`,
      password: "ChangeMe123!",
    }),
  });

  if (adminLogin.res.status === 0) {
    t.skip("API not reachable");
    await platformPrisma.$disconnect();
    return;
  }

  assert.ok(
    adminLogin.res.status === 200 || adminLogin.res.status === 201,
    JSON.stringify(adminLogin.body),
  );

  const adminToken = adminLogin.body.access_token;
  const slug = `race-${Date.now().toString(36)}`;

  const createRaffle = await jsonFetch(`${API}/v1/admin/raffles`, {
    method: "POST",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Race Raffle",
      slug,
      ticket_price: 5,
      max_entries: 1,
      min_tickets: 1,
    }),
  });
  assert.equal(createRaffle.res.status, 201);
  const raffleId = createRaffle.body.id;
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await jsonFetch(`${API}/v1/admin/raffles/${raffleId}`, {
    method: "PATCH",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ end_date: endDate }),
  });

  const generateTickets = await jsonFetch(
    `${API}/v1/admin/raffles/${raffleId}/tickets/generate`,
    {
      method: "POST",
      headers: {
        ...tenantHeaders,
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({}),
    },
  );
  assert.ok(isSuccessStatus(generateTickets.res.status));

  const publish = await jsonFetch(`${API}/v1/admin/raffles/${raffleId}/status`, {
    method: "PATCH",
    headers: {
      ...tenantHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "active" }),
  });
  assert.ok(isSuccessStatus(publish.res.status), JSON.stringify(publish.body));

  const sessionA = randomUUID();
  const sessionB = randomUUID();

  const [a, b] = await Promise.all([
    jsonFetch(`${API}/v1/cart/items`, {
      method: "POST",
      headers: { ...tenantHeaders, "x-cart-session": sessionA },
      body: JSON.stringify({ raffle_id: raffleId, ticket_quantity: 1 }),
    }),
    jsonFetch(`${API}/v1/cart/items`, {
      method: "POST",
      headers: { ...tenantHeaders, "x-cart-session": sessionB },
      body: JSON.stringify({ raffle_id: raffleId, ticket_quantity: 1 }),
    }),
  ]);

  const okCount = [a, b].filter((r) => isSuccessStatus(r.res.status)).length;
  assert.equal(okCount, 1, "only one cart add should succeed for 1 ticket");

  await platformPrisma.$disconnect();
});
