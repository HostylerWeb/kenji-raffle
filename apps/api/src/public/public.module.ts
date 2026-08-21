import { Module } from "@nestjs/common";
import { TenantModule } from "../tenant/tenant.module";
import { OperatorAdminModule } from "../operator-admin/operator-admin.module";
import { PublicRafflesController } from "./public-raffles.controller";

@Module({
  imports: [TenantModule, OperatorAdminModule],
  controllers: [PublicRafflesController],
})
export class PublicModule {}
