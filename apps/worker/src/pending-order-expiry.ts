import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import type { Prisma } from "@kenji-raffle/database-tenant";
import {
  decryptSecret,
  requireEnv,
} from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";
import { enqueueProcessGraOutbound } from "./enqueue-gra-outbound";

function parseTicketNumbers(json: Prisma.JsonValue): number[] {
  if (!Array.isArray(json)) return [];
  return json.filter((n) => typeof n === "number") as number[];
}

async function releaseTicketsByNumbers(
  client: ReturnType<typeof createTenantPrismaClient>,
  raffleId: string,
  ticketNumbers: number[],
) {
  if (ticketNumbers.length === 0) return;

  await client.tickets.updateMany({
    where: {
      raffle_id: raffleId,
      ticket_number: { in: ticketNumbers },
      status: "reserved",
    },
    data: {
      status: "available",
      session_id: null,
      user_id: null,
      reserved_until: null,
    },
  });
}

export async function expireStalePendingOrdersForAllTenants() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
  });

  const cutoff = new Date(
    Date.now() -
      Number(process.env.CHECKOUT_PENDING_TTL_MINUTES ?? 60) * 60 * 1000,
  );
  let expired = 0;

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);

    try {
      const staleOrders = await client.orders.findMany({
        where: {
          status: "pending",
          created_at: { lt: cutoff },
        },
        include: { payments: true, items: true },
        take: 100,
      });

      for (const order of staleOrders) {
        const payment = order.payments.find((p) => p.status === "pending");

        await client.orders.updateMany({
          where: { id: order.id, status: "pending" },
          data: { status: "failed" },
        });

        if (payment) {
          await client.payments.updateMany({
            where: { id: payment.id, status: "pending" },
            data: { status: "failed" },
          });
        }

        for (const item of order.items) {
          const numbers = parseTicketNumbers(item.ticket_numbers);
          if (numbers.length > 0) {
            await releaseTicketsByNumbers(client, item.raffle_id, numbers);
          }
        }

        if (payment) {
          await client.gra_outbound_events.create({
            data: {
              event_type: "payment.failed",
              payload: {
                order_id: order.id,
                payment_id: payment.id,
                amount: Number(payment.amount),
                payment_method: payment.payment_method ?? "mock",
                reason: "checkout_timeout",
                failed_at: new Date().toISOString(),
                currency: "KES",
              },
              status: "pending",
            },
          });
        }

        expired += 1;
      }

      if (staleOrders.length > 0) {
        await enqueueProcessGraOutbound(db.operator_id);
      }
    } finally {
      await client.$disconnect();
    }
  }

  return expired;
}
