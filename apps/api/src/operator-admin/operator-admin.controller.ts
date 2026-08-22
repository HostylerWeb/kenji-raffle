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
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import type { OperatorAuthUser, OperatorStaffRole, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import {
  CurrentOperatorStaff,
  OperatorRoles,
} from "./operator.decorators";
import {
  OperatorSettingsService,
  OperatorStaffService,
} from "./operator-staff.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { paginate } from "../common/pagination";
import {
  buildRaffleLookupForAudit,
  resolveAuditEntityHref,
} from "../common/audit-entity-links";
import type { Prisma } from "@kenji-raffle/database-tenant";

class InviteStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(["owner", "manager", "support", "finance"])
  role!: OperatorStaffRole;
}

class UpdateStaffRoleDto {
  @IsIn(["owner", "manager", "support", "finance"])
  role!: OperatorStaffRole;
}

class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  support_email?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  footer_licence_text?: string;

  @IsOptional()
  @IsString()
  licence_number?: string;

  @IsOptional()
  social_links?: Record<string, string>;

  @IsOptional()
  @IsString()
  ga4_measurement_id?: string | null;

  @IsOptional()
  @IsString()
  facebook_pixel_id?: string | null;

  @IsOptional()
  analytics_enabled?: boolean;

  @IsOptional()
  @IsString()
  faq_text?: string | null;

  @IsOptional()
  @IsString()
  terms_text?: string | null;

  @IsOptional()
  @IsString()
  privacy_text?: string | null;

  @IsOptional()
  @IsString()
  logo_url?: string | null;
}

@ApiTags("operator-admin")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin")
export class OperatorAdminController {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly staffService: OperatorStaffService,
    private readonly settingsService: OperatorSettingsService,
    private readonly audit: TenantAuditService,
  ) {}

  @Get("dashboard")
  async dashboard(@TenantCtx() tenant: TenantContext) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const almostSoldOutThreshold = Number(
      process.env.ALMOST_SOLD_OUT_THRESHOLD ?? process.env.LOW_TICKET_THRESHOLD ?? 50,
    );

    const [
      staffCount,
      raffleCount,
      activeRaffleCount,
      ordersToday,
      pendingClaims,
      pendingWithdrawals,
      revenueToday,
      revenueTotal,
      ticketsSoldToday,
      playerCount,
      domains,
      activeRaffleRows,
    ] = await Promise.all([
      client.operator_staff.count(),
      client.raffles.count(),
      client.raffles.count({
        where: { status: { in: ["listed", "active"] } },
      }),
      client.orders.count({
        where: {
          created_at: { gte: startOfToday },
          status: { in: ["completed", "refunded"] },
        },
      }),
      client.prize_claims.count({ where: { status: "pending" } }),
      client.withdrawals.count({ where: { status: "pending" } }),
      client.orders.aggregate({
        where: {
          created_at: { gte: startOfToday },
          status: "completed",
        },
        _sum: { total: true },
      }),
      client.orders.aggregate({
        where: { status: "completed" },
        _sum: { total: true },
      }),
      client.tickets.count({
        where: {
          status: "purchased",
          created_at: { gte: startOfToday },
        },
      }),
      client.users.count(),
      this.settingsService.getStagingHostname(tenant.operatorId),
      client.raffles.findMany({
        where: { status: { in: ["listed", "active"] } },
        select: { id: true },
      }),
    ]);

    const activeIds = activeRaffleRows.map((r) => r.id);
    let almostSoldOutRaffles = 0;
    if (activeIds.length > 0) {
      const availableByRaffle = await client.tickets.groupBy({
        by: ["raffle_id"],
        where: {
          raffle_id: { in: activeIds },
          status: "available",
        },
        _count: { _all: true },
      });
      almostSoldOutRaffles = availableByRaffle.filter(
        (row) => row._count._all > 0 && row._count._all <= almostSoldOutThreshold,
      ).length;
    }

    return {
      operator_name: tenant.name,
      slug: tenant.slug,
      staff_count: staffCount,
      raffle_count: raffleCount,
      active_raffles: activeRaffleCount,
      almost_sold_out_raffles: almostSoldOutRaffles,
      almost_sold_out_threshold: almostSoldOutThreshold,
      orders_today: ordersToday,
      pending_claims: pendingClaims,
      pending_withdrawals: pendingWithdrawals,
      revenue_today: Number(revenueToday._sum.total ?? 0),
      revenue_total: Number(revenueTotal._sum.total ?? 0),
      tickets_sold_today: ticketsSoldToday,
      player_count: playerCount,
      staging_hostname: domains.staging_hostname,
      custom_domain_verified: domains.custom_domain_verified,
    };
  }

  @Get("staff")
  listStaff(@TenantCtx() tenant: TenantContext) {
    return this.staffService.list(tenant.operatorId);
  }

  @Get("staff/:id")
  getStaff(@TenantCtx() tenant: TenantContext, @Param("id") id: string) {
    return this.staffService.get(tenant.operatorId, id);
  }

  @OperatorRoles("owner", "manager")
  @Post("staff")
  inviteStaff(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Body() body: InviteStaffDto,
  ) {
    return this.staffService.invite(actor, tenant, body);
  }

  @OperatorRoles("owner", "manager")
  @Patch("staff/:id")
  updateStaffRole(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
    @Body() body: UpdateStaffRoleDto,
  ) {
    return this.staffService.updateRole(actor, tenant.operatorId, id, body.role);
  }

  @Get("settings")
  getSettings(@TenantCtx() tenant: TenantContext) {
    return this.settingsService.get(tenant.operatorId);
  }

  @OperatorRoles("owner", "manager")
  @Patch("settings")
  async updateSettings(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Body() body: UpdateSettingsDto,
  ) {
    const updated = await this.settingsService.update(tenant.operatorId, body);
    await this.audit.log(
      tenant.operatorId,
      actor,
      "settings.updated",
      "operator_settings",
      tenant.operatorId,
    );
    return updated;
  }

  @Get("audit-logs")
  async auditLogs(
    @TenantCtx() tenant: TenantContext,
    @Query("search") search?: string,
    @Query("entity_type") entityType?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const { take, skip, page: p, limit: l } = paginate(Number(page) || 1, Number(limit) || 25, 50);

    const where: Prisma.tenant_audit_logsWhereInput = {};
    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { entity_type: { contains: q, mode: "insensitive" } },
        { staff: { email: { contains: q, mode: "insensitive" } } },
      ];
    }
    if (entityType?.trim()) {
      where.entity_type = entityType.trim();
    }

    const [rows, total] = await Promise.all([
      client.tenant_audit_logs.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: { staff: { select: { id: true, email: true } } },
      }),
      client.tenant_audit_logs.count({ where }),
    ]);

    const raffleLookup = await buildRaffleLookupForAudit(client, rows);

    return {
      items: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        entity_href: resolveAuditEntityHref(
          row.entity_type,
          row.entity_id,
          raffleLookup,
        ),
        staff_id: row.operator_staff_id,
        staff_email: row.staff?.email,
        created_at: row.created_at.toISOString(),
      })),
      total,
      page: p,
      limit: l,
    };
  }
}
