import { Body, Controller, Headers, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { PlayerAuthGuard } from "../player-auth/player-auth.guard";
import { PlayerTenantGuard } from "../player-auth/player-tenant.guard";
import { CurrentPlayer } from "../player-auth/player.decorators";
import { resolveCartSessionId } from "../cart/cart.controller";
import { CheckoutService } from "./checkout.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";

class CheckoutDto {
  @IsOptional()
  @IsString()
  coupon_code?: string;

  @IsOptional()
  apply_site_credit?: boolean;
}

class CashFlowsCallbackDto {
  @IsUUID()
  order_id!: string;

  @IsString()
  payment_status!: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;
}

@ApiTags("checkout")
@ApiBearerAuth()
@UseGuards(PlayerAuthGuard, PlayerTenantGuard)
@Controller("v1/checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Headers("x-cart-session") sessionHeader: string | undefined,
    @Body() body: CheckoutDto,
  ) {
    const sessionId = resolveCartSessionId(sessionHeader);
    return this.checkoutService.checkout(
      tenant,
      player,
      sessionId,
      body.coupon_code,
      body.apply_site_credit,
    );
  }
}

class CompletePaymentDto {
  @IsUUID()
  order_id!: string;
}

class HarambeCallbackDto {
  @IsUUID()
  order_id!: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;
}

@ApiTags("payments")
@Controller("v1/payments")
export class PaymentsController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(PlayerAuthGuard, PlayerTenantGuard)
  @Post("harambe/complete")
  complete(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Body() body: CompletePaymentDto,
  ) {
    return this.checkoutService.completeMockPayment(
      tenant,
      player,
      body.order_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(PlayerAuthGuard, PlayerTenantGuard)
  @Post("harambe/fail")
  fail(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Body() body: CompletePaymentDto,
  ) {
    return this.checkoutService.failPayment(tenant, player, body.order_id);
  }

  @PublicRoute()
  @Post("harambe/callback")
  async harambeCallback(
    @TenantCtx() tenant: TenantContext,
    @Body() body: HarambeCallbackDto,
    @Headers("x-harambe-signature") signature?: string,
  ) {
    return this.checkoutService.handleGatewayCallback(
      tenant,
      {
        order_id: body.order_id,
        status: "completed",
        external_transaction_id: body.transaction_id?.trim(),
      },
      signature,
    );
  }

  @PublicRoute()
  @Post("cashflows/callback")
  async cashflowsCallback(
    @TenantCtx() tenant: TenantContext,
    @Body() body: CashFlowsCallbackDto,
    @Headers("x-cashflows-signature") signature?: string,
  ) {
    const mode = process.env.CASHFLOWS_PAYMENT_MODE ?? "disabled";
    if (mode !== "live") {
      return { ok: false, reason: "cashflows_disabled" };
    }

    const expectedSecret = process.env.CASHFLOWS_CALLBACK_SECRET?.trim();
    if (!expectedSecret) {
      return { ok: false, reason: "callback_secret_not_configured" };
    }
    if (signature !== expectedSecret) {
      return { ok: false, reason: "invalid_signature" };
    }

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const order = await client.orders.findUnique({
      where: { id: body.order_id },
    });
    if (!order?.user_id) {
      return { ok: false, reason: "order_not_found" };
    }

    if (body.payment_status === "success") {
      return this.checkoutService.handleGatewayCallback(
        tenant,
        {
          order_id: body.order_id,
          status: "completed",
          external_transaction_id: body.transaction_id?.trim(),
        },
        signature,
      );
    }

    return this.checkoutService.handleGatewayCallback(
      tenant,
      { order_id: body.order_id, status: "failed" },
      signature,
    );
  }
}
