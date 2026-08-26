import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import {
  cartExpiresAt,
  releaseTicketsByNumbers,
  reserveTickets,
} from "./cart-tickets.helper";
import { assertTicketLimitPerUser } from "./ticket-limits.helper";
import { computeLineTierDiscount } from "./discount-tiers.helper";
import {
  assertRaffleOpenForPurchase,
} from "./raffle-purchase.helper";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

function parseTicketNumbers(json: Prisma.JsonValue): number[] {
  if (!Array.isArray(json)) return [];
  return json.filter((n) => typeof n === "number") as number[];
}

function cartItemsWhere(sessionId: string, playerId?: string) {
  return {
    expires_at: { gt: new Date() },
    OR: [
      { session_id: sessionId },
      ...(playerId ? [{ user_id: playerId }] : []),
    ],
  };
}

@Injectable()
export class CartService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly platformPrisma: PlatformPrismaService,
  ) {}

  async getCart(
    tenant: TenantContext,
    sessionId: string,
    player?: PlayerAuthUser,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);

    const items = await client.cart_items.findMany({
      where: cartItemsWhere(sessionId, player?.id),
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            ticket_price: true,
            status: true,
            featured_image_url: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    const subtotal = items.reduce((sum, item) => sum + decimal(item.final_amount), 0);

    return {
      session_id: sessionId,
      items: items.map((item) => ({
        id: item.id,
        raffle_id: item.raffle_id,
        raffle_title: item.raffle.title,
        raffle_slug: item.raffle.slug,
        featured_image_url: item.raffle.featured_image_url,
        ticket_quantity: item.ticket_quantity,
        unit_price: decimal(item.unit_price),
        subtotal: decimal(item.subtotal),
        discount_amount: decimal(item.discount_amount),
        final_amount: decimal(item.final_amount),
        ticket_numbers: parseTicketNumbers(item.ticket_numbers),
        expires_at: item.expires_at.toISOString(),
      })),
      subtotal,
      expires_at: items[0]?.expires_at.toISOString() ?? null,
    };
  }

  /** Lightweight count for header badge — avoids raffle joins. */
  async getCartCount(
    tenant: TenantContext,
    sessionId: string,
    player?: PlayerAuthUser,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const result = await client.cart_items.aggregate({
      where: cartItemsWhere(sessionId, player?.id),
      _sum: { ticket_quantity: true },
    });
    return { count: result._sum.ticket_quantity ?? 0 };
  }

  async addItem(
    tenant: TenantContext,
    sessionId: string,
    player: PlayerAuthUser | undefined,
    raffleId: string,
    quantity: number,
  ) {
    if (quantity < 1 || quantity > 100) {
      throw new BadRequestException("Invalid ticket quantity");
    }

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const raffle = await client.raffles.findUnique({ where: { id: raffleId } });
    if (!raffle) {
      throw new BadRequestException("Raffle is not available for purchase");
    }
    assertRaffleOpenForPurchase(raffle);

    if (player) {
      await assertTicketLimitPerUser(
        client,
        raffleId,
        player.id,
        raffle.ticket_limit_per_user,
        quantity,
      );
    }

    const expiresAt = cartExpiresAt();
    const reserved = await reserveTickets(
      client,
      raffleId,
      quantity,
      sessionId,
      player?.id ?? null,
      expiresAt,
    );

    if (reserved.length < quantity) {
      if (reserved.length > 0) {
        await releaseTicketsByNumbers(
          client,
          raffleId,
          reserved.map((t) => t.ticket_number),
        );
      }
      throw new BadRequestException("Not enough tickets available");
    }

    const unitPrice = decimal(raffle.ticket_price);
    const subtotal = unitPrice * quantity;

    const existing = await client.cart_items.findFirst({
      where: {
        raffle_id: raffleId,
        expires_at: { gt: new Date() },
        OR: [
          { session_id: sessionId },
          ...(player ? [{ user_id: player.id }] : []),
        ],
      },
    });

    if (existing) {
      const existingNumbers = parseTicketNumbers(existing.ticket_numbers);
      const mergedNumbers = [...existingNumbers, ...reserved.map((t) => t.ticket_number)];
      const newQty = existing.ticket_quantity + quantity;
      const newSubtotal = unitPrice * newQty;
      const tierDiscount = await computeLineTierDiscount(
        client,
        raffleId,
        newQty,
        unitPrice,
      );

      await client.cart_items.update({
        where: { id: existing.id },
        data: {
          ticket_quantity: newQty,
          subtotal: newSubtotal,
          discount_amount: tierDiscount,
          final_amount: newSubtotal - tierDiscount,
          ticket_numbers: mergedNumbers,
          expires_at: expiresAt,
          session_id: sessionId,
          user_id: player?.id,
        },
      });
    } else {
      const tierDiscount = await computeLineTierDiscount(
        client,
        raffleId,
        quantity,
        unitPrice,
      );
      await client.cart_items.create({
        data: {
          session_id: sessionId,
          user_id: player?.id,
          raffle_id: raffleId,
          ticket_quantity: quantity,
          unit_price: unitPrice,
          subtotal,
          discount_amount: tierDiscount,
          final_amount: subtotal - tierDiscount,
          ticket_numbers: reserved.map((t) => t.ticket_number),
          expires_at: expiresAt,
        },
      });
    }

    return this.getCart(tenant, sessionId, player);
  }

  async updateItemQuantity(
    tenant: TenantContext,
    sessionId: string,
    player: PlayerAuthUser | undefined,
    itemId: string,
    quantity: number,
  ) {
    if (quantity < 1) {
      throw new BadRequestException("Quantity must be at least 1");
    }

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const item = await this.findCartItem(client, itemId, sessionId, player);
    const raffle = await client.raffles.findUnique({
      where: { id: item.raffle_id },
    });
    if (!raffle) {
      throw new BadRequestException("Raffle is not available for purchase");
    }
    if (quantity > item.ticket_quantity) {
      assertRaffleOpenForPurchase(raffle);
    }

    if (player && raffle.ticket_limit_per_user != null) {
      await assertTicketLimitPerUser(
        client,
        item.raffle_id,
        player.id,
        raffle.ticket_limit_per_user,
        quantity,
        itemId,
      );
    }

    const currentNumbers = parseTicketNumbers(item.ticket_numbers);

    if (quantity === item.ticket_quantity) {
      return this.getCart(tenant, sessionId, player);
    }

    if (quantity < item.ticket_quantity) {
      const removeCount = item.ticket_quantity - quantity;
      const toRelease = currentNumbers.slice(-removeCount);
      const keep = currentNumbers.slice(0, quantity);
      await releaseTicketsByNumbers(client, item.raffle_id, toRelease);

      const unitPrice = decimal(item.unit_price);
      const subtotal = unitPrice * quantity;
      const tierDiscount = await computeLineTierDiscount(
        client,
        item.raffle_id,
        quantity,
        unitPrice,
      );

      await client.cart_items.update({
        where: { id: itemId },
        data: {
          ticket_quantity: quantity,
          subtotal,
          discount_amount: tierDiscount,
          final_amount: subtotal - tierDiscount,
          ticket_numbers: keep,
        },
      });
    } else {
      const addCount = quantity - item.ticket_quantity;
      const expiresAt = cartExpiresAt();
      const reserved = await reserveTickets(
        client,
        item.raffle_id,
        addCount,
        sessionId,
        player?.id ?? null,
        expiresAt,
      );

      if (reserved.length < addCount) {
        if (reserved.length > 0) {
          await releaseTicketsByNumbers(
            client,
            item.raffle_id,
            reserved.map((t) => t.ticket_number),
          );
        }
        throw new BadRequestException("Not enough tickets available");
      }

      const merged = [...currentNumbers, ...reserved.map((t) => t.ticket_number)];
      const unitPrice = decimal(item.unit_price);
      const subtotal = unitPrice * quantity;
      const tierDiscount = await computeLineTierDiscount(
        client,
        item.raffle_id,
        quantity,
        unitPrice,
      );

      await client.cart_items.update({
        where: { id: itemId },
        data: {
          ticket_quantity: quantity,
          subtotal,
          discount_amount: tierDiscount,
          final_amount: subtotal - tierDiscount,
          ticket_numbers: merged,
          expires_at: expiresAt,
        },
      });
    }

    return this.getCart(tenant, sessionId, player);
  }

  async removeItem(
    tenant: TenantContext,
    sessionId: string,
    player: PlayerAuthUser | undefined,
    itemId: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const item = await this.findCartItem(client, itemId, sessionId, player);
    const numbers = parseTicketNumbers(item.ticket_numbers);
    await releaseTicketsByNumbers(client, item.raffle_id, numbers);
    await client.cart_items.delete({ where: { id: itemId } });
    return this.getCart(tenant, sessionId, player);
  }

  async mergeSessionToUser(
    tenant: TenantContext,
    sessionId: string,
    player: PlayerAuthUser,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    await client.cart_items.updateMany({
      where: { session_id: sessionId, expires_at: { gt: new Date() } },
      data: { user_id: player.id },
    });
    await client.tickets.updateMany({
      where: { session_id: sessionId, status: "reserved" },
      data: { user_id: player.id },
    });
    return this.getCart(tenant, sessionId, player);
  }

  async validateCoupon(
    tenant: TenantContext,
    code: string,
    orderSubtotal: number,
    userId?: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const coupon = await client.coupons.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || coupon.status !== "active") {
      throw new BadRequestException("Invalid coupon code");
    }

    const now = new Date();
    if (coupon.valid_from && coupon.valid_from > now) {
      throw new BadRequestException("Coupon is not yet valid");
    }
    if (coupon.valid_until && coupon.valid_until < now) {
      throw new BadRequestException("Coupon has expired");
    }
    if (coupon.max_uses != null && coupon.uses_count >= coupon.max_uses) {
      throw new BadRequestException("Coupon usage limit reached");
    }
    if (userId && coupon.max_uses_per_user != null) {
      const userUses = await client.coupon_redemptions.count({
        where: { coupon_id: coupon.id, user_id: userId },
      });
      if (userUses >= coupon.max_uses_per_user) {
        throw new BadRequestException("You have already used this coupon");
      }
    }
    if (
      coupon.min_order_amount != null &&
      orderSubtotal < decimal(coupon.min_order_amount)
    ) {
      throw new BadRequestException("Order does not meet coupon minimum");
    }

    let discount = 0;
    if (coupon.discount_type === "percent") {
      discount = (orderSubtotal * decimal(coupon.discount_value)) / 100;
    } else {
      discount = decimal(coupon.discount_value);
    }
    discount = Math.min(discount, orderSubtotal);

    return {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: decimal(coupon.discount_value),
      discount_amount: discount,
      coupon_id: coupon.id,
    };
  }

  private async findCartItem(
    client: Awaited<ReturnType<TenantConnectionService["getClient"]>>,
    itemId: string,
    sessionId: string,
    player?: PlayerAuthUser,
  ) {
    const item = await client.cart_items.findFirst({
      where: {
        id: itemId,
        expires_at: { gt: new Date() },
        OR: [
          { session_id: sessionId },
          ...(player ? [{ user_id: player.id }] : []),
        ],
      },
    });
    if (!item) throw new NotFoundException("Cart item not found");
    return item;
  }
}
