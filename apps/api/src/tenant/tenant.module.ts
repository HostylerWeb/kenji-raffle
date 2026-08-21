import { Module } from "@nestjs/common";
import { TenantConnectionService } from "./tenant-connection.service";
import { TenantResolverService } from "./tenant-resolver.service";
import { TenantController } from "./tenant.controller";
import { TenantAuditService } from "./tenant-audit.service";

@Module({
  controllers: [TenantController],
  providers: [TenantConnectionService, TenantResolverService, TenantAuditService],
  exports: [TenantConnectionService, TenantResolverService, TenantAuditService],
})
export class TenantModule {}
