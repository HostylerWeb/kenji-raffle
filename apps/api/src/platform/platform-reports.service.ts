import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { PlatformAuthUser } from "@kenji-raffle/shared";
import { processGraOutboundForOperator } from "@kenji-raffle/shared";
import { TENANT_SCHEMA_VERSION } from "@kenji-raffle/database-tenant";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { PlatformAuditService } from "./platform-audit.service";

function parseDateParam(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

@Injectable()
export class PlatformReportsService {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  async crossOperator(from?: string, to?: string) {
    const fromDate = parseDateParam(from);
    const toDate = parseDateParam(to);

    const operators = await this.platformPrisma.client.operators.findMany({
      select: { id: true, slug: true, name: true, status: true },
    });

    const rollupWhere =
      fromDate || toDate
        ? {
            date: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : undefined;

    const rollups = await this.platformPrisma.client.tenant_daily_rollups.groupBy({
      by: ["operator_id"],
      where: rollupWhere,
      _sum: {
        gross_sales: true,
        tax_collected: true,
        orders_count: true,
        failed_gra_events: true,
      },
    });

    const rollupMap = new Map(
      rollups.map((row) => [row.operator_id, row._sum]),
    );

    return operators.map((op) => {
      const sums = rollupMap.get(op.id);
      return {
        operator_id: op.id,
        slug: op.slug,
        name: op.name,
        status: op.status,
        gross_sales_total: Number(sums?.gross_sales ?? 0),
        tax_collected_total: Number(sums?.tax_collected ?? 0),
        orders_total: sums?.orders_count ?? 0,
        failed_gra_events_total: sums?.failed_gra_events ?? 0,
      };
    });
  }

  async operatorRollup(operatorId: string) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: operatorId },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    const rows = await this.platformPrisma.client.tenant_daily_rollups.findMany({
      where: { operator_id: operatorId },
      orderBy: { date: "desc" },
      take: 90,
    });

    return rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      gross_sales: Number(row.gross_sales),
      tax_collected: Number(row.tax_collected),
      orders_count: row.orders_count,
      active_raffles: row.active_raffles,
      failed_gra_events: row.failed_gra_events,
    }));
  }

  async graHealth() {
    const operators = await this.platformPrisma.client.operators.findMany({
      where: { status: { in: ["active", "suspended"] } },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        settings: {
          select: {
            gra_api_key_encrypted: true,
            gra_hmac_secret_encrypted: true,
          },
        },
      },
    });

    const rollupSums = await this.platformPrisma.client.tenant_daily_rollups.groupBy({
      by: ["operator_id"],
      _sum: { failed_gra_events: true },
    });
    const failedMap = new Map(
      rollupSums.map((r) => [r.operator_id, r._sum.failed_gra_events ?? 0]),
    );

    return operators.map((op) => ({
      operator_id: op.id,
      slug: op.slug,
      name: op.name,
      status: op.status,
      gra_credentials_configured:
        Boolean(op.settings?.gra_api_key_encrypted) &&
        Boolean(op.settings?.gra_hmac_secret_encrypted),
      failed_gra_events_total: failedMap.get(op.id) ?? 0,
    }));
  }
}

