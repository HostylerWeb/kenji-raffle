import { Module } from "@nestjs/common";
import { PlatformPrismaModule } from "./platform-prisma/platform-prisma.module";
import { TenantModule } from "./tenant/tenant.module";
import { HealthModule } from "./health/health.module";
import { PlatformAuthModule } from "./platform-auth/platform-auth.module";
import { PlatformModule } from "./platform/platform.module";
import { OperatorAdminModule } from "./operator-admin/operator-admin.module";
import { OperatorAuthModule } from "./operator-auth/operator-auth.module";
import { MediaModule } from "./media/media.module";
import { PublicModule } from "./public/public.module";
import { PlayerAuthModule } from "./player-auth/player-auth.module";
import { CartModule } from "./cart/cart.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { AccountModule } from "./account/account.module";
import { ContactModule } from "./contact/contact.module";
import { TenantContextGuard } from "./tenant/tenant-context.guard";
import { TenantRateLimitGuard } from "./tenant/tenant-rate-limit.guard";
import { RequestLoggingInterceptor } from "./common/request-logging.interceptor";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [
    PlatformPrismaModule,
    TenantModule,
    HealthModule,
    PlatformAuthModule,
    PlatformModule,
    OperatorAuthModule,
    OperatorAdminModule,
    MediaModule,
    PublicModule,
    PlayerAuthModule,
    CartModule,
    CheckoutModule,
    AccountModule,
    ContactModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantContextGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantRateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
