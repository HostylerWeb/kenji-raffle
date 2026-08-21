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

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class OperatorPlayersService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
    private readonly queue: PlatformQueueService,
  ) {}

  async list(
    operatorId: string,
    search?: string,
    page = 1,
    limit = 50,
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const take = Math.min(limit, 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const where: Prisma.usersWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { full_name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
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
        kyc_document_url: u.kyc_document_url,
        account_disabled: u.account_disabled,
        last_login_at: u.last_login_at?.toISOString() ?? null,
        created_at: u.created_at.toISOString(),
      })),
      total,
      page: Math.max(page, 1),
      limit: take,
    };
  }

  async get(operatorId: string, id: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const user = await client.users.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { created_at: "desc" },
          take: 10,
          select: {
            id: true,
            total: true,
            status: true,
            created_at: true,
          },
        },
        prize_claims: {
          orderBy: { created_at: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            created_at: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException("Player not found");

    const recentTickets = await client.tickets.findMany({
      where: {
        user_id: id,
        status: { in: ["purchased", "winning"] },
      },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        raffle: { select: { title: true, slug: true } },
      },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      county: user.county,
      site_credit_balance: decimal(user.site_credit_balance),
      kyc_status: user.kyc_status,
      kyc_document_url: user.kyc_document_url,
      account_disabled: user.account_disabled,
      play_safe_active: user.play_safe_active,
      play_safe_until: user.play_safe_until?.toISOString() ?? null,
      spending_limit: user.spending_limit ? decimal(user.spending_limit) : null,
      spending_limit_period: user.spending_limit_period,
      last_login_at: user.last_login_at?.toISOString() ?? null,
      created_at: user.created_at.toISOString(),
      recent_orders: user.orders.map((o) => ({
        id: o.id,
        total: decimal(o.total),
        status: o.status,
        created_at: o.created_at.toISOString(),
      })),
      recent_claims: user.prize_claims.map((c) => ({
        id: c.id,
        status: c.status,
        created_at: c.created_at.toISOString(),
      })),
      recent_tickets: recentTickets.map((t) => ({
        id: t.id,
        raffle_title: t.raffle.title,
        raffle_slug: t.raffle.slug,
        ticket_number: t.ticket_number,
        status: t.status,
        created_at: t.created_at.toISOString(),
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
    const client = await this.tenantConnection.getClient(operatorId);
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
