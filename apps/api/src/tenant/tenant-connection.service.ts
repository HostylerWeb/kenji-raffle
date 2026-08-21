import {
  Injectable,
  OnModuleDestroy,
} from "@nestjs/common";
import {
  createTenantPrismaClient,
  type TenantPrismaClient,
} from "@kenji-raffle/database-tenant";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@Injectable()
export class TenantConnectionService implements OnModuleDestroy {
  private readonly clients = new Map<string, TenantPrismaClient>();

  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  async getClient(operatorId: string): Promise<TenantPrismaClient> {
    const cached = this.clients.get(operatorId);
    if (cached) return cached;

    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    const record = await this.platformPrisma.client.tenant_databases.findUnique({
      where: { operator_id: operatorId },
    });
    if (!record || record.status !== "active") {
      throw new Error(`Tenant database not active for operator ${operatorId}`);
    }

    const url = decryptSecret(record.connection_url_encrypted, encryptionKey);
    const client = createTenantPrismaClient(url);
    this.clients.set(operatorId, client);
    return client;
  }

  getPoolStats() {
    return {
      cached_tenant_clients: this.clients.size,
      operator_ids: [...this.clients.keys()],
    };
  }

  async onModuleDestroy() {
    await Promise.all(
      [...this.clients.values()].map((client) => client.$disconnect()),
    );
  }
}
