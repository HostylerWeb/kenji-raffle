import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import { CurrentOperatorStaff, OperatorRoles } from "./operator.decorators";
import { OperatorPlayersService } from "./operator-players.service";

class UpdatePlayerDto {
  @IsOptional()
  @IsBoolean()
  account_disabled?: boolean;

  @IsOptional()
  @IsIn(["none", "pending", "verified"])
  kyc_status?: "none" | "pending" | "verified";

  @IsOptional()
  @IsNumber()
  @Min(0)
  spending_limit?: number | null;

  @IsOptional()
  @IsIn(["weekly", "monthly"])
  spending_limit_period?: "weekly" | "monthly" | null;

  @IsOptional()
  @IsBoolean()
  play_safe_active?: boolean;
}

@ApiTags("operator-players")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/players")
export class OperatorPlayersController {
  constructor(private readonly players: OperatorPlayersService) {}

  @Get()
  list(
    @TenantCtx() tenant: TenantContext,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.players.list(
      tenant.operatorId,
      search,
      Number(page) || 1,
      Number(limit) || 50,
    );
  }

  @Get(":id")
  get(@TenantCtx() tenant: TenantContext, @Param("id") id: string) {
    return this.players.get(tenant.operatorId, id);
  }

  @OperatorRoles("owner", "manager", "support")
  @Patch(":id")
  update(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: UpdatePlayerDto,
  ) {
    return this.players.update(actor, tenant.operatorId, id, body);
  }
}
