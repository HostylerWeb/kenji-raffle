import { platformPrisma } from "./index";
import { migrateTenantForOperator } from "./migrate-operator-tenant";

export async function migrateAllTenantDatabases(): Promise<{
  migrated: number;
  errors: string[];
}> {
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
    include: { operator: true },
  });

  const errors: string[] = [];
  let migrated = 0;

  for (const db of databases) {
    try {
      await migrateTenantForOperator(db.operator_id);
      migrated++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${db.operator.slug}: ${message}`);
    }
  }

  return { migrated, errors };
}
