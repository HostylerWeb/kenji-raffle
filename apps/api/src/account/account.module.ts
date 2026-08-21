import { Module } from "@nestjs/common";
import { TenantModule } from "../tenant/tenant.module";
import { PlayerAuthModule } from "../player-auth/player-auth.module";
import { MediaModule } from "../media/media.module";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

import { PlatformModule } from "../platform/platform.module";

@Module({
  imports: [TenantModule, PlayerAuthModule, MediaModule, PlatformModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
