import { Body, Controller, Headers, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
} from "class-validator";
import type { TenantContext } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { CheckoutService } from "./checkout.service";

export class GatewayCallbackDto {
  @IsUUID()
  order_id!: string;

  @IsIn(["completed", "failed"])
  status!: "completed" | "failed";

  @IsOptional()
  @IsString()
  external_transaction_id?: string;

  @IsOptional()
  @IsNumber()
  gross_amount?: number;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  operator_amount?: number;

  @IsOptional()
  @IsNumber()
  gateway_fee_rate?: number;

  @IsOptional()
  @IsNumber()
  gateway_fee_amount?: number;

  @IsOptional()
  @IsString()
  decline_reason?: string;
}

@ApiTags("payments")
@Controller("v1/payments")
export class GatewayCallbackController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /** Primary webhook from payment gateway (kenji-gateway). */
  @PublicRoute()
  @Post("gateway/callback")
  gatewayCallback(
    @TenantCtx() tenant: TenantContext,
    @Body() body: GatewayCallbackDto,
    @Headers("x-gateway-signature") gatewaySignature?: string,
    @Headers("x-harambe-signature") harambeSignature?: string,
  ) {
    return this.checkoutService.handleGatewayCallback(
      tenant,
      body,
      gatewaySignature ?? harambeSignature,
    );
  }
}
