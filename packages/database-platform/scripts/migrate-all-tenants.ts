import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { execSync } from "node:child_process";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "../src/index";

loadEnv({ path: resolve(__dirname, "../../../.env") });

async function main() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
    include: { operator: true },
  });

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    console.log(`Migrating ${db.operator.slug} (${db.database_name})...`);
    execSync("npm run migrate:deploy -w @kenji-raffle/database-tenant", {
      env: { ...process.env, TENANT_DATABASE_URL: url },
      stdio: "inherit",
      cwd: resolve(__dirname, "../../.."),
    });
  }

  console.log(`Migrated ${databases.length} tenant database(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await platformPrisma.$disconnect();
  });
