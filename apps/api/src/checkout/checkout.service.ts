import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { CartService } from "../cart/cart.service";
import { EmailService } from "../email/email.service";
import { CheckoutPolicyService } from "./checkout-policy.service";
import { evaluateInstantWinsForTickets } from "../instant-win/instant-win.service";
import {
  queueGraEventsForOrder,
  queueGraPaymentFailed,
} from "../gra/gra-outbound.service";
import { assertCheckoutTicketLimits } from "../cart/ticket-limits.helper";
import { assertRaffleOpenForPurchase } from "../cart/raffle-purchase.helper";
import {
  checkoutPendingExpiresAt,
  extendTicketReservations,
  releaseTicketsByNumbers,
} from "../cart/cart-tickets.helper";
import { PlatformQueueService } from "../platform/platform-queue.service";
import type { GatewayCallbackPayload } from "./checkout-gateway.helper";
import {
  estimateGatewayFee,
  verifyGatewayCallbackSignature,
} from "./checkout-gateway.helper";
import {
  allocateTicketPricesByWeight,
  splitTaxInclusive,
  ticketWeightsForOrder,
} from "./checkout-pricing.helper";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

function parseTicketNumbers(json: Prisma.JsonValue): number[] {
  if (!Array.isArray(json)) return [];
  return json.filter((n) => typeof n === "number") as number[];
}

function paymentRedirectUrl(
  orderId: string,
  total: number,
  tenantHost?: string,
): string | null {
  const base = process.env.HARAMBE_GATEWAY_URL?.trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    url.searchParams.set("order_id", orderId);
    url.searchParams.set("amount", String(total));
    if (tenantHost) {
      url.searchParams.set("tenant_host", tenantHost);
    }
    return url.toString();
  } catch {
    return null;
  }
}

