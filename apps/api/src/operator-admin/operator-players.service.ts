import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OperatorAuthUser } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { queueGraPlaySafeActivated } from "../gra/gra-outbound.service";
import { PlatformQueueService } from "../platform/platform-queue.service";
import { paginate } from "../common/pagination";
import { MediaStorageService } from "../media/media-storage.service";
import type { FastifyReply } from "fastify";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class OperatorPlayersService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
    private readonly queue: PlatformQueueService,
    private readonly media: MediaStorageService,
  ) {}

  private async client(operatorId: string) {
    return this.tenantConnection.getClient(operatorId);
  }

  private async ensureUser(client: Awaited<ReturnType<TenantConnectionService["getClient"]>>, id: string) {
    const user = await client.users.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) throw new NotFoundException("Player not found");
    return user;
  }

  async streamKycDocument(
    operatorId: string,
    playerId: string,
    reply: FastifyReply,
  ) {
    const client = await this.client(operatorId);
    await this.ensureUser(client, playerId);
    const user = await client.users.findUnique({
      where: { id: playerId },
      select: { kyc_document_url: true },
    });
    const storageKey = this.media.resolveKycStorageKey(user?.kyc_document_url);
    if (!storageKey || !storageKey.startsWith(`tenants/${operatorId}/`)) {
      throw new NotFoundException("KYC document not found");
    }
    const { stream, mimeType } = await this.media.openStream(storageKey);
    reply.header("Content-Type", mimeType);
    reply.header("Cache-Control", "private, no-store");
    return reply.send(stream);
  }

  async list(
    operatorId: string,
    options?: { search?: string; page?: number; limit?: number },
  ) {
    const client = await this.client(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.usersWhereInput = options?.search
      ? {
          OR: [
            { email: { contains: options.search, mode: "insensitive" } },
            { full_name: { contains: options.search, mode: "insensitive" } },
            { phone: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      client.users.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          county: true,
          site_credit_balance: true,
          kyc_status: true,
          kyc_document_url: true,
          account_disabled: true,
          last_login_at: true,
          created_at: true,
        },
      }),
      client.users.count({ where }),
    ]);

    return {
      items: rows.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        county: u.county,
        site_credit_balance: decimal(u.site_credit_balance),
        kyc_status: u.kyc_status,
        kyc_document_submitted: Boolean(u.kyc_document_url),
        account_disabled: u.account_disabled,
        last_login_at: u.last_login_at?.toISOString() ?? null,
        created_at: u.created_at.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  /** Profile + aggregate stats only — no heavy lists. */
  async get(operatorId: string, id: string) {
    const client = await this.client(operatorId);

    const [
      user,
      orderStats,
      ticketCount,
      claimCount,
      withdrawalCount,
      drawWinCount,
      instantWinCount,
      defaultAddress,
    ] = await Promise.all([
      client.users.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          county: true,
          date_of_birth: true,
          email_verified_at: true,
          registration_ip: true,
          site_credit_balance: true,
          kyc_status: true,
          kyc_document_url: true,
          account_disabled: true,
          play_safe_active: true,
          play_safe_until: true,
          spending_limit: true,
          spending_limit_period: true,
          last_login_at: true,
          created_at: true,
        },
      }),
      client.orders.aggregate({
        where: { user_id: id, status: "completed" },
        _count: { _all: true },
        _sum: { total: true },
      }),
      client.tickets.count({
        where: { user_id: id, status: { in: ["purchased", "winning"] } },
      }),
      client.prize_claims.count({ where: { user_id: id } }),
      client.withdrawals.count({ where: { user_id: id } }),
      client.winners.count({ where: { user_id: id } }),
      client.instant_win_awards.count({ where: { user_id: id } }),
      client.user_shipping_addresses.findFirst({
        where: { user_id: id, is_default: true },
        select: {
          label: true,
          county: true,
          town: true,
          address_line: true,
          postal_code: true,
        },
      }),
    ]);

    if (!user) throw new NotFoundException("Player not found");

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      county: user.county,
      date_of_birth: user.date_of_birth?.toISOString().slice(0, 10) ?? null,
      email_verified_at: user.email_verified_at?.toISOString() ?? null,
      registration_ip: user.registration_ip,
      site_credit_balance: decimal(user.site_credit_balance),
      kyc_status: user.kyc_status,
      kyc_document_submitted: Boolean(user.kyc_document_url),
      account_disabled: user.account_disabled,
      play_safe_active: user.play_safe_active,
      play_safe_until: user.play_safe_until?.toISOString() ?? null,
      spending_limit: user.spending_limit ? decimal(user.spending_limit) : null,
      spending_limit_period: user.spending_limit_period,
      last_login_at: user.last_login_at?.toISOString() ?? null,
      created_at: user.created_at.toISOString(),
      shipping_address: defaultAddress,
      stats: {
        completed_orders: orderStats._count._all,
        lifetime_spend: decimal(orderStats._sum.total ?? 0),
        tickets_owned: ticketCount,
        prize_claims: claimCount,
        withdrawals: withdrawalCount,
        draw_wins: drawWinCount,
        instant_wins: instantWinCount,
      },
    };
  }

  async getOrders(operatorId: string, id: string, page = 1, limit = 20) {
    const client = await this.client(operatorId);
    await this.ensureUser(client, id);
    const { take, skip } = paginate(page, limit);

    const [rows, total] = await Promise.all([
      client.orders.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
        skip,
        take,
        select: {
          id: true,
          sub_total: true,
          discount: true,
          total: true,
          site_credit_applied: true,
          coupon_code: true,
          status: true,
          payment_method: true,
          created_at: true,
          _count: { select: { items: true, tickets: true } },
        },
      }),
      client.orders.count({ where: { user_id: id } }),
    ]);

    return {
      items: rows.map((o) => ({
        id: o.id,
        sub_total: decimal(o.sub_total),
        discount: decimal(o.discount),
        total: decimal(o.total),
        site_credit_applied: decimal(o.site_credit_applied),
        coupon_code: o.coupon_code,
        status: o.status,
        payment_method: o.payment_method,
        item_count: o._count.items,
        ticket_count: o._count.tickets,
        created_at: o.created_at.toISOString(),
      })),
      total,
      page: Math.max(page, 1),
      limit: take,
    };
  }

  async getTickets(operatorId: string, id: string, page = 1, limit = 25) {
    const client = await this.client(operatorId);
    await this.ensureUser(client, id);
    const { take, skip } = paginate(page, limit);

    const [rows, total] = await Promise.all([
      client.tickets.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
        skip,
        take,
        select: {
          id: true,
          ticket_number: true,
          status: true,
          created_at: true,
          purchased_at: true,
          raffle: { select: { id: true, title: true, slug: true, status: true } },
        },
      }),
      client.tickets.count({ where: { user_id: id } }),
    ]);

    return {
      items: rows.map((t) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        status: t.status,
        raffle_id: t.raffle.id,
        raffle_title: t.raffle.title,
        raffle_slug: t.raffle.slug,
        raffle_status: t.raffle.status,
        purchased_at: t.purchased_at?.toISOString() ?? null,
        created_at: t.created_at.toISOString(),
      })),
      total,
      page: Math.max(page, 1),
      limit: take,
    };
  }

  async getPrizes(operatorId: string, id: string, page = 1, limit = 20) {
    const client = await this.client(operatorId);
    await this.ensureUser(client, id);
    const { take, skip } = paginate(page, limit);

    const [claims, withdrawals, claimTotal, withdrawalTotal] = await Promise.all([
      client.prize_claims.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
        skip,
        take,
        select: {
          id: true,
          status: true,
          county: true,
          town: true,
          address_line: true,
          postal_code: true,
          created_at: true,
          winner: {
            select: {
              raffle: { select: { title: true } },
              prize: { select: { name: true, prize_type: true, value_kes: true } },
              ticket: { select: { ticket_number: true } },
            },
          },
          award: {
            select: {
              prize: { select: { name: true, prize_type: true, prize_value: true } },
              ticket: { select: { ticket_number: true } },
            },
          },
        },
      }),
      client.withdrawals.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          admin_note: true,
          created_at: true,
          processed_at: true,
        },
      }),
      client.prize_claims.count({ where: { user_id: id } }),
      client.withdrawals.count({ where: { user_id: id } }),
    ]);

    return {
      claims: {
        items: claims.map((c) => {
          const source = c.winner
            ? "draw"
            : c.award
              ? "instant_win"
              : "unknown";
          const prize = c.winner?.prize ?? c.award?.prize;
          const ticketNumber =
            c.winner?.ticket?.ticket_number ?? c.award?.ticket?.ticket_number ?? null;
          const raffleTitle = c.winner?.raffle?.title ?? null;
          const prizeName = prize?.name ?? "Prize";
          const prizeType = prize?.prize_type ?? null;
          const prizeValue =
            c.winner?.prize?.value_kes != null
              ? decimal(c.winner.prize.value_kes)
              : c.award?.prize?.prize_value != null
                ? decimal(c.award.prize.prize_value)
                : null;

          return {
            id: c.id,
            source,
            status: c.status,
            prize_name: prizeName,
            prize_type: prizeType,
            prize_value: prizeValue,
            raffle_title: raffleTitle,
            ticket_number: ticketNumber,
            address: [c.address_line, c.town, c.county, c.postal_code].filter(Boolean).join(", ") || null,
            created_at: c.created_at.toISOString(),
          };
        }),
        total: claimTotal,
        page: Math.max(page, 1),
        limit: take,
      },
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        amount: decimal(w.amount),
        method: w.method,
        status: w.status,
        admin_note: w.admin_note,
        created_at: w.created_at.toISOString(),
        processed_at: w.processed_at?.toISOString() ?? null,
      })),
      withdrawal_total: withdrawalTotal,
    };
  }

  async getActivity(operatorId: string, id: string, page = 1, limit = 25) {
    const client = await this.client(operatorId);
    await this.ensureUser(client, id);
    const { take, skip } = paginate(page, limit);

    const [creditRows, creditTotal, logins] = await Promise.all([
      client.site_credit_transactions.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
        skip,
        take,
        select: {
          id: true,
          amount: true,
          type: true,
          note: true,
          created_at: true,
          order_id: true,
        },
      }),
      client.site_credit_transactions.count({ where: { user_id: id } }),
      client.login_logs.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
        take: 15,
        select: {
          id: true,
          success: true,
          ip_address: true,
          created_at: true,
        },
      }),
    ]);

    return {
      site_credit: {
        items: creditRows.map((r) => ({
          id: r.id,
          amount: decimal(r.amount),
          type: r.type,
          note: r.note,
          order_id: r.order_id,
          created_at: r.created_at.toISOString(),
        })),
        total: creditTotal,
        page: Math.max(page, 1),
        limit: take,
      },
      recent_logins: logins.map((l) => ({
        id: l.id,
        success: l.success,
        ip_address: l.ip_address,
        created_at: l.created_at.toISOString(),
      })),
    };
  }

  async update(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
    input: {
      account_disabled?: boolean;
      kyc_status?: "none" | "pending" | "verified";
      spending_limit?: number | null;
      spending_limit_period?: "weekly" | "monthly" | null;
      play_safe_active?: boolean;
    },
  ) {
    const client = await this.client(operatorId);
    const existing = await client.users.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Player not found");

    if (
      input.kyc_status &&
      !["none", "pending", "verified"].includes(input.kyc_status)
    ) {
      throw new BadRequestException("Invalid KYC status");
    }

    if (
      input.spending_limit_period &&
      !["weekly", "monthly"].includes(input.spending_limit_period)
    ) {
      throw new BadRequestException("Invalid spending limit period");
    }

    const user = await client.users.update({
      where: { id },
      data: {
        account_disabled: input.account_disabled,
        kyc_status: input.kyc_status,
        spending_limit: input.spending_limit ?? undefined,
        spending_limit_period: input.spending_limit_period ?? undefined,
        play_safe_active: input.play_safe_active,
        play_safe_until:
          input.play_safe_active === false ? null : undefined,
      },
    });

    if (input.play_safe_active === true && !existing.play_safe_active) {
      if (!user.county?.trim()) {
        throw new BadRequestException(
          "Player county is required before enabling Play Safe (GRA reporting).",
        );
      }
      await queueGraPlaySafeActivated(client, {
        county: user.county,
        occurred_at: new Date().toISOString(),
      });
      void this.queue.enqueueProcessGraOutbound(operatorId);
    }

    await this.audit.log(
      operatorId,
      actor,
      "player.updated",
      "users",
      id,
      input,
    );

    return {
      id: user.id,
      account_disabled: user.account_disabled,
      kyc_status: user.kyc_status,
      spending_limit: user.spending_limit ? decimal(user.spending_limit) : null,
      spending_limit_period: user.spending_limit_period,
      play_safe_active: user.play_safe_active,
    };
  }
}
