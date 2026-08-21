import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
    const lowTicketThreshold = Number(process.env.LOW_TICKET_THRESHOLD ?? 50);

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
    let lowTicketRaffles = 0;
    if (activeIds.length > 0) {
      const availableByRaffle = await client.tickets.groupBy({
        by: ["raffle_id"],
        where: {
          raffle_id: { in: activeIds },
          status: "available",
        },
        _count: { _all: true },
      });
      lowTicketRaffles = availableByRaffle.filter(
        (row) => row._count._all > 0 && row._count._all <= lowTicketThreshold,
      ).length;
    }

    return {
      operator_name: tenant.name,
      slug: tenant.slug,
      staff_count: staffCount,
      raffle_count: raffleCount,
      active_raffles: activeRaffleCount,
      low_ticket_raffles: lowTicketRaffles,
      low_ticket_threshold: lowTicketThreshold,
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
  async auditLogs(@TenantCtx() tenant: TenantContext) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const rows = await client.tenant_audit_logs.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: { staff: { select: { email: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      staff_email: row.staff?.email,
      created_at: row.created_at.toISOString(),
    }));
  }
}
