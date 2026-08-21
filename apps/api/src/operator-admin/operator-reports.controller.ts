import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import { OperatorRoles } from "./operator.decorators";
import { OperatorReportsService } from "./operator-reports.service";

@ApiTags("operator-reports")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/reports")
export class OperatorReportsController {
  constructor(private readonly reports: OperatorReportsService) {}

  @OperatorRoles("owner", "manager", "finance")
  @Get("ggr")
  ggr(
    @TenantCtx() tenant: TenantContext,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.reports.getGgr(tenant.operatorId, from, to);
  }

  @OperatorRoles("owner", "manager", "finance")
  @Get("tax")
  tax(
    @TenantCtx() tenant: TenantContext,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.reports.getTaxSummary(tenant.operatorId, from, to);
  }

  @OperatorRoles("owner", "manager", "finance")
  @Get("sales-by-raffle")
  salesByRaffle(
    @TenantCtx() tenant: TenantContext,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.reports.getSalesByRaffle(tenant.operatorId, from, to);
  }
}
