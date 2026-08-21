import { Injectable } from "@nestjs/common";
import type { PlatformAuthUser } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-platform";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@Injectable()
export class PlatformAuditService {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  async log(
    user: PlatformAuthUser | null,
    action: string,
    entityType: string,
    entityId?: string,
    operatorId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.platformPrisma.client.platform_audit_logs.create({
      data: {
        platform_user_id: user?.id,
        operator_id: operatorId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