type CompletePaymentOptions = {
  source?: "mock" | "live_callback" | "internal";
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayFeeRate?: number;
  gatewayFeeAmount?: number;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly platformPrisma: PlatformPrismaService,
    private readonly cartService: CartService,
    private readonly email: EmailService,
    private readonly policy: CheckoutPolicyService,
    private readonly queue: PlatformQueueService,
  ) {}

  async checkout(
    tenant: TenantContext,
    player: PlayerAuthUser,
    sessionId: string,
    couponCode?: string,
    applySiteCredit?: boolean,
  ) {
    await this.policy.assertCheckoutEnabled(tenant.operatorId);

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const user = await client.users.findUnique({ where: { id: player.id } });
    if (!user) throw new NotFoundException("User not found");

    const pendingOrder = await client.orders.findFirst({
      where: { user_id: player.id, status: "pending" },
      select: { id: true },
    });
    if (pendingOrder) {
      throw new BadRequestException(
        "You already have a pending order — complete or cancel payment first",
      );
    }

    const cart = await this.cartService.getCart(tenant, sessionId, player);
    if (cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    const cartRows = await client.cart_items.findMany({
      where: {
        OR: [
          { session_id: sessionId, expires_at: { gt: new Date() } },
          { user_id: player.id, expires_at: { gt: new Date() } },
        ],
      },
    });

    await assertCheckoutTicketLimits(
      client,
      player.id,
      cartRows.map((r) => ({
        raffle_id: r.raffle_id,
        ticket_quantity: r.ticket_quantity,
      })),
    );

    const raffleIds = [...new Set(cartRows.map((r) => r.raffle_id))];
    const raffles = await client.raffles.findMany({
      where: { id: { in: raffleIds } },
    });
    const raffleById = new Map(raffles.map((r) => [r.id, r]));
    for (const row of cartRows) {
      const raffle = raffleById.get(row.raffle_id);
      if (!raffle) {
        throw new BadRequestException("A raffle in your cart is no longer available");
      }
      assertRaffleOpenForPurchase(raffle);
    }

    let discount = 0;
    let couponId: string | null = null;
    let appliedCode: string | null = null;

    if (couponCode) {
      const coupon = await this.cartService.validateCoupon(
        tenant,
        couponCode,
        cart.subtotal,
        player.id,
      );
      discount = coupon.discount_amount;
      couponId = coupon.coupon_id;
      appliedCode = coupon.code;
    }

    const subTotal = cart.subtotal;
    let total = Math.max(0, subTotal - discount);

    let siteCreditApplied = 0;
    if (applySiteCredit) {
      const balance = decimal(user.site_credit_balance);
      siteCreditApplied = Math.min(balance, total);
      total = Math.max(0, total - siteCreditApplied);
    }

    await this.policy.assertUserCanPurchase(user, client, total);

    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: tenant.operatorId },
    });
    if (!operator) throw new NotFoundException("Operator not found");

    const taxRate = Number(operator.default_tax_rate);
    const { taxAmount, operatorAmount } = splitTaxInclusive(total, taxRate);

    const paymentMode = process.env.HARAMBE_PAYMENT_MODE ?? "mock";
    const gatewayMode = paymentMode === "live" ? "live" : "mock";

    await client.cart_items.updateMany({
      where: {
        session_id: sessionId,
        expires_at: { gt: new Date() },
      },
      data: { user_id: player.id },
    });

    const cartItemIds = cartRows.map((r) => r.id);
    const cartRowsForOrder = await client.cart_items.findMany({
      where: {
        id: { in: cartItemIds },
        expires_at: { gt: new Date() },
      },
    });

    if (cartRowsForOrder.length !== cartItemIds.length) {
      throw new BadRequestException("Cart changed during checkout — please try again");
    }

    const paymentHoldUntil = checkoutPendingExpiresAt();

    const expectedTicketCount = cartRowsForOrder.reduce(
      (sum, row) => sum + row.ticket_quantity,
      0,
    );

    const order = await client.orders.create({
      data: {
        user_id: player.id,
        sub_total: subTotal,
        discount,
        total,
        site_credit_applied: siteCreditApplied,
        coupon_code: appliedCode,
        coupon_id: couponId,
        status: "pending",
        payment_method: gatewayMode === "live" ? "card" : "mock",
      },
    });

    for (const item of cartRowsForOrder) {
      const numbers = parseTicketNumbers(item.ticket_numbers);
      if (numbers.length !== item.ticket_quantity) {
        throw new BadRequestException("Cart ticket reservation is incomplete");
      }

      await client.order_items.create({
        data: {
          order_id: order.id,
          raffle_id: item.raffle_id,
          quantity: item.ticket_quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          discount: decimal(item.discount_amount),
          total: decimal(item.final_amount),
          ticket_numbers: numbers,
        },
      });

      await extendTicketReservations(
        client,
        item.raffle_id,
        numbers,
        player.id,
        paymentHoldUntil,
      );
    }

    await client.cart_items.deleteMany({
      where: { id: { in: cartItemIds } },
    });

    const payment = await client.payments.create({
      data: {
        order_id: order.id,
        user_id: player.id,
        amount: total,
        operator_amount: operatorAmount,
        tax_amount: taxAmount,
        tax_rate: taxRate,
        payment_method: gatewayMode === "live" ? "card" : "mock",
        status: "pending",
        gateway_mode: gatewayMode,
      },
    });

    if (total === 0) {
      return this.completePayment(tenant, player, order.id, {
        source: "internal",
      });
    }

    const feePreview = estimateGatewayFee(total, operatorAmount);

    return {
      order_id: order.id,
      payment_id: payment.id,
      sub_total: subTotal,
      discount,
      site_credit_applied: siteCreditApplied,
      total,
      tax_amount: taxAmount,
      operator_amount: operatorAmount,
      tax_rate: taxRate,
      estimated_gateway_fee_rate: feePreview.gateway_fee_rate,
      estimated_gateway_fee_amount: feePreview.gateway_fee_amount,
      estimated_operator_net: feePreview.operator_net,
      ticket_count: expectedTicketCount,
      gateway_display_name:
        process.env.HARAMBE_PAYMENT_DISPLAY_NAME ?? "Harambe Payment Gateway",
      gateway_mode: gatewayMode,
      requires_external_payment: total > 0 && gatewayMode === "live",
      payment_redirect_url:
        gatewayMode === "live"
          ? paymentRedirectUrl(order.id, total, tenant.hostname)
          : null,
    };
  }

  async completeMockPayment(
    tenant: TenantContext,
    player: PlayerAuthUser,
    orderId: string,
  ) {
    return this.completePayment(tenant, player, orderId, { source: "mock" });
  }

  async completePayment(
    tenant: TenantContext,
    player: PlayerAuthUser,
    orderId: string,
    options: CompletePaymentOptions = {},
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);

    const order = await client.orders.findUnique({
      where: { id: orderId },
      include: { payments: true, items: true },
    });

    if (!order || order.user_id !== player.id) {
      throw new NotFoundException("Order not found");
    }
    if (order.status === "completed") {
      return this.orderConfirmation(client, order.id);
    }
    if (order.status !== "pending") {
      throw new BadRequestException("Order cannot be paid");
    }

    const payment = order.payments.find((p) => p.status === "pending");
    if (!payment) {
      throw new BadRequestException("No pending payment for order");
    }

    const source = options.source ?? "internal";
    if (source === "mock" && payment.gateway_mode !== "mock") {
      throw new BadRequestException("Mock payment is not allowed for live orders");
    }
    if (source === "live_callback" && payment.gateway_mode !== "live") {
      throw new BadRequestException("Live callback is not allowed for mock orders");
    }

    const siteCreditApplied = decimal(order.site_credit_applied);
    const cashTotal = decimal(order.total);
    const subTotal = decimal(order.sub_total);
    const orderDiscount = decimal(order.discount);

    const orderLines = order.items.map((item) => ({
      raffleId: item.raffle_id,
      ticketNumbers: parseTicketNumbers(item.ticket_numbers),
      lineTotal: decimal(item.total),
      quantity: item.quantity,
    }));

    for (const line of orderLines) {
      if (line.ticketNumbers.length !== line.quantity) {
        throw new BadRequestException(
          "Order is missing reserved ticket numbers — please checkout again",
        );
      }
    }

    const expectedTicketCount = orderLines.reduce(
      (sum, line) => sum + line.quantity,
      0,
    );
    if (expectedTicketCount === 0) {
      throw new BadRequestException("Order has no tickets");
    }

    const weights = ticketWeightsForOrder({
      lines: orderLines,
      subTotal,
      orderDiscount,
    });
    const priceByTicket = allocateTicketPricesByWeight(weights, cashTotal);
    const purchasedAt = new Date();

    const purchasedTicketIds: string[] = [];

    await client.$transaction(async (tx) => {
      if (siteCreditApplied > 0) {
        const freshUser = await tx.users.findUnique({ where: { id: player.id } });
        if (!freshUser || decimal(freshUser.site_credit_balance) < siteCreditApplied) {
          throw new BadRequestException("Insufficient site credit balance");
        }
        await tx.users.update({
          where: { id: player.id },
          data: { site_credit_balance: { decrement: siteCreditApplied } },
        });
        await tx.site_credit_transactions.create({
          data: {
            user_id: player.id,
            order_id: order.id,
            amount: siteCreditApplied,
            type: "debit",
            note: "Applied at checkout",
          },
        });
      }

      const txnId =
        options.transactionId ??
        (payment.gateway_mode === "live"
          ? `live-${Date.now()}`
          : `mock-${Date.now()}`);

      const orderUpdate = await tx.orders.updateMany({
        where: { id: order.id, status: "pending" },
        data: { status: "completed", transaction_id: txnId },
      });
      if (orderUpdate.count === 0) {
        throw new BadRequestException("Order was already processed");
      }

      await tx.payments.update({
        where: { id: payment.id },
        data: {
          status: "completed",
          transaction_id: txnId,
          gateway_transaction_id: options.gatewayTransactionId ?? undefined,
          gateway_fee_rate: options.gatewayFeeRate ?? 0,
          gateway_fee_amount: options.gatewayFeeAmount ?? 0,
        },
      });

      for (const line of orderLines) {
        for (const ticketNumber of line.ticketNumbers) {
          const priceKey = `${line.raffleId}:${ticketNumber}`;
          const purchasePrice = priceByTicket.get(priceKey) ?? 0;

          const updated = await tx.tickets.updateMany({
            where: {
              raffle_id: line.raffleId,
              ticket_number: ticketNumber,
              status: "reserved",
            },
            data: {
              status: "purchased",
              user_id: player.id,
              order_id: order.id,
              payment_id: payment.id,
              purchase_price: purchasePrice,
              purchased_at: purchasedAt,
              session_id: null,
              reserved_until: null,
            },
          });

          if (updated.count !== 1) {
            throw new BadRequestException(
              "One or more reserved tickets are no longer available",
            );
          }

          const ticket = await tx.tickets.findFirst({
            where: {
              raffle_id: line.raffleId,
              ticket_number: ticketNumber,
              order_id: order.id,
            },
            select: { id: true },
          });
          if (ticket) {
            purchasedTicketIds.push(ticket.id);
          }
        }
      }

      if (purchasedTicketIds.length !== expectedTicketCount) {
        throw new BadRequestException("Ticket purchase count mismatch");
      }

      if (order.coupon_id) {
        await tx.coupons.update({
          where: { id: order.coupon_id },
          data: { uses_count: { increment: 1 } },
        });
        await tx.coupon_redemptions.create({
          data: {
            coupon_id: order.coupon_id,
            user_id: player.id,
            order_id: order.id,
          },
        });
      }

      await tx.cart_items.deleteMany({
        where: { user_id: player.id },
      });
    });

    const instantWins = await evaluateInstantWinsForTickets(
      client,
      player.id,
      purchasedTicketIds,
    );

    const purchasedTickets = await client.tickets.findMany({
      where: { id: { in: purchasedTicketIds } },
      include: { raffle: { select: { title: true, id: true } } },
    });

    const graTicketSum = purchasedTickets.reduce(
      (sum, t) => sum + decimal(t.purchase_price ?? 0),
      0,
    );
    if (cashTotal > 0 && Math.abs(graTicketSum - cashTotal) > 0.02) {
      throw new InternalServerErrorException(
        `Ticket pricing mismatch (${graTicketSum} vs ${cashTotal}) — contact support`,
      );
    }

    await queueGraEventsForOrder(client, {
      order_id: order.id,
      total: cashTotal,
      tax_amount: decimal(payment.tax_amount),
      operator_amount: decimal(payment.operator_amount),
      tax_rate: decimal(payment.tax_rate),
      payment_id: payment.id,
      payment_method: payment.payment_method,
      completed_at: purchasedAt.toISOString(),
      tickets: purchasedTickets.map((t) => ({
        ticket_id: t.id,
        ticket_number: t.ticket_number,
        raffle_id: t.raffle_id,
        raffle_title: t.raffle.title,
        amount: decimal(t.purchase_price ?? 0),
        purchased_at: (t.purchased_at ?? purchasedAt).toISOString(),
      })),
    });

    const confirmation = await this.orderConfirmation(client, order.id);
    confirmation.instant_wins = instantWins;

    const supportEmail = await this.policy.getSupportEmail(tenant.operatorId);

    await this.email.sendOrderConfirmation(
      tenant,
      player.email,
      {
        order_id: confirmation.order_id,
        total: confirmation.total,
        tickets: confirmation.tickets,
        instant_wins: instantWins,
      },
      supportEmail,
    );

    if (supportEmail) {
      await this.email.sendOperatorOrderAlert(tenant, supportEmail, {
        order_id: order.id,
        total: cashTotal,
        customer_email: player.email,
      });
    }

    void import("@kenji-raffle/database-platform").then(({ runRollupForOperator }) =>
      runRollupForOperator(tenant.operatorId).catch(() => undefined),
    );

    void this.queue.enqueueProcessGraOutbound(tenant.operatorId);

    return confirmation;
  }

  async failPayment(tenant: TenantContext, player: PlayerAuthUser, orderId: string) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const order = await client.orders.findUnique({
      where: { id: orderId },
      include: { payments: true, items: true },
    });

    if (!order || order.user_id !== player.id) {
      throw new NotFoundException("Order not found");
    }

    if (order.status === "completed") {
      return { ok: true, order_id: orderId, already_completed: true };
    }
    if (order.status !== "pending") {
      return { ok: true, order_id: orderId, skipped: true };
    }

    const payment = order.payments.find((p) => p.status === "pending");

    await client.orders.updateMany({
      where: { id: orderId, status: "pending" },
      data: { status: "failed" },
    });

    if (payment) {
      await client.payments.updateMany({
        where: { id: payment.id, status: "pending" },
        data: { status: "failed" },
      });
    }

    for (const item of order.items) {
      const numbers = parseTicketNumbers(item.ticket_numbers);
      if (numbers.length > 0) {
        await releaseTicketsByNumbers(client, item.raffle_id, numbers);
      }
    }

    if (payment) {
      await queueGraPaymentFailed(client, {
        order_id: orderId,
        payment_id: payment.id,
        amount: decimal(payment.amount),
        payment_method: payment.payment_method,
        reason: "payment_failed",
      });
      void this.queue.enqueueProcessGraOutbound(tenant.operatorId);
    }

    const supportEmail = await this.policy.getSupportEmail(tenant.operatorId);
    await this.email.sendPaymentFailed(
      tenant,
      player.email,
      orderId,
      supportEmail,
    );
    return { ok: true, order_id: orderId };
  }

  async handleGatewayCallback(
    tenant: TenantContext,
    payload: GatewayCallbackPayload,
    signature: string | undefined,
  ) {
    const mode = process.env.HARAMBE_PAYMENT_MODE ?? "mock";
    if (mode !== "live") {
      return { ok: false, reason: "live_mode_disabled" };
    }

    const secret = process.env.HARAMBE_CALLBACK_SECRET?.trim();
    if (!verifyGatewayCallbackSignature(signature, secret)) {
      return { ok: false, reason: "invalid_signature" };
    }

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const order = await client.orders.findUnique({
      where: { id: payload.order_id },
      include: { payments: true },
    });
    if (!order?.user_id) {
      return { ok: false, reason: "order_not_found" };
    }

    const user = await client.users.findUnique({ where: { id: order.user_id } });
    if (!user) return { ok: false, reason: "user_not_found" };

    const player: PlayerAuthUser = {
      id: user.id,
      email: user.email,
      operatorId: tenant.operatorId,
    };

    if (payload.status === "failed") {
      await this.failPayment(tenant, player, payload.order_id);
      return { ok: true, order_id: payload.order_id, status: "failed" };
    }

    const pendingPayment = order.payments.find((p) => p.status === "pending");
    if (!pendingPayment) {
      return { ok: false, reason: "no_pending_payment" };
    }

    const expectedTotal = decimal(order.total);
    if (
      payload.gross_amount !== undefined &&
      Math.abs(payload.gross_amount - expectedTotal) > 0.02
    ) {
      return { ok: false, reason: "amount_mismatch" };
    }

    const gatewayFeeRate =
      payload.gateway_fee_rate ??
      (expectedTotal > 0 && payload.gateway_fee_amount
        ? payload.gateway_fee_amount / expectedTotal
        : 0);
    const gatewayFeeAmount = payload.gateway_fee_amount ?? 0;

    return this.completePayment(tenant, player, payload.order_id, {
      source: "live_callback",
      transactionId:
        payload.external_transaction_id?.trim() ||
        `live-${Date.now()}`,
      gatewayTransactionId: payload.external_transaction_id?.trim(),
      gatewayFeeRate,
      gatewayFeeAmount,
    });
  }

  private async orderConfirmation(
    client: Awaited<ReturnType<TenantConnectionService["getClient"]>>,
    orderId: string,
  ) {
    const order = await client.orders.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { raffle: { select: { title: true, slug: true } } } },
      },
    });
    if (!order) throw new NotFoundException("Order not found");

    const tickets = await client.tickets.findMany({
      where: { order_id: orderId },
      orderBy: [{ raffle_id: "asc" }, { ticket_number: "asc" }],
      include: { raffle: { select: { title: true, slug: true } } },
    });

    return {
      order_id: order.id,
      status: order.status,
      sub_total: decimal(order.sub_total),
      discount: decimal(order.discount),
      site_credit_applied: decimal(order.site_credit_applied),
      total: decimal(order.total),
      coupon_code: order.coupon_code,
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
        purchase_price: decimal(t.purchase_price ?? 0),
      })),
      instant_wins: [] as Array<{
        name: string;
        prize_type: string;
        prize_value: number;
      }>,
    };
  }
}
