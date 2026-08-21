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
import { IsIn, IsOptional, IsString } from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import { CurrentOperatorStaff, OperatorRoles } from "./operator.decorators";
import { OperatorWithdrawalsService } from "./operator-withdrawals.service";

class UpdateWithdrawalDto {
  @IsIn(["approved", "paid", "rejected"])
  status!: "approved" | "paid" | "rejected";

  @IsOptional()
  @IsString()
  admin_note?: string;
}

@ApiTags("operator-withdrawals")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/withdrawals")
export class OperatorWithdrawalsController {
  constructor(private readonly withdrawals: OperatorWithdrawalsService) {}

  @Get()
  list(
    @TenantCtx() tenant: TenantContext,
    @Query("status") status?: string,
  ) {
    return this.withdrawals.listWithdrawals(tenant.operatorId, status);
  }

  @OperatorRoles("owner", "manager", "finance")
  @Patch(":id")
  update(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: UpdateWithdrawalDto,
  ) {
    return this.withdrawals.updateWithdrawal(
      actor,
      tenant.operatorId,
      id,
      body,
    );
  }
}
