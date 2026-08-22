import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { pickRandomItems } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { fulfillPrize } from "../prizes/prize-fulfillment";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { PlatformQueueService } from "../platform/platform-queue.service";
import { paginate } from "../common/pagination";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class DrawService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
    private readonly queue: PlatformQueueService,
  ) {}

  async drawRaffle(
    tenant: TenantContext,
    actor: OperatorAuthUser,
    raffleId: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const raffle = await client.raffles.findUnique({
      where: { id: raffleId },
      include: { prizes: { orderBy: { sort_order: "asc" } } },
    });

    if (!raffle) throw new NotFoundException("Raffle not found");
    if (raffle.status !== "to_be_drawn" && raffle.status !== "active") {
      throw new BadRequestException(
        "Raffle must be active or to_be_drawn to draw",
      );
    }

    const purchased = await client.tickets.findMany({
      where: { raffle_id: raffleId, status: "purchased", user_id: { not: null } },
      select: { id: true, user_id: true, ticket_number: true },
    });

    if (purchased.length < raffle.min_tickets) {
      throw new BadRequestException(
        `Minimum ${raffle.min_tickets} tickets required; only ${purchased.length} sold`,
      );
    }

    const existingWinners = await client.winners.count({
      where: { raffle_id: raffleId },
    });
    if (existingWinners > 0) {
      throw new BadRequestException("Raffle already drawn");
    }

    const winnerCount = Math.min(raffle.number_of_winners, purchased.length);
    const winners = pickRandomItems(purchased, winnerCount);

    const created = await client.$transaction(async (tx) => {
      const rows = [];
      for (let i = 0; i < winners.length; i++) {
        const ticket = winners[i];
        if (!ticket.user_id) continue;
        const prize = raffle.prizes[i] ?? raffle.prizes[0] ?? null;

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
          await fulfillPrize(
            tx,
            ticket.user_id,
            prize.prize_type as "physical" | "cash" | "site_credit",
            prize.value_kes ? decimal(prize.value_kes) : 0,
            {
              winnerId: winner.id,
              note: `Main prize: ${prize.name}`,
            },
          );
        }

        rows.push(winner);
      }

      await tx.raffles.update({
        where: { id: raffleId },
        data: { status: "drawn" },
      });

      return rows;
    });

    await this.audit.log(
      tenant.operatorId,
      actor,
      "raffle.drawn",
      "raffles",
      raffleId,
      { winners: created.length },
    );

    await this.queue.enqueueWinnerEmails(tenant.operatorId, raffleId);

    return {
      raffle_id: raffleId,
      winners_count: created.length,
      winner_ids: created.map((w) => w.id),
    };
  }

  async autoDrawRaffle(operatorId: string, raffleId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
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

    await this.drawRaffle(
      { operatorId, slug: "", name: "", hostname: "", graRegistryId: "" },
      {
        id: "system",
        email: "system@worker",
        role: "owner",
        operatorId,
      },
      raffleId,
    );

    return { drawn: true, raffle_id: raffleId };
  }

  async listPublicWinners(tenant: TenantContext, limit = 50) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const rows = await client.winners.findMany({
      orderBy: { announced_at: "desc" },
      take: limit,
      include: {
        raffle: { select: { title: true, slug: true } },
        user: { select: { full_name: true, email: true } },
        ticket: { select: { ticket_number: true } },
        prize: { select: { name: true, prize_type: true } },
      },
    });

    return rows.map((w) => ({
      id: w.id,
      raffle_title: w.raffle.title,
      raffle_slug: w.raffle.slug,
      winner_name: w.user.full_name ?? maskEmail(w.user.email),
      ticket_number: w.ticket.ticket_number,
      prize_name: w.prize?.name ?? "Prize",
      announced_at: w.announced_at.toISOString(),
    }));
  }

  async listAdminWinners(
    operatorId: string,
    options?: { raffleId?: string; search?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.winnersWhereInput = {};
    if (options?.raffleId) where.raffle_id = options.raffleId;
    if (options?.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { full_name: { contains: q, mode: "insensitive" } } },
        { raffle: { title: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [rows, total] = await Promise.all([
      client.winners.findMany({
        where,
        orderBy: { announced_at: "desc" },
        skip,
        take,
        include: {
          raffle: { select: { id: true, title: true } },
          user: { select: { id: true, email: true, full_name: true } },
          ticket: { select: { ticket_number: true } },
          prize: { select: { name: true } },
        },
      }),
      client.winners.count({ where }),
    ]);

    return {
      items: rows.map((w) => ({
        id: w.id,
        raffle_id: w.raffle_id,
        raffle_title: w.raffle.title,
        user_id: w.user.id,
        user_email: w.user.email,
        user_name: w.user.full_name,
        ticket_number: w.ticket.ticket_number,
        prize_name: w.prize?.name,
        announced_at: w.announced_at.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async listPrizeClaims(
    operatorId: string,
    options?: { status?: string; search?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.prize_claimsWhereInput = {};
    if (options?.status) {
      where.status = options.status as Prisma.prize_claimsWhereInput["status"];
    }
    if (options?.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { full_name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [rows, total] = await Promise.all([
      client.prize_claims.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: this.claimInclude(),
      }),
      client.prize_claims.count({ where }),
    ]);

    return {
      items: rows.map((c) => this.serializeClaim(c)),
      total,
      page,
      limit,
    };
  }

  async getPrizeClaim(operatorId: string, claimId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const claim = await client.prize_claims.findUnique({
      where: { id: claimId },
      include: {
        ...this.claimInclude(),
        withdrawals: { orderBy: { created_at: "desc" } },
      },
    });
    if (!claim) throw new NotFoundException("Claim not found");
    return this.serializeClaim(claim, true);
  }

  private claimInclude() {
    return {
      user: { select: { id: true, email: true, full_name: true, phone: true } },
      withdrawals: {
        orderBy: { created_at: "desc" as const },
        take: 1,
      },
      winner: {
        include: {
          raffle: { select: { id: true, title: true, slug: true } },
          prize: { select: { name: true, prize_type: true, value_kes: true } },
          ticket: { select: { ticket_number: true } },
        },
      },
      award: {
        include: {
          prize: { select: { name: true, prize_type: true, prize_value: true } },
          ticket: { select: { ticket_number: true } },
        },
      },
    };
  }

  private serializeClaim(
    c: {
      id: string;
      status: string;
      county: string | null;
      town: string | null;
      address_line: string | null;
      postal_code: string | null;
      created_at: Date;
      updated_at: Date;
      user: { id: string; email: string; full_name: string | null; phone: string | null };
      withdrawals: {
        id: string;
        status: string;
        method: string;
        amount: Prisma.Decimal;
        account_name?: string | null;
        account_number?: string | null;
        bank_name?: string | null;
        admin_note?: string | null;
        created_at?: Date;
        processed_at?: Date | null;
      }[];
      winner: {
        raffle: { id: string; title: string; slug: string };
        prize: { name: string; prize_type: string; value_kes: Prisma.Decimal | null } | null;
        ticket: { ticket_number: number };
      } | null;
      award: {
        prize: { name: string; prize_type: string; prize_value: Prisma.Decimal };
        ticket: { ticket_number: number };
      } | null;
    },
    includeAllWithdrawals = false,
  ) {
    const prizeType =
      c.winner?.prize?.prize_type ?? c.award?.prize.prize_type ?? "physical";
    const prizeValue =
      c.winner?.prize?.value_kes ?? c.award?.prize.prize_value;
    const withdrawal = c.withdrawals[0];

    return {
      id: c.id,
      user_id: c.user.id,
      status: c.status,
      prize_type: prizeType,
      prize_value: prizeValue ? decimal(prizeValue) : null,
      user_email: c.user.email,
      user_name: c.user.full_name,
      user_phone: c.user.phone,
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
            account_name: withdrawal.account_name ?? null,
            account_number: withdrawal.account_number ?? null,
            bank_name: withdrawal.bank_name ?? null,
            admin_note: withdrawal.admin_note ?? null,
            created_at: withdrawal.created_at?.toISOString(),
            processed_at: withdrawal.processed_at?.toISOString() ?? null,
          }
        : null,
      withdrawals: includeAllWithdrawals
        ? c.withdrawals.map((w) => ({
            id: w.id,
            status: w.status,
            method: w.method,
            amount: decimal(w.amount),
            account_name: w.account_name ?? null,
            account_number: w.account_number ?? null,
            bank_name: w.bank_name ?? null,
            admin_note: w.admin_note ?? null,
            created_at: w.created_at?.toISOString(),
            processed_at: w.processed_at?.toISOString() ?? null,
          }))
        : undefined,
      source: c.winner
        ? `Main prize — ${c.winner.raffle.title}`
        : `Instant win — ${c.award?.prize.name}`,
      prize_name: c.winner?.prize?.name ?? c.award?.prize.name,
      raffle_id: c.winner?.raffle.id ?? null,
      raffle_title: c.winner?.raffle.title ?? null,
      raffle_slug: c.winner?.raffle.slug ?? null,
      ticket_number:
        c.winner?.ticket?.ticket_number ?? c.award?.ticket.ticket_number ?? null,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
    };
  }

  async updatePrizeClaim(
    operatorId: string,
    claimId: string,
    status: "pending" | "shipped" | "delivered",
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const claim = await client.prize_claims.findUnique({ where: { id: claimId } });
    if (!claim) throw new NotFoundException("Claim not found");

    const updated = await client.prize_claims.update({
      where: { id: claimId },
      data: { status },
    });

    return {
      id: updated.id,
      status: updated.status,
      updated_at: updated.updated_at.toISOString(),
    };
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}
