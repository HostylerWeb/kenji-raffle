import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { decryptSecret, pickRandomItems, requireEnv } from "@kenji-raffle/shared";
import { platformPrisma } from "@kenji-raffle/database-platform";
import { sendWinnerEmailsForRaffle } from "./send-email";

type PrizeType = "physical" | "cash" | "site_credit";

async function fulfillPrizeInTx(
  tx: {
    users: {
      update: (args: unknown) => Promise<unknown>;
    };
    prize_claims: { create: (args: unknown) => Promise<unknown> };
    site_credit_transactions: { create: (args: unknown) => Promise<unknown> };
  },
  userId: string,
  prizeType: PrizeType,
  prizeValue: number,
  context: { winnerId?: string; note?: string },
) {
  if (prizeType === "site_credit" && prizeValue > 0) {
    await tx.users.update({
      where: { id: userId },
      data: { site_credit_balance: { increment: prizeValue } },
    });
    await tx.site_credit_transactions.create({
      data: {
        user_id: userId,
        amount: prizeValue,
        type: "credit",
        note: context.note ?? "Prize credit",
      },
    });
    return;
  }
  if (prizeType === "physical" || prizeType === "cash") {
    await tx.prize_claims.create({
      data: {
        user_id: userId,
        winner_id: context.winnerId,
        status: "pending",
      },
    });
  }
}

export async function runAutoDrawForOperator(operatorId: string, raffleId: string) {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const db = await platformPrisma.tenant_databases.findUnique({
    where: { operator_id: operatorId },
  });
  if (!db || db.status !== "active") {
    return { skipped: true, reason: "tenant_not_active" };
  }

  const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
  const client = createTenantPrismaClient(url);

  try {
    const raffle = await client.raffles.findUnique({ where: { id: raffleId } });
    if (!raffle) return { skipped: true, reason: "not_found" };
    if (raffle.draw_type !== "automatic" && raffle.draw_type !== "scheduled") {
      return { skipped: true, reason: "not_auto_or_scheduled" };
    }
    if (raffle.status !== "active" && raffle.status !== "to_be_drawn") {
      return { skipped: true, reason: "status" };
    }
    if (raffle.end_date && raffle.end_date > new Date()) {
      return { skipped: true, reason: "not_ended" };
    }
    if (
      raffle.draw_type === "scheduled" &&
      raffle.scheduled_draw_at &&
      raffle.scheduled_draw_at > new Date()
    ) {
      return { skipped: true, reason: "scheduled_not_ready" };
    }

    const existing = await client.winners.count({ where: { raffle_id: raffleId } });
    if (existing > 0) return { skipped: true, reason: "already_drawn" };

    const purchased = await client.tickets.count({
      where: { raffle_id: raffleId, status: "purchased" },
    });

    if (purchased < raffle.min_tickets) {
      await client.raffles.update({
        where: { id: raffleId },
        data: { status: "failed" },
      });
      return { skipped: true, reason: "min_tickets_not_met", status: "failed" };
    }

    const tickets = await client.tickets.findMany({
      where: { raffle_id: raffleId, status: "purchased", user_id: { not: null } },
      select: { id: true, user_id: true, ticket_number: true },
    });

    const prizes = await client.prizes.findMany({
      where: { raffle_id: raffleId },
      orderBy: { sort_order: "asc" },
    });

    const winnerCount = Math.min(raffle.number_of_winners, tickets.length);
    const winners = pickRandomItems(tickets, winnerCount);

    await client.$transaction(async (tx) => {
      for (let i = 0; i < winners.length; i++) {
        const ticket = winners[i];
        if (!ticket.user_id) continue;
        const prize = prizes[i] ?? prizes[0] ?? null;

        const winner = await tx.winners.create({
          data: {
            raffle_id: raffleId,
            user_id: ticket.user_id,
            ticket_id: ticket.id,
            prize_id: prize?.id ?? null,
          },
        });

        await tx.tickets.update({
          where: { id: ticket.id },
          data: { status: "winning" },
        });

        if (prize) {
          await fulfillPrizeInTx(
            tx as Parameters<typeof fulfillPrizeInTx>[0],
            ticket.user_id,
            prize.prize_type as PrizeType,
            prize.value_kes ? Number(prize.value_kes) : 0,
            { winnerId: winner.id, note: `Main prize: ${prize.name}` },
          );
        }
      }

      await tx.raffles.update({
        where: { id: raffleId },
        data: { status: "drawn" },
      });
    });

    const emailResult = await sendWinnerEmailsForRaffle(
      db.operator_id,
      raffleId,
    );

    return {
      drawn: true,
      raffle_id: raffleId,
      winners: winnerCount,
      winner_emails_sent: emailResult.sent,
    };
  } finally {
    await client.$disconnect();
  }
}

export async function scheduleAutoDrawsForAllTenants() {
  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
  });

  const now = new Date();
  const results = [];

  for (const db of databases) {
    const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);

    try {
      const raffles = await client.raffles.findMany({
        where: {
          draw_type: { in: ["automatic", "scheduled"] },
          status: { in: ["active", "to_be_drawn"] },
          end_date: { lte: now },
        },
        select: { id: true, scheduled_draw_at: true, draw_type: true },
      });

      for (const raffle of raffles) {
        if (
          raffle.draw_type === "scheduled" &&
          raffle.scheduled_draw_at &&
          raffle.scheduled_draw_at > now
        ) {
          continue;
        }
        const result = await runAutoDrawForOperator(db.operator_id, raffle.id);
        results.push({ operator_id: db.operator_id, raffle_id: raffle.id, ...result });
      }
    } finally {
      await client.$disconnect();
    }
  }

  return results;
}
