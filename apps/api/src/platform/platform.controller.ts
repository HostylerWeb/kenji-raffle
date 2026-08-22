import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PlatformRoute } from "../tenant/tenant.decorators";
import { PlatformAuthGuard } from "../platform-auth/platform-auth.guard";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { PlatformReportsService } from "./platform-reports.service";

@ApiTags("platform")
@PlatformRoute()
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller("v1/platform")
export class PlatformController {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly reportsService: PlatformReportsService,
  ) {}

  @Get("dashboard")
  async dashboard() {
    const operators = await this.platformPrisma.client.operators.count();
    const active = await this.platformPrisma.client.operators.count({
      where: { status: "active" },
    });
    const onboarding = await this.platformPrisma.client.operators.count({
      where: { status: "onboarding" },
    });
    const failed = await this.platformPrisma.client.operators.count({
      where: { status: "onboarding_failed" },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayRollups =
      await this.platformPrisma.client.tenant_daily_rollups.aggregate({
        where: { date: today },
        _sum: {
          gross_sales: true,
          tax_collected: true,
          orders_count: true,
          failed_gra_events: true,
        },
      });

    const lifetimeRollups =
      await this.platformPrisma.client.tenant_daily_rollups.aggregate({
        _sum: {
          gross_sales: true,
          tax_collected: true,
          orders_count: true,
          failed_gra_events: true,
        },
      });

    const stuckOnboarding = await this.platformPrisma.client.operators.findMany({
      where: {
        status: "onboarding",
        created_at: { lt: new Date(Date.now() - 15 * 60 * 1000) },
      },
      select: { id: true, slug: true, name: true, created_at: true },
      take: 10,
    });

    const failedDb = await this.platformPrisma.client.tenant_databases.findMany({
      where: { status: "failed" },
      select: {
        operator_id: true,
        provision_error: true,
        operator: { select: { slug: true, name: true } },
      },
      take: 10,
    });

    const alerts: Array<{
      type: string;
      message: string;
      operator_id?: string;
      operator_slug?: string;
    }> = [];

    if (failed > 0) {
      alerts.push({
        type: "provision_failed",
        message: `${failed} operator(s) failed provisioning`,
      });
    }

    for (const row of failedDb) {
      alerts.push({
        type: "tenant_db_failed",
        message: row.provision_error ?? "Tenant database provisioning failed",
        operator_id: row.operator_id,
        operator_slug: row.operator?.slug,
      });
    }

    for (const row of stuckOnboarding) {
      alerts.push({
        type: "stuck_onboarding",
        message: `${row.name} still onboarding since ${row.created_at.toISOString()}`,
        operator_id: row.id,
        operator_slug: row.slug,
      });
    }

    const failedGraToday = todayRollups._sum.failed_gra_events ?? 0;
    if (failedGraToday > 0) {
      alerts.push({
        type: "gra_failures",
        message: `${failedGraToday} failed GRA event(s) today across tenants`,
      });
    }

    const graHealth = await this.reportsService.graHealth();
    for (const row of graHealth) {
      if (row.alert_stale_pending) {
        alerts.push({
          type: "gra_stale_pending",
          message: `${row.name}: GRA queue pending > 15 min (${row.oldest_pending_age_minutes} min)`,
          operator_id: row.operator_id,
          operator_slug: row.slug,
        });
      }
      if (row.alert_heartbeat_failed) {
        alerts.push({
          type: "gra_heartbeat_failed",
          message: `${row.name}: GRA daily heartbeat failed`,
          operator_id: row.operator_id,
          operator_slug: row.slug,
        });
      }
    }

    return {
      operators_total: operators,
      operators_active: active,
      operators_onboarding: onboarding,
      operators_failed: failed,
      gross_sales_today: Number(todayRollups._sum.gross_sales ?? 0),
      tax_collected_today: Number(todayRollups._sum.tax_collected ?? 0),
      orders_today: todayRollups._sum.orders_count ?? 0,
      failed_gra_events_today: failedGraToday,
      gross_sales_total: Number(lifetimeRollups._sum.gross_sales ?? 0),
      tax_collected_total: Number(lifetimeRollups._sum.tax_collected ?? 0),
      orders_total: lifetimeRollups._sum.orders_count ?? 0,
      failed_gra_events_total: lifetimeRollups._sum.failed_gra_events ?? 0,
      alerts,
    };
  }

  @Get("operators")
  async listOperators(@Query("status") status?: string) {
    const rows = await this.platformPrisma.client.operators.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { created_at: "desc" },
      include: {
        tenant_database: true,
        domains: { where: { is_primary: true }, take: 1 },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      gra_registry_id: row.gra_registry_id,
      status: row.status,
      database_status: row.tenant_database?.status,
      primary_hostname: row.domains[0]?.hostname,
      created_at: row.created_at.toISOString(),
    }));
  }

  @Get("audit")
  auditAlias(@Query() query: Record<string, string>) {
    return this.auditLogs(query);
  }

  @Get("audit-logs")
  async auditLogs(@Query() query: Record<string, string>) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));
    const skip = (page - 1) * limit;

    const where: {
      operator_id?: string;
      action?: { contains: string };
      platform_user_id?: string;
      created_at?: { gte?: Date; lte?: Date };
    } = {};

    if (query.operator_id) {
      where.operator_id = query.operator_id;
    }
    if (query.action) {
      where.action = { contains: query.action };
    }
    if (query.user_id) {
      where.platform_user_id = query.user_id;
    }
    if (query.from || query.to) {
      where.created_at = {};
      if (query.from) {
        where.created_at.gte = new Date(query.from);
      }
      if (query.to) {
        where.created_at.lte = new Date(query.to);
      }
    }

    const [rows, total] = await Promise.all([
      this.platformPrisma.client.platform_audit_logs.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        include: {
          platform_user: { select: { email: true } },
          operator: { select: { slug: true, name: true } },
        },
      }),
      this.platformPrisma.client.platform_audit_logs.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        operator_slug: row.operator?.slug,
        operator_name: row.operator?.name,
        user_email: row.platform_user?.email,
        metadata: row.metadata,
        created_at: row.created_at.toISOString(),
      })),
      page,
      limit,
      total,
    };
  }

  @Get("reports/cross-operator")
  crossOperatorReports(
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.reportsService.crossOperator(from, to);
  }

  @Get("reports/gra-health")
  graHealthReport() {
    return this.reportsService.graHealth();
  }

  @Get("reports/failed-provisions")
  async failedProvisionsReport() {
    const stuck = await this.platformPrisma.client.operators.findMany({
      where: {
        status: "onboarding",
        created_at: { lt: new Date(Date.now() - 15 * 60 * 1000) },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        created_at: true,
        tenant_database: { select: { status: true, provision_error: true } },
      },
    });

    const failedOperators = await this.platformPrisma.client.operators.findMany({
      where: { status: "onboarding_failed" },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        created_at: true,
        tenant_database: { select: { status: true, provision_error: true } },
      },
    });

    const failedDb = await this.platformPrisma.client.tenant_databases.findMany({
      where: { status: "failed" },
      select: {
        operator_id: true,
        provision_error: true,
        operator: {
          select: { slug: true, name: true, status: true, created_at: true },
        },
      },
    });

    return {
      stuck_onboarding: stuck.map((row) => ({
        operator_id: row.id,
        slug: row.slug,
        name: row.name,
        status: row.status,
        database_status: row.tenant_database?.status,
        provision_error: row.tenant_database?.provision_error,
        created_at: row.created_at.toISOString(),
      })),
      onboarding_failed: failedOperators.map((row) => ({
        operator_id: row.id,
        slug: row.slug,
        name: row.name,
        status: row.status,
        database_status: row.tenant_database?.status,
        provision_error: row.tenant_database?.provision_error,
        created_at: row.created_at.toISOString(),
      })),
      tenant_db_failed: failedDb.map((row) => ({
        operator_id: row.operator_id,
        slug: row.operator?.slug,
        name: row.operator?.name,
        status: row.operator?.status,
        provision_error: row.provision_error,
        created_at: row.operator?.created_at?.toISOString(),
      })),
    };
  }
}
