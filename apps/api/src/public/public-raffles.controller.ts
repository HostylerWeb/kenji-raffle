import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { TenantContext } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { OperatorCatalogService } from "../operator-admin/operator-catalog.service";
import { DrawService } from "../draw/draw.service";

@ApiTags("public-raffles")
@Controller("v1")
export class PublicRafflesController {
  constructor(
    private readonly catalog: OperatorCatalogService,
    private readonly draw: DrawService,
  ) {}

  @PublicRoute()
  @Get("categories")
  listCategories(@TenantCtx() tenant: TenantContext) {
    return this.catalog.listPublicCategories(tenant);
  }

  @PublicRoute()
  @Get("raffles")
  listRaffles(
    @TenantCtx() tenant: TenantContext,
    @Query("category") category?: string,
    @Query("featured") featured?: string,
    @Query("ending_soon") endingSoon?: string,
  ) {
    return this.catalog.listPublicRaffles(tenant, {
      category,
      featured: featured === "true" || featured === "1",
      ending_soon: endingSoon === "true" || endingSoon === "1",
    });
  }

  @PublicRoute()
  @Get("raffles/:slug")
  getRaffle(@TenantCtx() tenant: TenantContext, @Param("slug") slug: string) {
    return this.catalog.getPublicRaffleBySlug(tenant, slug);
  }

  @PublicRoute()
  @Get("winners")
  listWinners(
    @TenantCtx() tenant: TenantContext,
    @Query("limit") limit?: string,
  ) {
    return this.draw.listPublicWinners(
      tenant,
      Math.min(Number(limit) || 50, 100),
    );
  }
}
