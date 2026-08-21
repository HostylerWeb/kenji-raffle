import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import {
  decryptSecret,
  emptyGraStakeBandDistribution,
  graStakeBandForAmount,
  processGraOutboundForOperator,
  requireEnv,
} from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";

export async function runSessionAggregatesForAllTenants() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
  });

  const hourStart = new Date();
  hourStart.setMinutes(0, 0, 0);

  let aggregates = 0;

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);

    try {
      const since = new Date(hourStart.getTime() - 60 * 60 * 1000);
      const orders = await client.orders.findMany({
        where: {
          status: "completed",
          created_at: { gte: since, lt: hourStart },
        },
        include: {
          user: { select: { county: true } },
          tickets: { select: { purchase_price: true } },
        },
      });

      type BandBucket = {
        county: string;
        stake_band: string;
        session_count: number;
        ticket_count: number;
        total_stake: number;
      };

      const bandBuckets = new Map<string, BandBucket>();
      const countyOutbound = new Map<
        string,
        {
          session_count: number;
          stake_band_distribution: Record<string, number>;
        }
      >();

      for (const order of orders) {
        const county = order.user.county?.trim() || "Unknown";
        const ticketStake = order.tickets.reduce(
          (sum, ticket) => sum + Number(ticket.purchase_price ?? 0),
          0,
        );
        const orderStake =
          ticketStake > 0 ? ticketStake : Number(order.total);
        const band = graStakeBandForAmount(orderStake);
        const bandKey = `${county}|${band}`;

        const bandBucket = bandBuckets.get(bandKey) ?? {
          county,
          stake_band: band,
          session_count: 0,
          ticket_count: 0,
          total_stake: 0,
        };
        bandBucket.session_count += 1;
        bandBucket.ticket_count += order.tickets.length;
        bandBucket.total_stake += orderStake;
        bandBuckets.set(bandKey, bandBucket);

        const countyBucket = countyOutbound.get(county) ?? {
          session_count: 0,
          stake_band_distribution: emptyGraStakeBandDistribution(),
        };
        countyBucket.session_count += 1;
        countyBucket.stake_band_distribution[band] =
          (countyBucket.stake_band_distribution[band] ?? 0) + 1;
        countyOutbound.set(county, countyBucket);
      }

      for (const bucket of bandBuckets.values()) {
        await client.gra_session_aggregates.upsert({
          where: {
            hour_start_county_stake_band: {
              hour_start: hourStart,
              county: bucket.county,
              stake_band: bucket.stake_band,
            },
          },
          create: {
            hour_start: hourStart,
            county: bucket.county,
            stake_band: bucket.stake_band,
            session_count: bucket.session_count,
            ticket_count: bucket.ticket_count,
            total_stake: bucket.total_stake,
          },
          update: {
            session_count: { increment: bucket.session_count },
            ticket_count: { increment: bucket.ticket_count },
            total_stake: { increment: bucket.total_stake },
          },
        });
      }

      for (const [county, bucket] of countyOutbound.entries()) {
        await client.gra_outbound_events.create({
          data: {
            event_type: "session.aggregate",
            payload: {
              bucket_start: hourStart.toISOString(),
              county,
              session_count: bucket.session_count,
              total_session_minutes: 0,
              stake_band_distribution: bucket.stake_band_distribution,
              hour_of_day: hourStart.getUTCHours(),
              day_of_week: hourStart.getUTCDay(),
            },
            status: "pending",
          },
        });

        aggregates += 1;
      }

      await processGraOutboundForOperator(db.operator_id);
    } finally {
      await client.$disconnect();
    }
  }

  return { aggregates };
}
