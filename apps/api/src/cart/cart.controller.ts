import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { randomUUID } from "crypto";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { OptionalPlayerAuthGuard } from "../player-auth/optional-player.guard";
import { CurrentPlayer, OptionalPlayer } from "../player-auth/player.decorators";
import { PlayerAuthGuard } from "../player-auth/player-auth.guard";
import { PlayerTenantGuard } from "../player-auth/player-tenant.guard";
import { CartService } from "./cart.service";

class AddCartItemDto {
  @IsUUID()
  raffle_id!: string;

  @IsInt()
  @Min(1)
  ticket_quantity!: number;
}

class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  ticket_quantity!: number;
}

class ValidateCouponDto {
  @IsString()
  code!: string;
}

export function resolveCartSessionId(header?: string): string {
  if (header && header.length >= 8) return header;
  return randomUUID();
}

@ApiTags("cart")
@Controller("v1")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @PublicRoute()
  @OptionalPlayer()
  @UseGuards(OptionalPlayerAuthGuard)
  @Get("cart")
  getCart(
    @TenantCtx() tenant: TenantContext,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @CurrentPlayer() player?: PlayerAuthUser,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.cartService.getCart(tenant, sessionId, player);
  }

  @PublicRoute()
  @OptionalPlayer()
  @UseGuards(OptionalPlayerAuthGuard)
  @Post("cart/items")
  addItem(
    @TenantCtx() tenant: TenantContext,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @CurrentPlayer() player: PlayerAuthUser | undefined,
    @Body() body: AddCartItemDto,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.cartService.addItem(
      tenant,
      sessionId,
      player,
      body.raffle_id,
      body.ticket_quantity,
    );
  }

  @PublicRoute()
  @OptionalPlayer()
  @UseGuards(OptionalPlayerAuthGuard)
  @Patch("cart/items/:id")
  updateItem(
    @TenantCtx() tenant: TenantContext,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @CurrentPlayer() player: PlayerAuthUser | undefined,
    @Param("id") id: string,
    @Body() body: UpdateCartItemDto,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.cartService.updateItemQuantity(
      tenant,
      sessionId,
      player,
      id,
      body.ticket_quantity,
    );
  }

  @PublicRoute()
  @OptionalPlayer()
  @UseGuards(OptionalPlayerAuthGuard)
  @Delete("cart/items/:id")
  removeItem(
    @TenantCtx() tenant: TenantContext,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @CurrentPlayer() player: PlayerAuthUser | undefined,
    @Param("id") id: string,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.cartService.removeItem(tenant, sessionId, player, id);
  }

  @ApiBearerAuth()
  @UseGuards(PlayerAuthGuard, PlayerTenantGuard)
  @Post("cart/merge")
  mergeCart(
    @TenantCtx() tenant: TenantContext,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @CurrentPlayer() player: PlayerAuthUser,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.cartService.mergeSessionToUser(tenant, sessionId, player);
  }

  @PublicRoute()
  @OptionalPlayer()
  @UseGuards(OptionalPlayerAuthGuard)
  @Post("coupons/validate")
  validateCoupon(
    @TenantCtx() tenant: TenantContext,
    @Body() body: ValidateCouponDto,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @CurrentPlayer() player?: PlayerAuthUser,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.cartService
      .getCart(tenant, sessionId, player)
      .then((c) =>
        this.cartService.validateCoupon(
          tenant,
          body.code,
          c.subtotal,
          player?.id,
        ),
      );
  }
}
