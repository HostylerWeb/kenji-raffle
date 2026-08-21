import { Client } from "pg";
import { requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "./index";

export async function destroyOperatorTenant(operatorId: string): Promise<void> {
  const adminUrl = requireEnv("DATABASE_ADMIN_URL");

  const operator = await platformPrisma.operators.findUnique({
    where: { id: operatorId },
    include: { tenant_database: true },
  });

  if (!operator) {
    throw new Error("Operator not found");
  }

  if (operator.status !== "archived") {
    throw new Error("Operator must be archived before hard delete");
  }

  const dbName = operator.tenant_database?.database_name;
  const dbUser = operator.tenant_database?.database_user;

  await platformPrisma.operators.delete({ where: { id: operatorId } });

  if (dbName) {
    const pg = new Client({ connectionString: adminUrl });
    await pg.connect();
    try {
      await pg.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [dbName],
      );
      await pg.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      if (dbUser) {
        await pg.query(`DROP USER IF EXISTS "${dbUser}"`);
      }
    } finally {
      await pg.end();
    }
  }
}
