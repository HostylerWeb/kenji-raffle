import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { queueGraTicketVoided } from "../gra/gra-outbound.service";
import { PlatformQueueService } from "../platform/platform-queue.service";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class OperatorOrdersService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
    private readonly queue: PlatformQueueService,
  ) {}

  async listOrders(operatorId: string, status?: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const rows = await client.orders.findMany({
      where: status ? { status: status as "pending" | "completed" } : undefined,
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        user: { select: { email: true, full_name: true } },
        payments: { select: { id: true, status: true, amount: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      user_email: row.user.email,
      user_name: row.user.full_name,
      sub_total: decimal(row.sub_total),
      discount: decimal(row.discount),
      total: decimal(row.total),
      coupon_code: row.coupon_code,
      status: row.status,
      payment_method: row.payment_method,
      transaction_id: row.transaction_id,
      created_at: row.created_at.toISOString(),
      payment_status: row.payments[0]?.status,
    }));
  }

  async exportOrdersCsv(operatorId: string, status?: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const rows = await client.orders.findMany({
      where: status
        ? { status: status as "pending" | "completed" | "cancelled" | "failed" | "refunded" }
        : undefined,
      orderBy: { created_at: "desc" },
      take: 5000,
      include: {
        user: { select: { email: true, full_name: true } },
        payments: { select: { status: true } },
      },
    });

    const header =
      "order_id,created_at,customer_email,customer_name,sub_total,discount,total,status,coupon_code,payment_status";
    const lines = rows.map((row) => {
      const payment = row.payments[0];
      const cols = [
        row.id,
        row.created_at.toISOString(),
        row.user.email,
        row.user.full_name ?? "",
        decimal(row.sub_total),
        decimal(row.discount),
        decimal(row.total),
        row.status,
        row.coupon_code ?? "",
        payment?.status ?? "",
      ];
      return cols
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",");
    });

    return `${header}\n${lines.join("\n")}`;
  }

  async listPayments(operatorId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const rows = await client.payments.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        user: { select: { email: true } },
        order: { select: { id: true, status: true } },
      },
    });

    return rows.map((row) => {
      const gatewayFee = decimal(row.gateway_fee_amount);
      const operatorAmount = decimal(row.operator_amount);
      return {
      id: row.id,
      order_id: row.order_id,
      user_email: row.user.email,
      amount: decimal(row.amount),
      operator_amount: operatorAmount,
      gateway_fee_rate: decimal(row.gateway_fee_rate),
      gateway_fee_amount: gatewayFee,
      operator_net: Math.max(0, operatorAmount - gatewayFee),
      tax_amount: decimal(row.tax_amount),
      tax_rate: decimal(row.tax_rate),
      status: row.status,
      payment_method: row.payment_method,
      transaction_id: row.transaction_id,
      gateway_transaction_id: row.gateway_transaction_id,
      gateway_mode: row.gateway_mode,
      created_at: row.created_at.toISOString(),
      order_status: row.order.status,
    };
    });
  }

  async refundOrder(
    actor: OperatorAuthUser,
    operatorId: string,
    orderId: string,
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const order = await client.orders.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw new NotFoundException("Order not found");
    if (order.status !== "completed") {
      throw new BadRequestException("Only completed orders can be refunded");
    }

    const payment = order.payments.find((p) => p.status === "completed");

    const orderTickets = await client.tickets.findMany({
      where: { order_id: orderId },
      include: { raffle: { select: { title: true } } },
    });

    if (orderTickets.some((t) => t.status === "winning")) {
      throw new BadRequestException("Cannot refund an order with winning tickets");
    }

    const winnerCount = await client.winners.count({
      where: { ticket_id: { in: orderTickets.map((t) => t.id) } },
    });
    if (winnerCount > 0) {
      throw new BadRequestException("Cannot refund an order after the draw");
    }

    const redemption = await client.coupon_redemptions.findFirst({
      where: { order_id: orderId },
    });

    await client.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { status: "refunded" },
      });

      if (payment) {
        await tx.payments.update({
          where: { id: payment.id },
          data: { status: "refunded" },
        });
      }

      const siteCreditApplied = decimal(order.site_credit_applied);
      if (siteCreditApplied > 0) {
        await tx.users.update({
          where: { id: order.user_id },
          data: { site_credit_balance: { increment: siteCreditApplied } },
        });
        await tx.site_credit_transactions.create({
          data: {
            user_id: order.user_id,
            order_id: orderId,
            amount: siteCreditApplied,
            type: "credit",
            note: "Refund — site credit restored",
          },
        });
      }

      if (redemption) {
        await tx.coupons.update({
          where: { id: redemption.coupon_id },
          data: { uses_count: { decrement: 1 } },
        });
        await tx.coupon_redemptions.delete({ where: { id: redemption.id } });
      }

      await tx.tickets.updateMany({
        where: { order_id: orderId },
        data: {
          status: "available",
          order_id: null,
          payment_id: null,
          user_id: null,
          purchase_price: null,
          purchased_at: null,
          session_id: null,
          reserved_until: null,
          instant_win_prize_id: null,
        },
      });
    });

    await queueGraTicketVoided(
      client,
      orderTickets.map((t) => ({
        ticket_id: t.id,
        raffle_id: t.raffle_id,
        raffle_title: t.raffle.title,
        amount: decimal(t.purchase_price ?? 0),
        purchased_at: (t.purchased_at ?? t.created_at).toISOString(),
      })),
    );

    void this.queue.enqueueProcessGraOutbound(operatorId);

    await this.audit.log(
      operatorId,
      actor,
      "order.refunded",
      "orders",
      orderId,
    );

    return { ok: true, order_id: orderId };
  }
}

