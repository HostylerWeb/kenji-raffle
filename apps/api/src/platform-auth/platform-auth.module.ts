import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PlatformAuthController } from "./platform-auth.controller";
import { PlatformAuthService } from "./platform-auth.service";
import { PlatformJwtStrategy } from "./platform-jwt.strategy";
import { PlatformAuthGuard } from "./platform-auth.guard";
import { PlatformTokenStoreService } from "./platform-token-store.service";

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [PlatformAuthController],
  providers: [
    PlatformAuthService,
    PlatformJwtStrategy,
    PlatformAuthGuard,
    PlatformTokenStoreService,
  ],
  exports: [PlatformAuthService, PlatformAuthGuard],
})
export class PlatformAuthModule {}
