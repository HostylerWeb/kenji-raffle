import { Module } from "@nestjs/common";
import { OperatorAuthModule } from "../operator-auth/operator-auth.module";
import { PlatformPrismaModule } from "../platform-prisma/platform-prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { MediaModule } from "../media/media.module";
import { EmailModule } from "../email/email.module";
import { OperatorAdminController } from "./operator-admin.controller";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import {
  OperatorSettingsService,
  OperatorStaffService,
} from "./operator-staff.service";
import { OperatorDomainsService } from "./operator-domains.service";
import { OperatorDomainsController } from "./operator-domains.controller";
import { OperatorCatalogService } from "./operator-catalog.service";
import {
  OperatorCategoriesController,
  OperatorRafflesController,
} from "./operator-catalog.controller";
import { OperatorMediaController } from "./operator-media.controller";
import {
  OperatorCouponsController,
  OperatorOrdersController,
} from "./operator-commerce.controller";
import {
  OperatorCouponsService,
  OperatorOrdersService,
} from "./operator-commerce.service";
import { DrawService } from "../draw/draw.service";
import { GraAdminService } from "../gra/gra-admin.service";
import { OperatorDrawController } from "./operator-draw.controller";
import { OperatorPlayersController } from "./operator-players.controller";
import { OperatorPlayersService } from "./operator-players.service";
import { OperatorWithdrawalsController } from "./operator-withdrawals.controller";
import { OperatorWithdrawalsService } from "./operator-withdrawals.service";
import { OperatorReportsController } from "./operator-reports.controller";
import { OperatorReportsService } from "./operator-reports.service";

import { PlatformModule } from "../platform/platform.module";

@Module({
  imports: [
    OperatorAuthModule,
    TenantModule,
    PlatformPrismaModule,
    MediaModule,
    EmailModule,
    PlatformModule,
  ],
  controllers: [
    OperatorAdminController,
    OperatorCategoriesController,
    OperatorRafflesController,
    OperatorMediaController,
    OperatorOrdersController,
    OperatorCouponsController,
    OperatorDomainsController,
    OperatorDrawController,
    OperatorPlayersController,
    OperatorWithdrawalsController,
    OperatorReportsController,
  ],
  providers: [
    OperatorTenantGuard,
    OperatorRolesGuard,
    OperatorStaffService,
    OperatorSettingsService,
    OperatorDomainsService,
    OperatorCatalogService,
    OperatorOrdersService,
    OperatorCouponsService,
    DrawService,
    GraAdminService,
    OperatorPlayersService,
    OperatorWithdrawalsService,
    OperatorReportsService,
  ],
  exports: [OperatorCatalogService, DrawService],
})
export class OperatorAdminModule {}
