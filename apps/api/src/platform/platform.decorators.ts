import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { PlatformAuthUser } from "@kenji-raffle/shared";

export const IS_PLATFORM_ADMIN = "isPlatformAdmin";

export const PlatformAdminOnly = () => SetMetadata(IS_PLATFORM_ADMIN, true);

export const CurrentPlatformUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PlatformAuthUser => {
    return ctx.switchToHttp().getRequest().user as PlatformAuthUser;
  },
);
