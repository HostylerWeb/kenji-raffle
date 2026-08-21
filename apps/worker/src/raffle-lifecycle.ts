import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";

export async function transitionEndedRafflesForAllTenants() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
  });

  const now = new Date();
  let activated = 0;
  let ended = 0;

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);

    try {
      const startResult = await client.raffles.updateMany({
        where: {
          status: "listed",
          start_date: { lte: now },
          OR: [{ end_date: null }, { end_date: { gt: now } }],
        },
        data: { status: "active" },
      });
      activated += startResult.count;

      const endResult = await client.raffles.updateMany({
        where: {
          status: "active",
          end_date: { lte: now },
        },
        data: { status: "to_be_drawn" },
      });
      ended += endResult.count;
    } finally {
      await client.$disconnect();
    }
  }

  return { activated, ended, updated: ended };
}
