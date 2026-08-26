import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PlatformAuthModule } from "../platform-auth/platform-auth.module";
import { TenantModule } from "../tenant/tenant.module";
import { PlatformController } from "./platform.controller";
import { PlatformOperatorsController } from "./platform-operators.controller";
import {
  PlatformOperatorsService,
  PlatformUsersService,
} from "./platform-operators.service";
import { PlatformUsersController } from "./platform-users.controller";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformQueueService } from "./platform-queue.service";
import { PlatformAdminGuard } from "./platform-admin.guard";
import { PlatformRateLimitGuard } from "./platform-rate-limit.guard";
import { PlatformSystemController } from "./platform-system.controller";
import { PlatformSystemService } from "./platform-system.service";
import {
  PlatformDrilldownService,
  PlatformReportsService,
} from "./platform-reports.service";
import { PlatformGraIntegrationController } from "./platform-gra-integration.controller";
import { PlatformGraIntegrationService } from "./platform-gra-integration.service";

@Module({
  imports: [PlatformAuthModule, TenantModule],
  controllers: [
    PlatformController,
    PlatformOperatorsController,
    PlatformUsersController,
    PlatformSystemController,
    PlatformGraIntegrationController,
  ],
  providers: [
    PlatformOperatorsService,
    PlatformUsersService,
    PlatformAuditService,
    PlatformQueueService,
    PlatformSystemService,
    PlatformReportsService,
    PlatformDrilldownService,
    PlatformGraIntegrationService,
    PlatformAdminGuard,
    PlatformRateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: PlatformRateLimitGuard,
    },
  ],
  exports: [PlatformQueueService],
})
export class PlatformModule {}
