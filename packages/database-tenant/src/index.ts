import { PrismaClient } from "../generated/tenant-client";

export type TenantPrismaClient = PrismaClient;

export function createTenantPrismaClient(databaseUrl: string): TenantPrismaClient {
  return new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export * from "../generated/tenant-client";
export { TENANT_SCHEMA_VERSION } from "./schema-version";
