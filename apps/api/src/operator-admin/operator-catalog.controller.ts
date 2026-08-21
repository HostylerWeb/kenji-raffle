import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import { CurrentOperatorStaff, OperatorRoles } from "./operator.decorators";
import { OperatorCatalogService } from "./operator-catalog.service";

class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

@ApiTags("operator-categories")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/categories")
export class OperatorCategoriesController {
  constructor(private readonly catalog: OperatorCatalogService) {}

  @Get()
  list(@TenantCtx() tenant: TenantContext) {
    return this.catalog.listCategories(tenant.operatorId);
  }

  @OperatorRoles("owner", "manager")
  @Post()
  create(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Body() body: CreateCategoryDto,
  ) {
    return this.catalog.createCategory(actor, tenant.operatorId, body);
  }

  @OperatorRoles("owner", "manager")
  @Patch(":id")
  update(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.catalog.updateCategory(actor, tenant.operatorId, id, body);
  }

  @OperatorRoles("owner", "manager")
  @Delete(":id")
  remove(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.catalog.deleteCategory(actor, tenant.operatorId, id);
  }
}

class CreateRaffleDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsNumber()
  @Min(0)
  ticket_price!: number;

  @IsInt()
  @Min(1)
  max_entries!: number;

  @IsOptional()
  @IsInt()
  min_tickets?: number;

  @IsOptional()
  @IsInt()
  ticket_limit_per_user?: number;

  @IsOptional()
  @IsIn(["manual", "automatic", "scheduled"])
  draw_type?: string;

  @IsOptional()
  @IsInt()
  number_of_winners?: number;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  featured_image_url?: string;

  @IsOptional()
  @IsNumber()
  cash_alternative_amount?: number;

  @IsOptional()
  @IsString()
  scheduled_draw_at?: string;
}

class UpdateRaffleStatusDto {
  @IsIn([
    "draft",
    "listed",
    "active",
    "to_be_drawn",
    "drawn",
    "cancelled",
    "failed",
  ])
  status!: string;
}

class CreatePrizeDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(["physical", "cash", "site_credit"])
  prize_type!: string;

  @IsOptional()
  @IsNumber()
  value_kes?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

class CreateInstantWinDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(["site_credit", "cash", "physical"])
  prize_type!: string;

  @IsNumber()
  @Min(0)
  prize_value!: number;

  @IsInt()
  @Min(1)
  win_frequency!: number;

  @IsInt()
  @Min(1)
  total_available!: number;

  @IsOptional()
  @IsUUID()
  group_id?: string;
}

class GalleryImageDto {
  @IsString()
  image_url!: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

@ApiTags("operator-raffles")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/raffles")
export class OperatorRafflesController {
  constructor(private readonly catalog: OperatorCatalogService) {}

  @Get()
  list(@TenantCtx() tenant: TenantContext, @Query("status") status?: string) {
    return this.catalog.listRaffles(tenant.operatorId, status);
  }

  @OperatorRoles("owner", "manager")
  @Post()
  create(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Body() body: CreateRaffleDto,
  ) {
    return this.catalog.createRaffle(actor, tenant.operatorId, body);
  }

  @Get(":id")
  get(@TenantCtx() tenant: TenantContext, @Param("id") id: string) {
    return this.catalog.getRaffle(tenant.operatorId, id);
  }

  @OperatorRoles("owner", "manager")
  @Patch(":id")
  update(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: Partial<CreateRaffleDto>,
  ) {
    return this.catalog.updateRaffle(actor, tenant.operatorId, id, body);
  }

  @OperatorRoles("owner", "manager")
  @Delete(":id")
  remove(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.catalog.deleteRaffle(actor, tenant.operatorId, id);
  }

  @OperatorRoles("owner", "manager")
  @Patch(":id/status")
  updateStatus(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: UpdateRaffleStatusDto,
  ) {
    return this.catalog.updateRaffleStatus(
      actor,
      tenant.operatorId,
      id,
      body.status as
        | "draft"
        | "listed"
        | "active"
        | "to_be_drawn"
        | "drawn"
        | "cancelled"
        | "failed",
    );
  }

  @OperatorRoles("owner", "manager")
  @Post(":raffleId/prizes")
  createPrize(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Body() body: CreatePrizeDto,
  ) {
    return this.catalog.createPrize(actor, tenant.operatorId, raffleId, body);
  }

