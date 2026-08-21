import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TenantModule } from "../tenant/tenant.module";
import { PlatformPrismaModule } from "../platform-prisma/platform-prisma.module";
import { EmailModule } from "../email/email.module";
import { PlayerAuthController, PlayerMeController } from "./player-auth.controller";
import { PlayerAuthService } from "./player-auth.service";
import { PlayerJwtStrategy } from "./player-jwt.strategy";
import { PlayerAuthGuard } from "./player-auth.guard";
import { OptionalPlayerAuthGuard } from "./optional-player.guard";
import { PlayerTenantGuard } from "./player-tenant.guard";
import { PlayerTokenStoreService } from "./player-token-store.service";

@Module({
  imports: [
    TenantModule,
    PlatformPrismaModule,
    EmailModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [PlayerAuthController, PlayerMeController],
  providers: [
    PlayerAuthService,
    PlayerJwtStrategy,
    PlayerAuthGuard,
    OptionalPlayerAuthGuard,
    PlayerTenantGuard,
    PlayerTokenStoreService,
  ],
  exports: [
    PlayerAuthService,
    PlayerAuthGuard,
    OptionalPlayerAuthGuard,
    PlayerTenantGuard,
  ],
})
export class PlayerAuthModule {}
