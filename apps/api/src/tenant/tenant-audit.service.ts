import { Injectable } from "@nestjs/common";
import type { OperatorAuthUser } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "./tenant-connection.service";

@Injectable()
export class TenantAuditService {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  async log(
    operatorId: string,
    staff: OperatorAuthUser | null,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    await client.tenant_audit_logs.create({
      data: {
        operator_staff_id: staff?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
