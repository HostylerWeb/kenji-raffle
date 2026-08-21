import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { TenantContext } from "@kenji-raffle/shared";

export const IS_PLATFORM_ROUTE = "isPlatformRoute";
export const IS_PUBLIC_ROUTE = "isPublicRoute";

export const PlatformRoute = () => SetMetadata(IS_PLATFORM_ROUTE, true);
export const PublicRoute = () => SetMetadata(IS_PUBLIC_ROUTE, true);

export const TenantCtx = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext as TenantContext;
  },
);
