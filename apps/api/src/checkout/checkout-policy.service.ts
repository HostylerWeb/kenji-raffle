import { ForbiddenException, Injectable } from "@nestjs/common";
import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@Injectable()
export class CheckoutPolicyService {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  async assertCheckoutEnabled(operatorId: string) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: operatorId },
    });
    const flags = (settings?.feature_flags as Record<string, unknown>) ?? {};
    if (flags.checkout_enabled === false) {
      throw new ForbiddenException("Checkout is temporarily disabled");
    }
  }

  async getSupportEmail(operatorId: string) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: operatorId },
    });
    return settings?.support_email ?? null;
  }

  async assertUserCanPurchase(
    user: {
      id: string;
      email_verified_at: Date | null;
      account_disabled: boolean;
      play_safe_active: boolean;
      play_safe_until: Date | null;
      spending_limit: unknown;
      spending_limit_period: string | null;
    },
    client: TenantPrismaClient,
    orderTotal: number,
  ) {
    if (!user.email_verified_at) {
      throw new ForbiddenException("Verify your email before purchasing");
    }
    if (user.account_disabled) {
      throw new ForbiddenException("Account disabled");
    }
    if (user.play_safe_active) {
      const now = new Date();
      if (!user.play_safe_until || user.play_safe_until > now) {
        throw new ForbiddenException("Play Safe is active on your account");
      }
      await client.users.update({
        where: { id: user.id },
        data: { play_safe_active: false, play_safe_until: null },
      });
    }

    const limit = user.spending_limit ? Number(user.spending_limit) : null;
    if (limit && user.spending_limit_period) {
      const since = spendingPeriodStart(user.spending_limit_period);
      const [completedAgg, pendingAgg] = await Promise.all([
        client.orders.aggregate({
          where: {
            user_id: user.id,
            status: "completed",
            created_at: { gte: since },
          },
          _sum: { total: true },
        }),
        client.orders.aggregate({
          where: {
            user_id: user.id,
            status: "pending",
            created_at: { gte: since },
          },
          _sum: { total: true },
        }),
      ]);
      const spent =
        Number(completedAgg._sum.total ?? 0) +
        Number(pendingAgg._sum.total ?? 0);
      if (spent + orderTotal > limit) {
        throw new ForbiddenException("Spending limit exceeded for this period");
      }
    }
  }
}

function spendingPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  const d = new Date(now);
  d.setMonth(d.getMonth() - 1);
  return d;
}