@Injectable()
export class OperatorCouponsService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
  ) {}

  async list(operatorId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const rows = await client.coupons.findMany({
      orderBy: { created_at: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      discount_type: row.discount_type,
      discount_value: decimal(row.discount_value),
      min_order_amount: row.min_order_amount
        ? decimal(row.min_order_amount)
        : null,
      max_uses: row.max_uses,
      max_uses_per_user: row.max_uses_per_user,
      uses_count: row.uses_count,
      valid_from: row.valid_from?.toISOString() ?? null,
      valid_until: row.valid_until?.toISOString() ?? null,
      status: row.status,
      created_at: row.created_at.toISOString(),
    }));
  }

  async create(
    actor: OperatorAuthUser,
    operatorId: string,
    input: {
      code: string;
      discount_type: string;
      discount_value: number;
      min_order_amount?: number;
      max_uses?: number;
      max_uses_per_user?: number;
      valid_from?: string;
      valid_until?: string;
    },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const code = input.code.trim().toUpperCase();
    const row = await client.coupons.create({
      data: {
        code,
        discount_type: input.discount_type as "percent" | "fixed",
        discount_value: input.discount_value,
        min_order_amount: input.min_order_amount,
        max_uses: input.max_uses,
        max_uses_per_user: input.max_uses_per_user,
        valid_from: input.valid_from ? new Date(input.valid_from) : null,
        valid_until: input.valid_until ? new Date(input.valid_until) : null,
        status: "active",
      },
    });

    await this.audit.log(operatorId, actor, "coupon.created", "coupons", row.id);
    return { id: row.id, code: row.code };
  }

  async update(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
    input: {
      discount_value?: number;
      min_order_amount?: number;
      max_uses?: number;
      max_uses_per_user?: number;
      valid_from?: string;
      valid_until?: string;
      status?: string;
    },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const row = await client.coupons.update({
      where: { id },
      data: {
        discount_value: input.discount_value,
        min_order_amount: input.min_order_amount,
        max_uses: input.max_uses,
        max_uses_per_user: input.max_uses_per_user,
        valid_from: input.valid_from ? new Date(input.valid_from) : undefined,
        valid_until: input.valid_until ? new Date(input.valid_until) : undefined,
        status: input.status as "active" | "disabled" | undefined,
      },
    });

    await this.audit.log(operatorId, actor, "coupon.updated", "coupons", id);
    return { id: row.id, code: row.code, status: row.status };
  }

  async delete(actor: OperatorAuthUser, operatorId: string, id: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    await client.coupons.delete({ where: { id } });
    await this.audit.log(operatorId, actor, "coupon.deleted", "coupons", id);
    return { ok: true };
  }
}
