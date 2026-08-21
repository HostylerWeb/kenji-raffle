import { Injectable } from "@nestjs/common";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class OperatorReportsService {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  async getGgr(
    operatorId: string,
    from?: string,
    to?: string,
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const createdAt = this.dateRange(from, to);

    const payments = await client.payments.findMany({
      where: {
        status: "completed",
        ...(createdAt ? { created_at: createdAt } : {}),
      },
      select: {
        amount: true,
        operator_amount: true,
        gateway_fee_amount: true,
        tax_amount: true,
      },
    });

    const gross = payments.reduce((s, p) => s + decimal(p.amount), 0);
    const operatorShare = payments.reduce(
      (s, p) => s + decimal(p.operator_amount),
      0,
    );
    const gatewayFeeTotal = payments.reduce(
      (s, p) => s + decimal(p.gateway_fee_amount),
      0,
    );
    const operatorNetTotal = operatorShare - gatewayFeeTotal;
    const taxCollected = payments.reduce(
      (s, p) => s + decimal(p.tax_amount),
      0,
    );

    const orders = await client.orders.count({
      where: {
        status: "completed",
        ...(createdAt ? { created_at: createdAt } : {}),
      },
    });

    const ticketsSold = await client.tickets.count({
      where: {
        status: { in: ["purchased", "winning"] },
        order: {
          status: "completed",
          ...(createdAt ? { created_at: createdAt } : {}),
        },
      },
    });

    return {
      gross_revenue: gross,
      operator_share: operatorShare,
      operator_net: Math.max(0, operatorNetTotal),
      gateway_fee_total: gatewayFeeTotal,
      tax_collected: taxCollected,
      completed_orders: orders,
      tickets_sold: ticketsSold,
      payment_count: payments.length,
    };
  }

  async getTaxSummary(operatorId: string, from?: string, to?: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const createdAt = this.dateRange(from, to);

    const payments = await client.payments.findMany({
      where: {
        status: "completed",
        ...(createdAt ? { created_at: createdAt } : {}),
      },
      select: {
        tax_amount: true,
        tax_rate: true,
        amount: true,
        operator_amount: true,
      },
    });

    const byRate: Record<string, { tax_amount: number; gross: number; count: number }> =
      {};

    for (const p of payments) {
      const rate = String(decimal(p.tax_rate));
      if (!byRate[rate]) {
        byRate[rate] = { tax_amount: 0, gross: 0, count: 0 };
      }
      byRate[rate].tax_amount += decimal(p.tax_amount);
      byRate[rate].gross += decimal(p.amount);
      byRate[rate].count += 1;
    }

    const totalTax = payments.reduce((s, p) => s + decimal(p.tax_amount), 0);
    const totalGross = payments.reduce((s, p) => s + decimal(p.amount), 0);

    return {
      total_tax_collected: totalTax,
      total_gross: totalGross,
      by_rate: Object.entries(byRate).map(([rate, row]) => ({
        tax_rate: Number(rate),
        tax_amount: row.tax_amount,
        gross: row.gross,
        payment_count: row.count,
      })),
    };
  }

  async getSalesByRaffle(operatorId: string, from?: string, to?: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const createdAt = this.dateRange(from, to);

    const tickets = await client.tickets.findMany({
      where: {
        status: { in: ["purchased", "winning"] },
        order: {
          status: "completed",
          ...(createdAt ? { created_at: createdAt } : {}),
        },
      },
      select: {
        raffle_id: true,
        purchase_price: true,
        raffle: { select: { title: true, slug: true } },
      },
    });

    const map = new Map<
      string,
      { raffle_id: string; title: string; slug: string; tickets: number; revenue: number }
    >();

    for (const ticket of tickets) {
      const existing = map.get(ticket.raffle_id) ?? {
        raffle_id: ticket.raffle_id,
        title: ticket.raffle.title,
        slug: ticket.raffle.slug,
        tickets: 0,
        revenue: 0,
      };
      existing.tickets += 1;
      existing.revenue += decimal(ticket.purchase_price ?? 0);
      map.set(ticket.raffle_id, existing);
    }

    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }

  private dateRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;
    const filter: Prisma.DateTimeFilter = {};
    if (from) filter.gte = new Date(from);
    if (to) filter.lte = new Date(to);
    return filter;
  }
}
