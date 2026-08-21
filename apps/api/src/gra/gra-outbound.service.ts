import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";

export async function queueGraEventsForOrder(
  client: TenantPrismaClient,
  input: {
    order_id: string;
    total: number;
    tax_amount: number;
    operator_amount: number;
    tax_rate: number;
    payment_id: string;
    payment_method?: string | null;
    completed_at?: string;
    tickets: Array<{
      ticket_id: string;
      ticket_number: number;
      raffle_id: string;
      raffle_title: string;
      amount: number;
      purchased_at?: string;
    }>;
  },
) {
  const completedAt = input.completed_at ?? new Date().toISOString();

  await client.gra_outbound_events.create({
    data: {
      event_type: "payment.completed",
      payload: {
        order_id: input.order_id,
        payment_id: input.payment_id,
        total: input.total,
        tax_amount: input.tax_amount,
        operator_amount: input.operator_amount,
        tax_rate: input.tax_rate,
        payment_method: input.payment_method ?? "mock",
        completed_at: completedAt,
        currency: "KES",
      },
      status: "pending",
    },
  });

  for (const ticket of input.tickets) {
    await client.gra_outbound_events.create({
      data: {
        event_type: "ticket.purchased",
        payload: {
          ticket_id: ticket.ticket_id,
          raffle_id: ticket.raffle_id,
          raffle_name: ticket.raffle_title,
          amount: ticket.amount,
          currency: "KES",
          purchased_at: ticket.purchased_at ?? completedAt,
        },
        status: "pending",
      },
    });
  }
}

export async function queueGraTicketVoided(
  client: TenantPrismaClient,
  tickets: Array<{
    ticket_id: string;
    raffle_id: string;
    raffle_title: string;
    amount: number;
    purchased_at: string;
  }>,
) {
  const voidedAt = new Date().toISOString();

  for (const ticket of tickets) {
    await client.gra_outbound_events.create({
      data: {
        event_type: "ticket.voided",
        payload: {
          ticket_id: ticket.ticket_id,
          raffle_id: ticket.raffle_id,
          raffle_name: ticket.raffle_title,
          amount: ticket.amount,
          currency: "KES",
          purchased_at: ticket.purchased_at,
          voided_at: voidedAt,
        },
        status: "pending",
      },
    });
  }
}

export async function queueGraPlaySafeActivated(
  client: TenantPrismaClient,
  input: {
    county?: string | null;
    occurred_at?: string;
  },
) {
  await client.gra_outbound_events.create({
    data: {
      event_type: "play_safe.activated",
      payload: {
        county: input.county ?? null,
        occurred_at: input.occurred_at ?? new Date().toISOString(),
      },
      status: "pending",
    },
  });
}

export async function queueGraSessionAggregate(
  client: TenantPrismaClient,
  input: {
    bucket_start: string;
    county: string;
    session_count: number;
    total_session_minutes?: number;
    stake_band_distribution: Record<string, number>;
    hour_of_day?: number;
    day_of_week?: number;
  },
) {
  await client.gra_outbound_events.create({
    data: {
      event_type: "session.aggregate",
      payload: {
        bucket_start: input.bucket_start,
        county: input.county,
        session_count: input.session_count,
        total_session_minutes: input.total_session_minutes ?? 0,
        stake_band_distribution: input.stake_band_distribution,
        hour_of_day: input.hour_of_day,
        day_of_week: input.day_of_week,
      },
      status: "pending",
    },
  });
}

export async function queueGraPaymentFailed(
  client: TenantPrismaClient,
  input: {
    order_id: string;
    payment_id: string;
    amount: number;
    payment_method?: string | null;
    reason?: string;
  },
) {
  await client.gra_outbound_events.create({
    data: {
      event_type: "payment.failed",
      payload: {
        order_id: input.order_id,
        payment_id: input.payment_id,
        amount: input.amount,
        payment_method: input.payment_method ?? "mock",
        reason: input.reason ?? "failed",
        failed_at: new Date().toISOString(),
        currency: "KES",
      },
      status: "pending",
    },
  });
}
