import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TenantModule } from "../tenant/tenant.module";
import { PlatformPrismaModule } from "../platform-prisma/platform-prisma.module";
import { EmailModule } from "../email/email.module";
import { OperatorAuthController } from "./operator-auth.controller";
import { OperatorAuthService } from "./operator-auth.service";
import { OperatorJwtStrategy } from "./operator-jwt.strategy";
import { OperatorAuthGuard } from "./operator-auth.guard";
import { OperatorTenantGuard } from "../operator-admin/operator-tenant.guard";
import { OperatorTokenStoreService } from "./operator-token-store.service";

@Module({
  imports: [
    TenantModule,
    PlatformPrismaModule,
    EmailModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [OperatorAuthController],
  providers: [
    OperatorAuthService,
    OperatorJwtStrategy,
    OperatorAuthGuard,
    OperatorTenantGuard,
    OperatorTokenStoreService,
  ],
  exports: [OperatorAuthService, OperatorAuthGuard],
})
export class OperatorAuthModule {}
