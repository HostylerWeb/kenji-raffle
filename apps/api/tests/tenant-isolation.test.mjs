import { test } from "node:test";
import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../../../.env") });

test("tenant databases are isolated", async () => {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const operators = await platformPrisma.operators.findMany({
    where: { status: "active" },
    include: { tenant_database: true },
    take: 2,
  });

  if (operators.length < 2) {
    console.log("Skipping isolation test — need 2 provisioned tenants");
    return;
  }

  const urls = operators.map((op) => {
    const record = op.tenant_database;
    if (!record) throw new Error(`Missing tenant database for ${op.slug}`);
    return decryptSecret(record.connection_url_encrypted, encryptionKey);
  });

  const clients = urls.map((url) => createTenantPrismaClient(url));
  const counts = await Promise.all(
    clients.map((client) => client.operator_staff.count()),
  );

  const crossCounts = await Promise.all(
    clients.map((client, i) =>
      client.operator_staff.count({
        where: { email: `owner@${operators[(i + 1) % 2].slug}.local` },
      }),
    ),
  );

  for (const cross of crossCounts) {
    assert.equal(cross, 0);
  }

  assert.ok(counts.every((c) => c >= 1));

  await Promise.all(clients.map((c) => c.$disconnect()));
  await platformPrisma.$disconnect();
});
