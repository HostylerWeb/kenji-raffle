import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";

export async function releaseExpiredCartsForAllTenants() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
    include: { operator: true },
  });

  let totalReleased = 0;

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);
    const now = new Date();

    const result = await client.tickets.updateMany({
      where: {
        status: "reserved",
        reserved_until: { lt: now },
      },
      data: {
        status: "available",
        session_id: null,
        user_id: null,
        reserved_until: null,
      },
    });

    await client.cart_items.deleteMany({
      where: { expires_at: { lt: now } },
    });

    totalReleased += result.count;
    await client.$disconnect();
  }

  return totalReleased;
}
