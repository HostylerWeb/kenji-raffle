import { Injectable } from "@nestjs/common";
import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";

export function cartTtlMinutes(): number {
  return Number(process.env.CART_RESERVATION_TTL_MINUTES ?? 15);
}

/** How long reserved tickets stay held while an order is pending payment. */
export function checkoutPendingTtlMinutes(): number {
  return Number(process.env.CHECKOUT_PENDING_TTL_MINUTES ?? 60);
}

export function cartExpiresAt(): Date {
  return new Date(Date.now() + cartTtlMinutes() * 60 * 1000);
}

export function checkoutPendingExpiresAt(): Date {
  return new Date(Date.now() + checkoutPendingTtlMinutes() * 60 * 1000);
}

/** Keep ticket reservations alive until payment completes or fails. */
export async function extendTicketReservations(
  client: TenantPrismaClient,
  raffleId: string,
  ticketNumbers: number[],
  userId: string,
  reservedUntil: Date,
) {
  if (ticketNumbers.length === 0) return;

  await client.tickets.updateMany({
    where: {
      raffle_id: raffleId,
      ticket_number: { in: ticketNumbers },
      status: "reserved",
      user_id: userId,
    },
    data: { reserved_until: reservedUntil },
  });
}

type ReservedTicket = { id: string; ticket_number: number };

export async function reserveTickets(
  client: TenantPrismaClient,
  raffleId: string,
  quantity: number,
  sessionId: string,
  userId: string | null,
  reservedUntil: Date,
): Promise<ReservedTicket[]> {
  const rows = await client.$queryRaw<ReservedTicket[]>`
    WITH picked AS (
      SELECT id, ticket_number FROM tickets
      WHERE raffle_id = ${raffleId}::uuid AND status = 'available'
      ORDER BY ticket_number
      LIMIT ${quantity}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE tickets t
    SET
      status = 'reserved',
      session_id = ${sessionId},
      user_id = ${userId}::uuid,
      reserved_until = ${reservedUntil},
      updated_at = NOW()
    FROM picked
    WHERE t.id = picked.id
    RETURNING t.id, picked.ticket_number
  `;
  return rows;
}

export async function releaseTicketsByNumbers(
  client: TenantPrismaClient,
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

/** Re-reserve specific ticket numbers after a failed payment (same numbers when still available). */
export async function reserveSpecificTickets(
  client: TenantPrismaClient,
  raffleId: string,
  ticketNumbers: number[],
  sessionId: string,
  userId: string,
  reservedUntil: Date,
): Promise<number[]> {
  if (ticketNumbers.length === 0) return [];

  await client.tickets.updateMany({
    where: {
      raffle_id: raffleId,
      ticket_number: { in: ticketNumbers },
      status: "available",
    },
    data: {
      status: "reserved",
      session_id: sessionId,
      user_id: userId,
      reserved_until: reservedUntil,
    },
  });

  const rows = await client.tickets.findMany({
    where: {
      raffle_id: raffleId,
      ticket_number: { in: ticketNumbers },
      status: "reserved",
      user_id: userId,
    },
    select: { ticket_number: true },
    orderBy: { ticket_number: "asc" },
  });

  const reserved = rows.map((r) => r.ticket_number);
  const shortfall = ticketNumbers.length - reserved.length;
  if (shortfall > 0) {
    const extra = await reserveTickets(
      client,
      raffleId,
      shortfall,
      sessionId,
      userId,
      reservedUntil,
    );
    reserved.push(...extra.map((t) => t.ticket_number));
  }

  return reserved.sort((a, b) => a - b);
}

export async function releaseExpiredReservations(client: TenantPrismaClient) {
  const now = new Date();
  const expired = await client.tickets.findMany({
    where: {
      status: "reserved",
      reserved_until: { lt: now },
    },
    select: { raffle_id: true, ticket_number: true },
  });

  if (expired.length === 0) return 0;

  await client.tickets.updateMany({
    where: {
      status: "reserved",
      reserved_until: { lt: now },
    },
    data: {
      status: "available",
      session_id: null,
      user_id: null,
      reserved_until: null,
    },
  });

  await client.cart_items.deleteMany({
    where: { expires_at: { lt: now } },
  });

  return expired.length;
}
