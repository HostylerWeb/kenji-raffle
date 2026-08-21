import { PrismaClient } from "../generated/platform-client";

const globalForPrisma = globalThis as unknown as {
  platformPrisma: PrismaClient;
};

export const platformPrisma =
  globalForPrisma.platformPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.platformPrisma = platformPrisma;
}

export * from "../generated/platform-client";
export {
  provisionTenantForOperator,
  type ProvisionTenantResult,
} from "./provision-tenant";
export {
  aggregateTenantRollupForDate,
  type TenantRollupMetrics,
} from "./aggregate-tenant-rollup";
export { runRollupsForAllActiveOperators } from "./run-all-tenant-rollups";
export { runRollupForOperator } from "./run-operator-rollup";
export { migrateTenantForOperator } from "./migrate-operator-tenant";
export { migrateAllTenantDatabases } from "./migrate-all-tenants";
export { destroyOperatorTenant } from "./destroy-operator-tenant";
export { verifyDomainRecord, verifyCustomDomainDns } from "./verify-domain-dns";
export {
  PLATFORM_WORKER_HEARTBEAT_KEY,
  PLATFORM_LAST_ROLLUP_KEY,
  PLATFORM_LAST_PROVISION_KEY,
} from "./platform-redis-keys";