@Injectable()
export class PlatformDrilldownService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: PlatformAuditService,
  ) {}

  async orders(
    user: PlatformAuthUser,
    operatorId: string,
    page = 1,
    limit = 50,
  ) {
    const client = await this.requireActiveTenant(user, operatorId, "orders");

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      client.orders.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          total: true,
          created_at: true,
          user: { select: { email: true } },
        },
      }),
      client.orders.count(),
    ]);

    return {
      items: orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        user_email: order.user.email,
        created_at: order.created_at.toISOString(),
      })),
      page,
      limit,
      total,
    };
  }

  async payments(
    user: PlatformAuthUser,
    operatorId: string,
    page = 1,
    limit = 50,
  ) {
    const client = await this.requireActiveTenant(
      user,
      operatorId,
      "payments",
    );

    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      client.payments.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          amount: true,
          tax_amount: true,
          payment_method: true,
          created_at: true,
          order_id: true,
          user: { select: { email: true } },
        },
      }),
      client.payments.count(),
    ]);

    return {
      items: payments.map((payment) => ({
        id: payment.id,
        order_id: payment.order_id,
        status: payment.status,
        amount: Number(payment.amount),
        tax_amount: Number(payment.tax_amount),
        payment_method: payment.payment_method,
        user_email: payment.user.email,
        created_at: payment.created_at.toISOString(),
      })),
      page,
      limit,
      total,
    };
  }

  async summary(user: PlatformAuthUser, operatorId: string) {
    const client = await this.requireActiveTenant(user, operatorId, "summary");

    const [
      players,
      orders,
      completedOrders,
      activeRaffles,
      failedGra,
      tenantDb,
    ] = await Promise.all([
      client.users.count(),
      client.orders.count(),
      client.orders.count({ where: { status: "completed" } }),
      client.raffles.count({
        where: { status: { in: ["listed", "active"] } },
      }),
      client.gra_outbound_events.count({ where: { status: "failed" } }),
      this.platformPrisma.client.tenant_databases.findUnique({
        where: { operator_id: operatorId },
      }),
    ]);

    return {
      players_count: players,
      orders_count: orders,
      completed_orders_count: completedOrders,
      active_raffles_count: activeRaffles,
      failed_gra_events_count: failedGra,
      schema_version: tenantDb?.schema_version ?? null,
      expected_schema_version: TENANT_SCHEMA_VERSION,
      schema_drift:
        tenantDb?.schema_version &&
        tenantDb.schema_version !== TENANT_SCHEMA_VERSION,
    };
  }

  async graEvents(
    user: PlatformAuthUser,
    operatorId: string,
    page = 1,
    limit = 50,
    status?: string,
  ) {
    const client = await this.requireActiveTenant(user, operatorId, "gra_events");

    const skip = (page - 1) * limit;
    const where =
      status && ["pending", "sent", "failed"].includes(status)
        ? { status: status as "pending" | "sent" | "failed" }
        : undefined;

    const [events, total] = await Promise.all([
      client.gra_outbound_events.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          event_type: true,
          status: true,
          retry_count: true,
          last_error: true,
          created_at: true,
          processed_at: true,
        },
      }),
      client.gra_outbound_events.count({ where }),
    ]);

    const lastSuccess = await client.gra_outbound_events.findFirst({
      where: { status: "sent" },
      orderBy: { processed_at: "desc" },
      select: { processed_at: true, event_type: true },
    });

    return {
      items: events.map((event) => ({
        id: event.id,
        event_type: event.event_type,
        status: event.status,
        retry_count: event.retry_count,
        last_error: event.last_error,
        created_at: event.created_at.toISOString(),
        processed_at: event.processed_at?.toISOString() ?? null,
      })),
      page,
      limit,
      total,
      last_successful_at: lastSuccess?.processed_at?.toISOString() ?? null,
      last_successful_type: lastSuccess?.event_type ?? null,
    };
  }

  async retryGraEvent(
    user: PlatformAuthUser,
    operatorId: string,
    eventId: string,
  ) {
    const client = await this.requireActiveTenant(
      user,
      operatorId,
      "gra_retry",
    );

    const event = await client.gra_outbound_events.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException("GRA event not found");
    }
    if (event.status !== "failed") {
      throw new BadRequestException("Only failed events can be retried");
    }

    await client.gra_outbound_events.update({
      where: { id: eventId },
      data: {
        status: "pending",
        last_error: null,
        retry_count: 0,
      },
    });

    await this.audit.log(
      user,
      "operator.gra_event_retry",
      "gra_outbound_events",
      eventId,
      operatorId,
      { event_type: event.event_type },
    );

    await processGraOutboundForOperator(operatorId);

    return { ok: true, event_id: eventId, status: "pending" };
  }

  private async requireActiveTenant(
    user: PlatformAuthUser,
    operatorId: string,
    action: string,
  ) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: operatorId },
      include: { tenant_database: true },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }
    if (operator.tenant_database?.status !== "active") {
      throw new NotFoundException("Tenant database is not active");
    }

    await this.audit.log(
      user,
      `operator.drill_down_${action}`,
      action,
      undefined,
      operatorId,
    );

    return this.tenantConnection.getClient(operatorId);
  }
}
