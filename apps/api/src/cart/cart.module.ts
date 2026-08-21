import { Module } from "@nestjs/common";
import { PlatformPrismaModule } from "../platform-prisma/platform-prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { PlayerAuthModule } from "../player-auth/player-auth.module";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [TenantModule, PlatformPrismaModule, PlayerAuthModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
