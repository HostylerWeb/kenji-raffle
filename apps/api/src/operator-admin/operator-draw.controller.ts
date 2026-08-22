import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "../operator-admin/operator-tenant.guard";
import { OperatorRolesGuard } from "../operator-admin/operator-roles.guard";
import { CurrentOperatorStaff, OperatorRoles } from "../operator-admin/operator.decorators";
import { DrawService } from "../draw/draw.service";
import { GraAdminService } from "../gra/gra-admin.service";

class UpdateClaimDto {
  @IsIn(["pending", "shipped", "delivered"])
  status!: "pending" | "shipped" | "delivered";
}

@ApiTags("operator-draw")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin")
export class OperatorDrawController {
  constructor(
    private readonly draw: DrawService,
    private readonly gra: GraAdminService,
  ) {}

  @OperatorRoles("owner", "manager")
  @Post("raffles/:id/draw")
  drawRaffle(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.draw.drawRaffle(tenant, actor, id);
  }

  @Get("winners")
  listWinners(
    @TenantCtx() tenant: TenantContext,
    @Query("raffle_id") raffleId?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.draw.listAdminWinners(tenant.operatorId, {
      raffleId,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
  }

  @Get("prize-claims")
  listClaims(
    @TenantCtx() tenant: TenantContext,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.draw.listPrizeClaims(tenant.operatorId, {
      status,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
  }

  @Get("prize-claims/:id")
  getClaim(@TenantCtx() tenant: TenantContext, @Param("id") id: string) {
    return this.draw.getPrizeClaim(tenant.operatorId, id);
  }

  @OperatorRoles("owner", "manager", "support")
  @Patch("prize-claims/:id")
  updateClaim(
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: UpdateClaimDto,
  ) {
    return this.draw.updatePrizeClaim(tenant.operatorId, id, body.status);
  }

  @Get("gra-events")
  listGraEvents(
    @TenantCtx() tenant: TenantContext,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.gra.listEvents(tenant.operatorId, {
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
  }

  @OperatorRoles("owner", "manager")
  @Post("gra-events/:id/retry")
  retryGraEvent(
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.gra.retryEvent(tenant.operatorId, id);
  }
}
