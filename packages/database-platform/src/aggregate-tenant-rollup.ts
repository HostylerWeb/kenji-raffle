import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";

export type TenantRollupMetrics = {
  gross_sales: number;
  tax_collected: number;
  orders_count: number;
  active_raffles: number;
  failed_gra_events: number;
};

function dayBoundsUtc(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function aggregateTenantRollupForDate(
  client: TenantPrismaClient,
  date: Date,
): Promise<TenantRollupMetrics> {
  const { start, end } = dayBoundsUtc(date);

  const completedOrders = await client.orders.aggregate({
    where: {
      status: "completed",
      created_at: { gte: start, lt: end },
    },
    _sum: { total: true },
    _count: true,
  });

  const payments = await client.payments.aggregate({
    where: {
      status: "completed",
      created_at: { gte: start, lt: end },
    },
    _sum: { tax_amount: true },
  });

  const activeRaffles = await client.raffles.count({
    where: { status: { in: ["listed", "active"] } },
  });

  const failedGra = await client.gra_outbound_events.count({
    where: {
      status: "failed",
      created_at: { gte: start, lt: end },
    },
  });

  return {
    gross_sales: Number(completedOrders._sum.total ?? 0),
    tax_collected: Number(payments._sum.tax_amount ?? 0),
    orders_count: completedOrders._count,
    active_raffles: activeRaffles,
    failed_gra_events: failedGra,
  };
}
