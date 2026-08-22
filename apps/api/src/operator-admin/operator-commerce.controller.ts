import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import { CurrentOperatorStaff, OperatorRoles } from "./operator.decorators";
import {
  OperatorCouponsService,
  OperatorOrdersService,
} from "./operator-commerce.service";

@ApiTags("operator-orders")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin")
export class OperatorOrdersController {
  constructor(private readonly ordersService: OperatorOrdersService) {}

  @Get("orders")
  listOrders(
    @TenantCtx() tenant: TenantContext,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.ordersService.listOrders(tenant.operatorId, {
      status,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
  }

  @Get("orders/:id")
  getOrder(@TenantCtx() tenant: TenantContext, @Param("id") id: string) {
    return this.ordersService.getOrder(tenant.operatorId, id);
  }

  @OperatorRoles("owner", "manager", "finance")
  @Get("orders/export")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", "attachment; filename=orders.csv")
  exportOrders(
    @TenantCtx() tenant: TenantContext,
    @Query("status") status?: string,
  ) {
    return this.ordersService.exportOrdersCsv(tenant.operatorId, status);
  }

  @Get("payments")
  listPayments(
    @TenantCtx() tenant: TenantContext,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.ordersService.listPayments(tenant.operatorId, {
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
  }

  @OperatorRoles("owner", "manager", "finance")
  @Post("orders/:id/refund")
  refund(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.ordersService.refundOrder(actor, tenant.operatorId, id);
  }
}

class UpdateWithdrawalDto {
  @IsIn(["approved", "paid", "rejected"])
  status!: "approved" | "paid" | "rejected";

  @IsOptional()
  @IsString()
  admin_note?: string;
}

class CreateCouponDto {
  @IsString()
  @MinLength(2)
  code!: string;

  @IsIn(["percent", "fixed"])
  discount_type!: string;

  @IsNumber()
  @Min(0)
  discount_value!: number;

  @IsOptional()
  @IsNumber()
  min_order_amount?: number;

  @IsOptional()
  @IsInt()
  max_uses?: number;

  @IsOptional()
  @IsInt()
  max_uses_per_user?: number;

  @IsOptional()
  @IsString()
  valid_from?: string;

  @IsOptional()
  @IsString()
  valid_until?: string;
}

@ApiTags("operator-coupons")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/coupons")
export class OperatorCouponsController {
  constructor(private readonly couponsService: OperatorCouponsService) {}

  @Get()
  list(
    @TenantCtx() tenant: TenantContext,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.couponsService.list(tenant.operatorId, {
      search,
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
  }

  @OperatorRoles("owner", "manager")
  @Post()
  create(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Body() body: CreateCouponDto,
  ) {
    return this.couponsService.create(actor, tenant.operatorId, body);
  }

  @OperatorRoles("owner", "manager")
  @Patch(":id")
  update(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: Partial<CreateCouponDto & { status?: string }>,
  ) {
    return this.couponsService.update(actor, tenant.operatorId, id, body);
  }

  @OperatorRoles("owner", "manager")
  @Delete(":id")
  remove(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.couponsService.delete(actor, tenant.operatorId, id);
  }
}
