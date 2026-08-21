import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { platformPrisma } from "@kenji-raffle/database-platform";

@Injectable()
export class PlatformPrismaService implements OnModuleDestroy {
  readonly client = platformPrisma;

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
