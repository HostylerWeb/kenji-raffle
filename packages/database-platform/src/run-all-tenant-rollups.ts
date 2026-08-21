import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { platformPrisma } from "./index";
import { aggregateTenantRollupForDate } from "./aggregate-tenant-rollup";

export async function runRollupsForAllActiveOperators(
  forDate = new Date(),
): Promise<{ operators_processed: number; errors: string[] }> {
  const day = new Date(forDate);
  day.setUTCHours(0, 0, 0, 0);

  const operators = await platformPrisma.operators.findMany({
    where: { status: "active" },
    include: { tenant_database: true },
  });

  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const errors: string[] = [];
  let processed = 0;

  for (const operator of operators) {
    const db = operator.tenant_database;
    if (!db || db.status !== "active") continue;

    try {
      const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
      const client = createTenantPrismaClient(url);
      const metrics = await aggregateTenantRollupForDate(client, day);
      await client.$disconnect();

      await platformPrisma.tenant_daily_rollups.upsert({
        where: {
          operator_id_date: { operator_id: operator.id, date: day },
        },
        update: {
          gross_sales: metrics.gross_sales,
          tax_collected: metrics.tax_collected,
          orders_count: metrics.orders_count,
          active_raffles: metrics.active_raffles,
          failed_gra_events: metrics.failed_gra_events,
        },
        create: {
          operator_id: operator.id,
          date: day,
          gross_sales: metrics.gross_sales,
          tax_collected: metrics.tax_collected,
          orders_count: metrics.orders_count,
          active_raffles: metrics.active_raffles,
          failed_gra_events: metrics.failed_gra_events,
        },
      });
      processed += 1;
    } catch (err) {
      errors.push(
        `${operator.slug}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { operators_processed: processed, errors };
}
