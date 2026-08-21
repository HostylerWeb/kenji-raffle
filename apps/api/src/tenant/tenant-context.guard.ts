import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TenantResolverService } from "./tenant-resolver.service";
import {
  IS_PLATFORM_ROUTE,
  IS_PUBLIC_ROUTE,
} from "./tenant.decorators";

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantResolver: TenantResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPlatform = this.reflector.getAllAndOverride<boolean>(IS_PLATFORM_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const url = String(request.url ?? "").split("?")[0];

    if (url.startsWith("/health") || url.startsWith("/docs")) {
      return true;
    }

    const hostHeader = String(
      request.headers["x-forwarded-host"] ?? request.headers.host ?? "",
    );
    const hostname = hostHeader.split(",")[0].trim();

    if (this.tenantResolver.isPlatformHost(hostname)) {
      request.isPlatformHost = true;
      return isPlatform || isPublic;
    }

    if (isPlatform) {
      return true;
    }

    const devSlug = request.headers["x-operator-slug"];
    if (
      process.env.NODE_ENV !== "production" &&
      typeof devSlug === "string" &&
      devSlug.length > 0
    ) {
      request.tenantContext = await this.tenantResolver.resolveBySlug(devSlug);
      return true;
    }

    request.tenantContext = await this.tenantResolver.resolveByHostname(hostname);
    return true;
  }
}
