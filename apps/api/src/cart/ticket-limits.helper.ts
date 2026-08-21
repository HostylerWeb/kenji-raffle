import { BadRequestException } from "@nestjs/common";
import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";

async function pendingOrderTicketCount(
  client: TenantPrismaClient,
  raffleId: string,
  userId: string,
): Promise<number> {
  const rows = await client.order_items.findMany({
    where: {
      raffle_id: raffleId,
      order: { user_id: userId, status: "pending" },
    },
    select: { quantity: true },
  });
  return rows.reduce((sum, row) => sum + row.quantity, 0);
}

export async function countUserTicketsForRaffle(
  client: TenantPrismaClient,
  raffleId: string,
  userId: string,
): Promise<number> {
  const purchased = await client.tickets.count({
    where: { raffle_id: raffleId, user_id: userId, status: "purchased" },
  });

  const now = new Date();
  const cartQty = await client.cart_items.aggregate({
    where: {
      raffle_id: raffleId,
      user_id: userId,
      expires_at: { gt: now },
    },
    _sum: { ticket_quantity: true },
  });

  const pending = await pendingOrderTicketCount(client, raffleId, userId);
  return purchased + (cartQty._sum.ticket_quantity ?? 0) + pending;
}

export async function assertTicketLimitPerUser(
  client: TenantPrismaClient,
  raffleId: string,
  userId: string,
  ticketLimitPerUser: number | null,
  additionalQuantity: number,
  excludeCartItemId?: string,
): Promise<void> {
  if (!ticketLimitPerUser || ticketLimitPerUser <= 0) return;

  const purchased = await client.tickets.count({
    where: { raffle_id: raffleId, user_id: userId, status: "purchased" },
  });

  const now = new Date();
  const cartItems = await client.cart_items.findMany({
    where: {
      raffle_id: raffleId,
      user_id: userId,
      expires_at: { gt: now },
      ...(excludeCartItemId ? { id: { not: excludeCartItemId } } : {}),
    },
    select: { ticket_quantity: true },
  });

  const inCart = cartItems.reduce((sum, item) => sum + item.ticket_quantity, 0);
  const pending = await pendingOrderTicketCount(client, raffleId, userId);
  const total = purchased + inCart + pending + additionalQuantity;

  if (total > ticketLimitPerUser) {
    throw new BadRequestException(
      `Maximum ${ticketLimitPerUser} tickets per person for this competition`,
    );
  }
}

export async function assertCheckoutTicketLimits(
  client: TenantPrismaClient,
  userId: string,
  cartItems: Array<{ raffle_id: string; ticket_quantity: number }>,
): Promise<void> {
  const byRaffle = new Map<string, number>();
  for (const item of cartItems) {
    byRaffle.set(
      item.raffle_id,
      (byRaffle.get(item.raffle_id) ?? 0) + item.ticket_quantity,
    );
  }

  for (const [raffleId, qty] of byRaffle) {
    const raffle = await client.raffles.findUnique({
      where: { id: raffleId },
      select: { ticket_limit_per_user: true, title: true },
    });
    if (!raffle?.ticket_limit_per_user) continue;

    const purchased = await client.tickets.count({
      where: { raffle_id: raffleId, user_id: userId, status: "purchased" },
    });
    const pending = await pendingOrderTicketCount(client, raffleId, userId);

    if (purchased + pending + qty > raffle.ticket_limit_per_user) {
      throw new BadRequestException(
        `Maximum ${raffle.ticket_limit_per_user} tickets per person for ${raffle.title}`,
      );
    }
  }
}
