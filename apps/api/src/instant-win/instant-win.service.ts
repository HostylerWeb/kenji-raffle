import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";
import { fulfillPrize } from "../prizes/prize-fulfillment";

export type InstantWinResult = {
  ticket_id: string;
  ticket_number: number;
  raffle_title: string;
  prize_id: string;
  name: string;
  prize_type: string;
  prize_value: number;
};

export async function evaluateInstantWinsForTickets(
  client: TenantPrismaClient,
  userId: string,
  ticketIds: string[],
): Promise<InstantWinResult[]> {
  if (ticketIds.length === 0) return [];

  const tickets = await client.tickets.findMany({
    where: { id: { in: ticketIds }, user_id: userId, status: "purchased" },
    include: {
      raffle: { select: { title: true } },
      instant_win_prize: true,
    },
    orderBy: { ticket_number: "asc" },
  });

  const results: InstantWinResult[] = [];

  for (const ticket of tickets) {
    let matchedPrize: {
      id: string;
      name: string;
      prize_type: string;
      prize_value: unknown;
      win_frequency: number;
      total_available: number;
      total_awarded: number;
      status: string;
    } | null = null;

    if (ticket.instant_win_prize_id && ticket.instant_win_prize) {
      matchedPrize = ticket.instant_win_prize;
    } else {
      const prizes = await client.instant_win_prizes.findMany({
        where: { raffle_id: ticket.raffle_id, status: "active" },
        orderBy: { win_frequency: "asc" },
      });

      for (const prize of prizes) {
        if (prize.total_awarded >= prize.total_available) continue;
        if (prize.win_frequency <= 0) continue;
        if (ticket.ticket_number % prize.win_frequency !== 0) continue;
        matchedPrize = prize;
        break;
      }
    }

    if (!matchedPrize) continue;
    if (matchedPrize.status !== "active") continue;
    if (matchedPrize.total_awarded >= matchedPrize.total_available) continue;

    const existing = await client.instant_win_awards.findFirst({
      where: { ticket_id: ticket.id, instant_win_prize_id: matchedPrize.id },
    });
    if (existing) continue;

    const award = await client.$transaction(async (tx) => {
      const fresh = await tx.instant_win_prizes.findUnique({
        where: { id: matchedPrize!.id },
      });
      if (!fresh || fresh.total_awarded >= fresh.total_available) {
        return null;
      }

      const created = await tx.instant_win_awards.create({
        data: {
          ticket_id: ticket.id,
          instant_win_prize_id: matchedPrize!.id,
          user_id: userId,
          status: "awarded",
        },
      });

      await tx.instant_win_prizes.update({
        where: { id: matchedPrize!.id },
        data: { total_awarded: { increment: 1 } },
      });

      await fulfillPrize(
        tx,
        userId,
        fresh.prize_type as "physical" | "cash" | "site_credit",
        Number(fresh.prize_value),
        {
          instantWinAwardId: created.id,
          note: `Instant win: ${fresh.name}`,
        },
      );

      if (ticket.instant_win_prize_id !== matchedPrize!.id) {
        await tx.tickets.update({
          where: { id: ticket.id },
          data: { instant_win_prize_id: matchedPrize!.id },
        });
      }

      return created;
    });

    if (!award) continue;

    results.push({
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      raffle_title: ticket.raffle.title,
      prize_id: matchedPrize.id,
      name: matchedPrize.name,
      prize_type: matchedPrize.prize_type,
      prize_value: Number(matchedPrize.prize_value),
    });
  }

  return results;
}
