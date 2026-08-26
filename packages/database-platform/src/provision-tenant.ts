import { Client } from "pg";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import {
  encryptSecret,
  requireEnv,
  slugifyDatabaseName,
} from "@kenji-raffle/shared";
import { TENANT_SCHEMA_VERSION } from "./tenant-schema-version";
import { platformPrisma } from "./index";

export type ProvisionTenantResult = {
  operatorId: string;
  databaseName: string;
  hostname: string;
  ownerEmail: string;
};

export async function provisionTenantForOperator(
  operatorId: string,
): Promise<ProvisionTenantResult> {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const adminUrl = requireEnv("DATABASE_ADMIN_URL");
  const host = process.env.TENANT_DATABASE_HOST ?? "localhost";
  const port = Number(process.env.TENANT_DATABASE_PORT ?? "5437");
  const baseDomain =
    process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ?? "kenji-raffle.local";

  const operator = await platformPrisma.operators.findUnique({
    where: { id: operatorId },
    include: { tenant_database: true },
  });

  if (!operator) {
    throw new Error(`Operator not found: ${operatorId}`);
  }

  if (operator.tenant_database?.status === "active") {
    const hostname =
      (
        await platformPrisma.operator_domains.findFirst({
          where: { operator_id: operatorId, is_primary: true },
        })
      )?.hostname ?? `${operator.slug}.${baseDomain}`;

    return {
      operatorId: operator.id,
      databaseName: operator.tenant_database.database_name,
      hostname,
      ownerEmail: `owner@${operator.slug}.local`,
    };
  }

  const slug = operator.slug;
  const databaseName = slugifyDatabaseName(slug);
  const dbUser = `tenant_${slug.replace(/[^a-z0-9_]/gi, "_").toLowerCase()}`;
  const dbPassword = randomBytes(24).toString("base64url");
  const connectionUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${host}:${port}/${databaseName}?schema=public`;

  await platformPrisma.tenant_databases.upsert({
    where: { operator_id: operator.id },
    update: {
      database_name: databaseName,
      database_host: host,
      database_port: port,
      database_user: dbUser,
      database_password_encrypted: encryptSecret(dbPassword, encryptionKey),
      connection_url_encrypted: encryptSecret(connectionUrl, encryptionKey),
      status: "provisioning",
      provision_error: null,
    },
    create: {
      operator_id: operator.id,
      database_name: databaseName,
      database_host: host,
      database_port: port,
      database_user: dbUser,
      database_password_encrypted: encryptSecret(dbPassword, encryptionKey),
      connection_url_encrypted: encryptSecret(connectionUrl, encryptionKey),
      status: "provisioning",
    },
  });

  try {
    const pg = new Client({ connectionString: adminUrl });
    await pg.connect();

    const existingDb = await pg.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName],
    );

    if (existingDb.rowCount === 0) {
      await pg.query(`CREATE DATABASE "${databaseName}"`);
    }

    await pg.query(
      `DO $$ BEGIN CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword.replace(/'/g, "''")}'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    );
    await pg.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${databaseName}" TO "${dbUser}"`,
    );

    const tenantPg = new Client({
      connectionString: adminUrl.replace(/\/[^/]+(\?|$)/, `/${databaseName}$1`),
    });
    await tenantPg.connect();
    await tenantPg.query(`GRANT ALL ON SCHEMA public TO "${dbUser}"`);
    await tenantPg.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${dbUser}"`,
    );
    await tenantPg.end();
    await pg.end();

    const monorepoRoot = resolve(__dirname, "../../..");
    execSync("npm run migrate:deploy -w @kenji-raffle/database-tenant", {
      env: { ...process.env, TENANT_DATABASE_URL: connectionUrl },
      stdio: "inherit",
      cwd: monorepoRoot,
    });

    const hostname = `${slug}.${baseDomain}`;

    await platformPrisma.operator_domains.upsert({
      where: { hostname },
      update: {
        verification_status: "verified",
        ssl_status: "active",
        is_primary: true,
      },
      create: {
        operator_id: operator.id,
        hostname,
        domain_type: "subdomain",
        verification_status: "verified",
        ssl_status: "active",
        is_primary: true,
      },
    });

    await platformPrisma.operator_settings.upsert({
      where: { operator_id: operator.id },
      update: {},
      create: {
        operator_id: operator.id,
        primary_color: "#00a551",
        support_email: `support@${slug}.local`,
        gra_application_status: "not_started",
        feature_flags: { checkout_enabled: false },
      },
    });

    const tenantClient = new Client({ connectionString: connectionUrl });
    await tenantClient.connect();
    const ownerEmail = `owner@${slug}.local`;
    const ownerHash = await bcrypt.hash("ChangeMe123!", 12);
    await tenantClient.query(
      `INSERT INTO operator_staff (id, email, password_hash, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'owner', NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [ownerEmail, ownerHash],
    );
    await tenantClient.end();

    await platformPrisma.tenant_databases.update({
      where: { operator_id: operator.id },
      data: {
        status: "active",
        provisioned_at: new Date(),
        provision_error: null,
        schema_version: TENANT_SCHEMA_VERSION,
      },
    });

    await platformPrisma.operators.update({
      where: { id: operator.id },
      data: { status: "active" },
    });

    return {
      operatorId: operator.id,
      databaseName,
      hostname,
      ownerEmail,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tenant provisioning failed";
    await platformPrisma.tenant_databases.updateMany({
      where: { operator_id: operator.id },
      data: { status: "failed", provision_error: message },
    });
    await platformPrisma.operators.update({
      where: { id: operator.id },
      data: { status: "onboarding_failed" },
    });
    throw error;
  }
}
