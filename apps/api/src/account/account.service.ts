import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { queueGraPlaySafeActivated } from "../gra/gra-outbound.service";
import { PlatformQueueService } from "../platform/platform-queue.service";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class AccountService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly queue: PlatformQueueService,
  ) {}

  async getMe(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const user = await client.users.findUnique({ where: { id: player.id } });
    if (!user) throw new NotFoundException("User not found");

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      email_verified: Boolean(user.email_verified_at),
      site_credit_balance: decimal(user.site_credit_balance),
      play_safe_active: user.play_safe_active,
      play_safe_until: user.play_safe_until?.toISOString() ?? null,
      spending_limit: user.spending_limit ? decimal(user.spending_limit) : null,
      spending_limit_period: user.spending_limit_period,
      county: user.county,
      kyc_status: user.kyc_status,
      kyc_document_url: user.kyc_document_url,
    };
  }

  async listOrders(
    tenant: TenantContext,
    player: PlayerAuthUser,
    page = 1,
    limit = 20,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      client.orders.findMany({
        where: { user_id: player.id },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          sub_total: true,
          discount: true,
          total: true,
          coupon_code: true,
          created_at: true,
        },
      }),
      client.orders.count({ where: { user_id: player.id } }),
    ]);

    return {
      items: rows.map((o) => ({
        id: o.id,
        status: o.status,
        sub_total: decimal(o.sub_total),
        discount: decimal(o.discount),
        total: decimal(o.total),
        coupon_code: o.coupon_code,
        created_at: o.created_at.toISOString(),
      })),
      page,
      limit,
      total,
    };
  }

  async getOrder(tenant: TenantContext, player: PlayerAuthUser, orderId: string) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const order = await client.orders.findFirst({
      where: { id: orderId, user_id: player.id },
      include: {
        items: { include: { raffle: { select: { title: true, slug: true } } } },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException("Order not found");

    const tickets = await client.tickets.findMany({
      where: { order_id: orderId },
      orderBy: [{ raffle_id: "asc" }, { ticket_number: "asc" }],
      include: { raffle: { select: { title: true, slug: true } } },
    });

    const ticketIds = tickets.map((t) => t.id);
    const instantAwards =
      ticketIds.length > 0
        ? await client.instant_win_awards.findMany({
            where: { ticket_id: { in: ticketIds } },
            include: { prize: true },
          })
        : [];

    const payment = order.payments[0];

    return {
      order_id: order.id,
      status: order.status,
      sub_total: decimal(order.sub_total),
      discount: decimal(order.discount),
      total: decimal(order.total),
      coupon_code: order.coupon_code,
      created_at: order.created_at.toISOString(),
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amount: decimal(payment.amount),
            tax_amount: decimal(payment.tax_amount),
            operator_amount: decimal(payment.operator_amount),
            payment_method: payment.payment_method,
          }
        : null,
      items: order.items.map((item) => ({
        raffle_title: item.raffle.title,
        raffle_slug: item.raffle.slug,
        quantity: item.quantity,
        unit_price: decimal(item.unit_price),
        total: decimal(item.total),
      })),
      tickets: tickets.map((t) => ({
        raffle_title: t.raffle.title,
        raffle_slug: t.raffle.slug,
        ticket_number: t.ticket_number,
      })),
      instant_wins: instantAwards.map((a) => ({
        name: a.prize.name,
        prize_type: a.prize.prize_type,
        prize_value: decimal(a.prize.prize_value),
      })),
    };
  }

  async listTickets(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const tickets = await client.tickets.findMany({
      where: { user_id: player.id, status: "purchased" },
      orderBy: { created_at: "desc" },
      include: { raffle: { select: { title: true, slug: true, status: true } } },
    });

    return tickets.map((t) => ({
      id: t.id,
      ticket_number: t.ticket_number,
      raffle_title: t.raffle.title,
      raffle_slug: t.raffle.slug,
      raffle_status: t.raffle.status,
      purchase_price: decimal(t.purchase_price ?? 0),
      created_at: t.created_at.toISOString(),
    }));
  }

  async listWins(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);

    const [mainWins, instantWins] = await Promise.all([
      client.winners.findMany({
        where: { user_id: player.id },
        orderBy: { announced_at: "desc" },
        include: {
          raffle: { select: { title: true, slug: true } },
          ticket: { select: { ticket_number: true } },
          prize: { select: { name: true, prize_type: true } },
        },
      }),
      client.instant_win_awards.findMany({
        where: { user_id: player.id },
        orderBy: { awarded_at: "desc" },
        include: {
          ticket: {
            include: {
              raffle: { select: { title: true, slug: true } },
            },
          },
          prize: true,
        },
      }),
    ]);

    return {
      main_prizes: mainWins.map((w) => ({
        id: w.id,
        type: "main",
        raffle_title: w.raffle.title,
        raffle_slug: w.raffle.slug,
        ticket_number: w.ticket.ticket_number,
        prize_name: w.prize?.name ?? "Main prize",
        prize_type: w.prize?.prize_type ?? "physical",
        announced_at: w.announced_at.toISOString(),
      })),
      instant_wins: instantWins.map((a) => ({
        id: a.id,
        type: "instant",
        raffle_title: a.ticket.raffle.title,
        raffle_slug: a.ticket.raffle.slug,
        ticket_number: a.ticket.ticket_number,
        prize_name: a.prize.name,
        prize_type: a.prize.prize_type,
        prize_value: decimal(a.prize.prize_value),
        awarded_at: a.awarded_at.toISOString(),
        status: a.status,
      })),
    };
  }

  async updateProfile(
    tenant: TenantContext,
    player: PlayerAuthUser,
    input: {
      full_name?: string;
      county?: string;
      spending_limit?: number | null;
      spending_limit_period?: "weekly" | "monthly" | null;
    },
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);

    if (
      input.spending_limit_period &&
      !["weekly", "monthly"].includes(input.spending_limit_period)
    ) {
      throw new BadRequestException("Invalid spending limit period");
    }

    const user = await client.users.update({
      where: { id: player.id },
      data: {
        full_name: input.full_name,
        county: input.county,
        spending_limit: input.spending_limit ?? null,
        spending_limit_period: input.spending_limit_period ?? null,
      },
    });

    return {
      id: user.id,
      full_name: user.full_name,
      county: user.county,
      spending_limit: user.spending_limit ? decimal(user.spending_limit) : null,
      spending_limit_period: user.spending_limit_period,
    };
  }

  async activatePlaySafe(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const until = new Date();
    until.setDate(until.getDate() + 7);

    const user = await client.users.update({
      where: { id: player.id },
      data: {
        play_safe_active: true,
        play_safe_until: until,
      },
    });

    await queueGraPlaySafeActivated(client, {
      county: user.county,
      occurred_at: new Date().toISOString(),
    });
    void this.queue.enqueueProcessGraOutbound(tenant.operatorId);

    return {
      play_safe_active: user.play_safe_active,
      play_safe_until: user.play_safe_until?.toISOString() ?? null,
    };
  }

  async submitKyc(
    tenant: TenantContext,
    player: PlayerAuthUser,
    documentUrl: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const user = await client.users.update({
      where: { id: player.id },
      data: {
        kyc_document_url: documentUrl,
        kyc_status: "pending",
      },
    });

    return {
      kyc_status: user.kyc_status,
      kyc_document_url: user.kyc_document_url,
    };
  }

  async listPrizeClaims(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const rows = await client.prize_claims.findMany({
      where: { user_id: player.id },
      orderBy: { created_at: "desc" },
      include: {
        withdrawals: { orderBy: { created_at: "desc" }, take: 1 },
        winner: {
          include: {
            raffle: { select: { title: true } },
            prize: { select: { name: true, prize_type: true, value_kes: true } },
          },
        },
        award: {
          include: {
            prize: { select: { name: true, prize_type: true, prize_value: true } },
            ticket: { select: { ticket_number: true } },
          },
        },
      },
    });

    return rows.map((c) => {
      const prizeType =
        c.winner?.prize?.prize_type ?? c.award?.prize.prize_type ?? "physical";
      const prizeValue =
        c.winner?.prize?.value_kes ?? c.award?.prize.prize_value;
      const withdrawal = c.withdrawals[0];

      return {
        id: c.id,
        status: c.status,
        prize_type: prizeType,
        prize_name: c.winner?.prize?.name ?? c.award?.prize.name,
        prize_value: prizeValue ? decimal(prizeValue) : null,
        source: c.winner
          ? `Main prize — ${c.winner.raffle.title}`
          : `Instant win — ticket ${c.award?.ticket.ticket_number}`,
        county: c.county,
        town: c.town,
        address_line: c.address_line,
        postal_code: c.postal_code,
        withdrawal: withdrawal
          ? {
              id: withdrawal.id,
              status: withdrawal.status,
              method: withdrawal.method,
              amount: decimal(withdrawal.amount),
            }
          : null,
        created_at: c.created_at.toISOString(),
        updated_at: c.updated_at.toISOString(),
      };
    });
  }

  async updatePrizeClaimAddress(
    tenant: TenantContext,
    player: PlayerAuthUser,
    claimId: string,
    input: {
      county?: string;
      town?: string;
      address_line?: string;
      postal_code?: string;
    },
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const claim = await client.prize_claims.findFirst({
      where: { id: claimId, user_id: player.id },
      include: {
        winner: { include: { prize: true } },
        award: { include: { prize: true } },
      },
    });
    if (!claim) throw new NotFoundException("Claim not found");

    const prizeType =
      claim.winner?.prize?.prize_type ?? claim.award?.prize.prize_type;
    if (prizeType !== "physical") {
      throw new BadRequestException("This claim does not require a shipping address");
    }

    const updated = await client.prize_claims.update({
      where: { id: claimId },
      data: {
        county: input.county,
        town: input.town,
        address_line: input.address_line,
        postal_code: input.postal_code,
      },
    });

    return {
      id: updated.id,
      county: updated.county,
      town: updated.town,
      address_line: updated.address_line,
      postal_code: updated.postal_code,
    };
  }

  async requestWithdrawal(
    tenant: TenantContext,
    player: PlayerAuthUser,
    claimId: string,
    input: {
      method: "mpesa" | "bank";
      account_name?: string;
      account_number: string;
      bank_name?: string;
    },
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const claim = await client.prize_claims.findFirst({
      where: { id: claimId, user_id: player.id },
      include: {
        withdrawals: true,
        winner: { include: { prize: true } },
        award: { include: { prize: true } },
      },
    });
    if (!claim) throw new NotFoundException("Claim not found");

    const prizeType =
      claim.winner?.prize?.prize_type ?? claim.award?.prize.prize_type;
    if (prizeType !== "cash") {
      throw new BadRequestException("This claim is not a cash prize");
    }

    if (claim.withdrawals.some((w) => w.status !== "rejected")) {
      throw new BadRequestException("Withdrawal already requested for this claim");
    }

    const prizeValue =
      claim.winner?.prize?.value_kes ?? claim.award?.prize.prize_value;
    const amount = prizeValue ? decimal(prizeValue) : 0;
    if (amount <= 0) {
      throw new BadRequestException("Invalid prize amount");
    }

    if (input.method === "bank" && !input.bank_name) {
      throw new BadRequestException("Bank name is required for bank transfers");
    }

    const withdrawal = await client.withdrawals.create({
      data: {
        user_id: player.id,
        prize_claim_id: claimId,
        amount,
        method: input.method,
        account_name: input.account_name,
        account_number: input.account_number,
        bank_name: input.bank_name,
        status: "pending",
      },
    });

    return {
      id: withdrawal.id,
      amount: decimal(withdrawal.amount),
      method: withdrawal.method,
      status: withdrawal.status,
      created_at: withdrawal.created_at.toISOString(),
    };
  }

  async listSiteCreditTransactions(
    tenant: TenantContext,
    player: PlayerAuthUser,
    page = 1,
    limit = 20,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      client.site_credit_transactions.findMany({
        where: { user_id: player.id },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      client.site_credit_transactions.count({ where: { user_id: player.id } }),
    ]);

    return {
      items: rows.map((t) => ({
        id: t.id,
        amount: decimal(t.amount),
        type: t.type,
        note: t.note,
        order_id: t.order_id,
        created_at: t.created_at.toISOString(),
      })),
      page,
      limit,
      total,
    };
  }

  async listShippingAddresses(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const rows = await client.user_shipping_addresses.findMany({
      where: { user_id: player.id },
      orderBy: [{ is_default: "desc" }, { id: "asc" }],
    });
    return rows.map((a) => ({
      id: a.id,
      label: a.label,
      county: a.county,
      town: a.town,
      address_line: a.address_line,
      postal_code: a.postal_code,
      is_default: a.is_default,
    }));
  }

  async createShippingAddress(
    tenant: TenantContext,
    player: PlayerAuthUser,
    input: {
      label?: string;
      county?: string;
      town?: string;
      address_line?: string;
      postal_code?: string;
      is_default?: boolean;
    },
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    if (input.is_default) {
      await client.user_shipping_addresses.updateMany({
        where: { user_id: player.id },
        data: { is_default: false },
      });
    }
    const row = await client.user_shipping_addresses.create({
      data: {
        user_id: player.id,
        label: input.label,
        county: input.county,
        town: input.town,
        address_line: input.address_line,
        postal_code: input.postal_code,
        is_default: input.is_default ?? false,
      },
    });
    return {
      id: row.id,
      label: row.label,
      county: row.county,
      town: row.town,
      address_line: row.address_line,
      postal_code: row.postal_code,
      is_default: row.is_default,
    };
  }

  async deleteShippingAddress(
    tenant: TenantContext,
    player: PlayerAuthUser,
    addressId: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const existing = await client.user_shipping_addresses.findFirst({
      where: { id: addressId, user_id: player.id },
    });
    if (!existing) throw new NotFoundException("Address not found");
    await client.user_shipping_addresses.delete({ where: { id: addressId } });
    return { deleted: true };
  }
}
