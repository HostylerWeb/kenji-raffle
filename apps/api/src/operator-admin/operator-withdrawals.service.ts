import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OperatorAuthUser } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { paginate } from "../common/pagination";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class OperatorWithdrawalsService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
  ) {}

  async listWithdrawals(
    operatorId: string,
    options?: { status?: string; search?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.withdrawalsWhereInput = {};
    if (options?.status) {
      where.status = options.status as Prisma.withdrawalsWhereInput["status"];
    }
    if (options?.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { full_name: { contains: q, mode: "insensitive" } } },
        { account_number: { contains: q, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      client.withdrawals.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: {
          user: { select: { email: true, full_name: true } },
          claim: {
            include: {
              winner: {
                include: {
                  raffle: { select: { title: true } },
                  prize: { select: { name: true } },
                },
              },
              award: {
                include: {
                  prize: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      client.withdrawals.count({ where }),
    ]);

    return {
      items: rows.map((w) => ({
      id: w.id,
      user_id: w.user_id,
      user_email: w.user.email,
      user_name: w.user.full_name,
      amount: decimal(w.amount),
      method: w.method,
      account_name: w.account_name,
      account_number: w.account_number,
      bank_name: w.bank_name,
      status: w.status,
      admin_note: w.admin_note,
      processed_at: w.processed_at?.toISOString() ?? null,
      created_at: w.created_at.toISOString(),
      prize_name:
        w.claim?.winner?.prize?.name ??
        w.claim?.award?.prize?.name ??
        null,
      source: w.claim?.winner
        ? `Main prize — ${w.claim.winner.raffle.title}`
        : w.claim?.award
          ? `Instant win — ${w.claim.award.prize.name}`
          : "Site credit",
      })),
      total,
      page,
      limit,
    };
  }

  async getWithdrawal(operatorId: string, id: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const w = await client.withdrawals.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
            county: true,
            site_credit_balance: true,
          },
        },
        claim: {
          include: {
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
          },
        },
      },
    });
    if (!w) throw new NotFoundException("Withdrawal not found");

    const prizeName =
      w.claim?.winner?.prize?.name ?? w.claim?.award?.prize?.name ?? null;
    const prizeType =
      w.claim?.winner?.prize?.prize_type ?? w.claim?.award?.prize?.prize_type ?? null;
    const prizeValue = w.claim?.winner?.prize?.value_kes ?? w.claim?.award?.prize?.prize_value;

    return {
      id: w.id,
      user_id: w.user_id,
      prize_claim_id: w.prize_claim_id,
      user_email: w.user.email,
      user_name: w.user.full_name,
      user_phone: w.user.phone,
      user_county: w.user.county,
      site_credit_balance: decimal(w.user.site_credit_balance),
      amount: decimal(w.amount),
      method: w.method,
      account_name: w.account_name,
      account_number: w.account_number,
      bank_name: w.bank_name,
      status: w.status,
      admin_note: w.admin_note,
      processed_at: w.processed_at?.toISOString() ?? null,
      created_at: w.created_at.toISOString(),
      updated_at: w.updated_at.toISOString(),
      prize_name: prizeName,
      prize_type: prizeType,
      prize_value: prizeValue ? decimal(prizeValue) : null,
      source: w.claim?.winner
        ? `Main prize — ${w.claim.winner.raffle.title}`
        : w.claim?.award
          ? `Instant win — ${w.claim.award.prize.name}`
          : "Site credit",
      raffle_id: w.claim?.winner?.raffle.id ?? null,
      raffle_title: w.claim?.winner?.raffle.title ?? null,
      raffle_slug: w.claim?.winner?.raffle.slug ?? null,
      ticket_number:
        w.claim?.winner?.ticket.ticket_number ??
        w.claim?.award?.ticket.ticket_number ??
        null,
      claim_status: w.claim?.status ?? null,
    };
  }

  async updateWithdrawal(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
    input: {
      status: "approved" | "paid" | "rejected";
      admin_note?: string;
    },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const withdrawal = await client.withdrawals.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!withdrawal) throw new NotFoundException("Withdrawal not found");

    if (withdrawal.status === "paid" || withdrawal.status === "rejected") {
      throw new BadRequestException("Withdrawal is already finalized");
    }

    const amount = decimal(withdrawal.amount);

    if (input.status === "approved" && withdrawal.status === "pending") {
      if (!withdrawal.prize_claim_id) {
        const balance = decimal(withdrawal.user.site_credit_balance);
        if (balance < amount) {
          throw new BadRequestException("Insufficient site credit balance");
        }

        await client.$transaction(async (tx) => {
          await tx.users.update({
            where: { id: withdrawal.user_id },
            data: { site_credit_balance: { decrement: amount } },
          });
          await tx.site_credit_transactions.create({
            data: {
              user_id: withdrawal.user_id,
              amount: amount,
              type: "debit",
              note: `Withdrawal ${id} approved`,
            },
          });
          await tx.withdrawals.update({
            where: { id },
            data: {
              status: "approved",
              admin_note: input.admin_note,
            },
          });
        });
      } else {
        await client.withdrawals.update({
          where: { id },
          data: {
            status: "approved",
            admin_note: input.admin_note,
          },
        });
      }
    } else if (input.status === "paid") {
      if (withdrawal.status !== "approved") {
        throw new BadRequestException(
          "Only approved withdrawals can be marked paid",
        );
      }
      await client.withdrawals.update({
        where: { id },
        data: {
          status: "paid",
          admin_note: input.admin_note,
          processed_at: new Date(),
        },
      });
    } else if (input.status === "rejected") {
      await client.withdrawals.update({
        where: { id },
        data: {
          status: "rejected",
          admin_note: input.admin_note,
          processed_at: new Date(),
        },
      });
    } else {
      throw new BadRequestException("Invalid status transition");
    }

    await this.audit.log(
      operatorId,
      actor,
      "withdrawal.updated",
      "withdrawals",
      id,
      input,
    );

    const updated = await client.withdrawals.findUnique({ where: { id } });
    return {
      id,
      status: updated?.status,
      admin_note: updated?.admin_note,
      processed_at: updated?.processed_at?.toISOString() ?? null,
    };
  }
}
