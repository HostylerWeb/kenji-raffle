import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";
import { enqueueProcessGraOutbound } from "./enqueue-gra-outbound";

export async function runMonthlyGraExportForAllTenants() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
  });

  const now = new Date();
  const reportingYear = now.getFullYear();
  const reportingMonth = now.getMonth() + 1;
  const monthStart = new Date(reportingYear, now.getMonth(), 1);
  const monthEnd = new Date(reportingYear, now.getMonth() + 1, 1);

  let exports = 0;

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);

    try {
      const [ticketCount, paymentSum, instantWins, drawWinners] =
        await Promise.all([
        client.tickets.count({
          where: {
            status: { in: ["purchased", "winning"] },
            purchased_at: { gte: monthStart, lt: monthEnd },
          },
        }),
        client.payments.aggregate({
          where: {
            status: "completed",
            created_at: { gte: monthStart, lt: monthEnd },
          },
          _sum: { amount: true, tax_amount: true, operator_amount: true },
        }),
        client.instant_win_awards.findMany({
          where: {
            awarded_at: { gte: monthStart, lt: monthEnd },
          },
          include: { prize: { select: { prize_value: true } } },
        }),
        client.winners.findMany({
          where: {
            announced_at: { gte: monthStart, lt: monthEnd },
          },
          include: { prize: { select: { value_kes: true } } },
        }),
      ]);

      const grossRevenue = Number(paymentSum._sum.amount ?? 0);
      const taxTotal = Number(paymentSum._sum.tax_amount ?? 0);
      const instantPrizes = instantWins.reduce(
        (sum, row) => sum + Number(row.prize.prize_value),
        0,
      );
      const drawPrizes = drawWinners.reduce(
        (sum, row) => sum + Number(row.prize?.value_kes ?? 0),
        0,
      );
      const prizes = instantPrizes + drawPrizes;
      const expenses = 0;
      const grossGamingRevenue = Math.max(
        0,
        grossRevenue - prizes - expenses,
      );

      const existingReturn = await client.gra_outbound_events.findFirst({
        where: {
          event_type: "monthly.return",
          status: { in: ["pending", "sent"] },
          AND: [
            {
              payload: {
                path: ["reporting_year"],
                equals: reportingYear,
              },
            },
            {
              payload: {
                path: ["reporting_month"],
                equals: reportingMonth,
              },
            },
          ],
        },
        select: { id: true },
      });

      if (existingReturn) {
        continue;
      }

      await client.gra_outbound_events.create({
        data: {
          event_type: "monthly.return",
          payload: {
            reporting_year: reportingYear,
            reporting_month: reportingMonth,
            tickets_sold: ticketCount,
            gross_revenue: grossRevenue,
            prizes_paid: prizes,
            expenses,
            gross_gaming_revenue: grossGamingRevenue,
            tax_due: taxTotal,
            tax_paid: 0,
            notes: `Automated export ${monthStart.toISOString().slice(0, 7)}`,
          },
          status: "pending",
        },
      });

      exports += 1;

      await enqueueProcessGraOutbound(db.operator_id);
    } finally {
      await client.$disconnect();
    }
  }

  return { exports };
}
