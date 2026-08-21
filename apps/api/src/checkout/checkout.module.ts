import { Module } from "@nestjs/common";
import { PlatformPrismaModule } from "../platform-prisma/platform-prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { PlayerAuthModule } from "../player-auth/player-auth.module";
import { EmailModule } from "../email/email.module";
import { CartModule } from "../cart/cart.module";
import { PlatformModule } from "../platform/platform.module";
import { CheckoutController, PaymentsController } from "./checkout.controller";
import { GatewayCallbackController } from "./gateway-callback.controller";
import { DevMockGatewayController } from "./dev-mock-gateway.controller";
import { CheckoutService } from "./checkout.service";
import { CheckoutPolicyService } from "./checkout-policy.service";

@Module({
  imports: [
    TenantModule,
    PlatformPrismaModule,
    PlayerAuthModule,
    EmailModule,
    CartModule,
    PlatformModule,
  ],
  controllers: [
    CheckoutController,
    PaymentsController,
    GatewayCallbackController,
    DevMockGatewayController,
  ],
  providers: [CheckoutService, CheckoutPolicyService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
