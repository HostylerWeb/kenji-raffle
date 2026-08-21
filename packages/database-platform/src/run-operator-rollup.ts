import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { platformPrisma } from "./index";
import { aggregateTenantRollupForDate } from "./aggregate-tenant-rollup";

export async function runRollupForOperator(
  operatorId: string,
  forDate = new Date(),
): Promise<void> {
  const day = new Date(forDate);
  day.setUTCHours(0, 0, 0, 0);

  const operator = await platformPrisma.operators.findUnique({
    where: { id: operatorId },
    include: { tenant_database: true },
  });

  if (!operator?.tenant_database || operator.tenant_database.status !== "active") {
    return;
  }

  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const url = decryptSecret(
    operator.tenant_database.connection_url_encrypted,
    encryptionKey,
  );
  const client = createTenantPrismaClient(url);
  const metrics = await aggregateTenantRollupForDate(client, day);
  await client.$disconnect();

  await platformPrisma.tenant_daily_rollups.upsert({
    where: {
      operator_id_date: { operator_id: operatorId, date: day },
    },
    update: {
      gross_sales: metrics.gross_sales,
      tax_collected: metrics.tax_collected,
      orders_count: metrics.orders_count,
      active_raffles: metrics.active_raffles,
      failed_gra_events: metrics.failed_gra_events,
    },
    create: {
      operator_id: operatorId,
      date: day,
      gross_sales: metrics.gross_sales,
      tax_collected: metrics.tax_collected,
      orders_count: metrics.orders_count,
      active_raffles: metrics.active_raffles,
      failed_gra_events: metrics.failed_gra_events,
    },
  });
}
