import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";
import { TenantCtx } from "../tenant/tenant.decorators";
import { PlayerAuthGuard } from "../player-auth/player-auth.guard";
import { PlayerTenantGuard } from "../player-auth/player-tenant.guard";
import { CurrentPlayer } from "../player-auth/player.decorators";
import { AccountService } from "./account.service";
import { MediaStorageService } from "../media/media-storage.service";

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  spending_limit?: number | null;

  @IsOptional()
  @IsIn(["weekly", "monthly"])
  spending_limit_period?: "weekly" | "monthly" | null;
}

class SubmitKycDto {
  @IsString()
  document_url!: string;
}

class UpdatePrizeClaimDto {
  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  address_line?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;
}

class RequestWithdrawalDto {
  @IsIn(["mpesa", "bank"])
  method!: "mpesa" | "bank";

  @IsOptional()
  @IsString()
  account_name?: string;

  @IsString()
  account_number!: string;

  @IsOptional()
  @IsString()
  bank_name?: string;
}

class ShippingAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  address_line?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

@ApiTags("account")
@ApiBearerAuth()
@UseGuards(PlayerAuthGuard, PlayerTenantGuard)
@Controller("v1/account")
export class AccountController {
  constructor(
    private readonly account: AccountService,
    private readonly media: MediaStorageService,
  ) {}

  @Get("orders")
  listOrders(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.account.listOrders(
      tenant,
      player,
      Number(page) || 1,
      Math.min(Number(limit) || 20, 100),
    );
  }

  @Get("orders/:id")
  getOrder(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Param("id") id: string,
  ) {
    return this.account.getOrder(tenant, player, id);
  }

  @Get("tickets")
  listTickets(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
  ) {
    return this.account.listTickets(tenant, player);
  }

  @Get("wins")
  listWins(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
  ) {
    return this.account.listWins(tenant, player);
  }

  @Patch("profile")
  updateProfile(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.account.updateProfile(tenant, player, body);
  }

  @Post("play-safe")
  playSafe(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
  ) {
    return this.account.activatePlaySafe(tenant, player);
  }

  @Post("kyc")
  submitKyc(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Body() body: SubmitKycDto,
  ) {
    return this.account.submitKyc(tenant, player, body.document_url);
  }

  @Post("kyc/upload")
  async uploadKyc(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Req() req: FastifyRequest,
  ) {
    const data = await req.file();
    if (!data) {
      throw new BadRequestException("No file uploaded");
    }

    const buffer = await data.toBuffer();
    const mimeType = data.mimetype ?? "application/octet-stream";
    const originalName = data.filename ?? "kyc.bin";

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowed.includes(mimeType)) {
      throw new BadRequestException(
        "Only JPEG, PNG, WebP, and PDF documents are allowed",
      );
    }

    const saved = await this.media.save(
      tenant.operatorId,
      buffer,
      mimeType,
      originalName,
    );

    return this.account.submitKyc(tenant, player, saved.url);
  }

  @Get("prize-claims")
  listPrizeClaims(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
  ) {
    return this.account.listPrizeClaims(tenant, player);
  }

  @Patch("prize-claims/:id")
  updatePrizeClaim(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Param("id") id: string,
    @Body() body: UpdatePrizeClaimDto,
  ) {
    return this.account.updatePrizeClaimAddress(tenant, player, id, body);
  }

  @Post("prize-claims/:id/withdrawal")
  requestWithdrawal(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Param("id") id: string,
    @Body() body: RequestWithdrawalDto,
  ) {
    return this.account.requestWithdrawal(tenant, player, id, body);
  }

  @Get("site-credit/transactions")
  listSiteCreditTransactions(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.account.listSiteCreditTransactions(
      tenant,
      player,
      Number(page) || 1,
      Math.min(Number(limit) || 20, 100),
    );
  }

  @Get("shipping-addresses")
  listShippingAddresses(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
  ) {
    return this.account.listShippingAddresses(tenant, player);
  }

  @Post("shipping-addresses")
  createShippingAddress(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Body() body: ShippingAddressDto,
  ) {
    return this.account.createShippingAddress(tenant, player, body);
  }

  @Delete("shipping-addresses/:id")
  deleteShippingAddress(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Param("id") id: string,
  ) {
    return this.account.deleteShippingAddress(tenant, player, id);
  }
}
