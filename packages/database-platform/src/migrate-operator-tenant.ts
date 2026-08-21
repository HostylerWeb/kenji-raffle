import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { TENANT_SCHEMA_VERSION } from "./tenant-schema-version";
import { platformPrisma } from "./index";

export async function migrateTenantForOperator(operatorId: string): Promise<{
  operator_id: string;
  slug: string;
  schema_version: string;
}> {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const operator = await platformPrisma.operators.findUnique({
    where: { id: operatorId },
    include: { tenant_database: true },
  });

  if (!operator?.tenant_database) {
    throw new Error(`No tenant database for operator ${operatorId}`);
  }

  if (operator.tenant_database.status !== "active") {
    throw new Error("Tenant database is not active");
  }

  const url = decryptSecret(
    operator.tenant_database.connection_url_encrypted,
    encryptionKey,
  );

  execSync("npm run migrate:deploy -w @kenji-raffle/database-tenant", {
    env: { ...process.env, TENANT_DATABASE_URL: url },
    stdio: "pipe",
    cwd: resolve(__dirname, "../../.."),
  });

  await platformPrisma.tenant_databases.update({
    where: { operator_id: operatorId },
    data: { schema_version: TENANT_SCHEMA_VERSION },
  });

  return {
    operator_id: operatorId,
    slug: operator.slug,
    schema_version: TENANT_SCHEMA_VERSION,
  };
}
