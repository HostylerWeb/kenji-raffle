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
import { paginate } from "../common/pagination";

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

  async listOrders(
    operatorId: string,
    options?: { status?: string; search?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.ordersWhereInput = {};
    if (options?.status) {
      where.status = options.status as Prisma.ordersWhereInput["status"];
    }
    if (options?.search?.trim()) {
      const q = options.search.trim();
      const uuidLike = /^[0-9a-f-]{8,}$/i.test(q);
      where.OR = [
        ...(uuidLike ? [{ id: q }] : []),
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { full_name: { contains: q, mode: "insensitive" } } },
        { transaction_id: { contains: q, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      client.orders.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        select: {
          id: true,
          sub_total: true,
          discount: true,
          total: true,
          coupon_code: true,
          site_credit_applied: true,
          status: true,
          payment_method: true,
          transaction_id: true,
          created_at: true,
          user: { select: { id: true, email: true, full_name: true } },
          payments: { select: { status: true }, take: 1, orderBy: { created_at: "desc" } },
        },
      }),
      client.orders.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        user_id: row.user.id,
        user_email: row.user.email,
        user_name: row.user.full_name,
        sub_total: decimal(row.sub_total),
        discount: decimal(row.discount),
        total: decimal(row.total),
        site_credit_applied: decimal(row.site_credit_applied),
        coupon_code: row.coupon_code,
        status: row.status,
        payment_method: row.payment_method,
        transaction_id: row.transaction_id,
        created_at: row.created_at.toISOString(),
        payment_status: row.payments[0]?.status,
      })),
      total,
      page,
      limit,
    };
  }

  async getOrder(operatorId: string, orderId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const order = await client.orders.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, email: true, full_name: true, phone: true, county: true },
        },
        items: {
          include: {
            raffle: { select: { id: true, title: true, slug: true } },
          },
        },
        payments: { orderBy: { created_at: "desc" } },
        tickets: {
          select: {
            id: true,
            ticket_number: true,
            status: true,
            raffle_id: true,
            raffle: { select: { title: true, slug: true } },
          },
          orderBy: { ticket_number: "asc" },
        },
      },
    });

    if (!order) throw new NotFoundException("Order not found");

    return {
      id: order.id,
      status: order.status,
      sub_total: decimal(order.sub_total),
      discount: decimal(order.discount),
      total: decimal(order.total),
      site_credit_applied: decimal(order.site_credit_applied),
      coupon_code: order.coupon_code,
      payment_method: order.payment_method,
      transaction_id: order.transaction_id,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      customer: {
        id: order.user.id,
        email: order.user.email,
        full_name: order.user.full_name,
        phone: order.user.phone,
        county: order.user.county,
      },
      items: order.items.map((item) => ({
        id: item.id,
        raffle_id: item.raffle_id,
        raffle_title: item.raffle.title,
        raffle_slug: item.raffle.slug,
        quantity: item.quantity,
        unit_price: decimal(item.unit_price),
        subtotal: decimal(item.subtotal),
        discount: decimal(item.discount),
        total: decimal(item.total),
        ticket_numbers: item.ticket_numbers,
      })),
      tickets: order.tickets.map((t) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        status: t.status,
        raffle_id: t.raffle_id,
        raffle_title: t.raffle.title,
        raffle_slug: t.raffle.slug,
      })),
      payments: order.payments.map((p) => ({
        id: p.id,
        amount: decimal(p.amount),
        operator_amount: decimal(p.operator_amount),
        tax_amount: decimal(p.tax_amount),
        tax_rate: decimal(p.tax_rate),
        gateway_fee_amount: decimal(p.gateway_fee_amount),
        status: p.status,
        payment_method: p.payment_method,
        transaction_id: p.transaction_id,
        gateway_transaction_id: p.gateway_transaction_id,
        gateway_mode: p.gateway_mode,
        created_at: p.created_at.toISOString(),
      })),
    };
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

  async listPayments(
    operatorId: string,
    options?: { search?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.paymentsWhereInput = {};
    if (options?.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { transaction_id: { contains: q, mode: "insensitive" } },
        { gateway_transaction_id: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const completedWhere: Prisma.paymentsWhereInput = { ...where, status: "completed" };

    const [rows, total, agg, completedCount] = await Promise.all([
      client.payments.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: {
          user: { select: { id: true, email: true } },
          order: { select: { id: true, status: true } },
        },
      }),
      client.payments.count({ where }),
      client.payments.aggregate({
        where: completedWhere,
        _sum: {
          amount: true,
          operator_amount: true,
          gateway_fee_amount: true,
          tax_amount: true,
        },
      }),
      client.payments.count({ where: completedWhere }),
    ]);

    const operatorShare = decimal(agg._sum.operator_amount ?? 0);
    const gatewayFees = decimal(agg._sum.gateway_fee_amount ?? 0);

    return {
      items: rows.map((row) => {
        const gatewayFee = decimal(row.gateway_fee_amount);
        const operatorAmount = decimal(row.operator_amount);
        return {
          id: row.id,
          order_id: row.order_id,
          user_id: row.user_id,
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
      }),
      total,
      page,
      limit,
      summary: {
        completed_count: completedCount,
        gross: decimal(agg._sum.amount ?? 0),
        operator_net: Math.max(0, operatorShare - gatewayFees),
        gateway_fees: gatewayFees,
        tax_collected: decimal(agg._sum.tax_amount ?? 0),
      },
    };
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

  async list(
    operatorId: string,
    options?: { search?: string; status?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.couponsWhereInput = {};
    if (options?.search?.trim()) {
      where.code = { contains: options.search.trim(), mode: "insensitive" };
    }
    if (options?.status) {
      where.status = options.status as Prisma.couponsWhereInput["status"];
    }

    const [rows, total] = await Promise.all([
      client.coupons.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      client.coupons.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
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
      })),
      total,
      page,
      limit,
    };
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
