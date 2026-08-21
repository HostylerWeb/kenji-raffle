import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  @Get()
  async check() {
    await this.platformPrisma.client.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      service: "raffle-platform-api",
      timestamp: new Date().toISOString(),
    };
  }
}