  @OperatorRoles("owner", "manager")
  @Patch(":raffleId/prizes/:prizeId")
  updatePrize(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("prizeId") prizeId: string,
    @Body() body: Partial<CreatePrizeDto>,
  ) {
    return this.catalog.updatePrize(
      actor,
      tenant.operatorId,
      raffleId,
      prizeId,
      body,
    );
  }

  @OperatorRoles("owner", "manager")
  @Delete(":raffleId/prizes/:prizeId")
  deletePrize(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("prizeId") prizeId: string,
  ) {
    return this.catalog.deletePrize(
      actor,
      tenant.operatorId,
      raffleId,
      prizeId,
    );
  }

  @OperatorRoles("owner", "manager")
  @Post(":raffleId/instant-win-prizes")
  createInstantWin(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Body() body: CreateInstantWinDto,
  ) {
    return this.catalog.createInstantWinPrize(
      actor,
      tenant.operatorId,
      raffleId,
      body,
    );
  }

  @OperatorRoles("owner", "manager")
  @Patch(":raffleId/instant-win-prizes/:prizeId")
  updateInstantWin(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("prizeId") prizeId: string,
    @Body() body: Partial<CreateInstantWinDto & { status?: string }>,
  ) {
    return this.catalog.updateInstantWinPrize(
      actor,
      tenant.operatorId,
      raffleId,
      prizeId,
      body,
    );
  }

  @OperatorRoles("owner", "manager")
  @Delete(":raffleId/instant-win-prizes/:prizeId")
  deleteInstantWin(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("prizeId") prizeId: string,
  ) {
    return this.catalog.deleteInstantWinPrize(
      actor,
      tenant.operatorId,
      raffleId,
      prizeId,
    );
  }

  @OperatorRoles("owner", "manager")
  @Post(":raffleId/gallery")
  addGallery(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Body() body: GalleryImageDto,
  ) {
    return this.catalog.addGalleryImage(
      actor,
      tenant.operatorId,
      raffleId,
      body,
    );
  }

  @OperatorRoles("owner", "manager")
  @Delete(":raffleId/gallery/:imageId")
  deleteGallery(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("imageId") imageId: string,
  ) {
    return this.catalog.deleteGalleryImage(
      actor,
      tenant.operatorId,
      raffleId,
      imageId,
    );
  }

  @OperatorRoles("owner", "manager")
  @Post(":raffleId/tickets/generate")
  generateTickets(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
  ) {
    return this.catalog.generateTickets(actor, tenant.operatorId, raffleId);
  }

  @Get(":raffleId/tickets/summary")
  ticketSummary(
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
  ) {
    return this.catalog.ticketSummary(tenant.operatorId, raffleId);
  }

  @Get(":raffleId/tickets")
  listTickets(
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.catalog.listTickets(
      tenant.operatorId,
      raffleId,
      status,
      Number(page ?? 1),
      Number(limit ?? 50),
    );
  }

  @OperatorRoles("owner", "manager")
  @Get(":raffleId/instant-win-groups")
  listGroups(
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
  ) {
    return this.catalog.listInstantWinGroups(tenant.operatorId, raffleId);
  }

  @OperatorRoles("owner", "manager")
  @Post(":raffleId/instant-win-groups")
  createGroup(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Body() body: { name: string; sort_order?: number },
  ) {
    return this.catalog.createInstantWinGroup(
      actor,
      tenant.operatorId,
      raffleId,
      body,
    );
  }

  @OperatorRoles("owner", "manager")
  @Delete(":raffleId/instant-win-groups/:groupId")
  deleteGroup(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("groupId") groupId: string,
  ) {
    return this.catalog.deleteInstantWinGroup(
      actor,
      tenant.operatorId,
      raffleId,
      groupId,
    );
  }

  @OperatorRoles("owner", "manager")
  @Get(":raffleId/quantity-discounts")
  listDiscounts(
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
  ) {
    return this.catalog.listQuantityDiscounts(tenant.operatorId, raffleId);
  }

  @OperatorRoles("owner", "manager")
  @Post(":raffleId/quantity-discounts")
  createDiscount(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Body()
    body: {
      min_quantity: number;
      discount_type: string;
      discount_value: number;
    },
  ) {
    return this.catalog.createQuantityDiscount(
      actor,
      tenant.operatorId,
      raffleId,
      body,
    );
  }

  @OperatorRoles("owner", "manager")
  @Delete(":raffleId/quantity-discounts/:tierId")
  deleteDiscount(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("raffleId") raffleId: string,
    @Param("tierId") tierId: string,
  ) {
    return this.catalog.deleteQuantityDiscount(
      actor,
      tenant.operatorId,
      raffleId,
      tierId,
    );
  }
}
