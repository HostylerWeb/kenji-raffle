import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { execSync } from "node:child_process";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "../src/index";

loadEnv({ path: resolve(__dirname, "../../../.env") });

async function main() {
  const slug = process.argv.find((a, i) => process.argv[i - 1] === "--slug");
  if (!slug) {
    throw new Error("Usage: migrate:tenant -- --slug <slug>");
  }

  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const operator = await platformPrisma.operators.findUnique({
    where: { slug },
    include: { tenant_database: true },
  });
  if (!operator?.tenant_database) {
    throw new Error(`No tenant database for slug: ${slug}`);
  }

  const url = decryptSecret(
    operator.tenant_database.connection_url_encrypted,
    encryptionKey,
  );

  execSync("npm run migrate:deploy -w @kenji-raffle/database-tenant", {
    env: { ...process.env, TENANT_DATABASE_URL: url },
    stdio: "inherit",
    cwd: resolve(__dirname, "../../.."),
  });

  console.log(`Migrated tenant: ${slug}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await platformPrisma.$disconnect();
  });
