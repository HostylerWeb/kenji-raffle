import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PLATFORM_ADMIN } from "./platform.decorators";

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const adminOnly = this.reflector.getAllAndOverride<boolean>(IS_PLATFORM_ADMIN, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!adminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string } | undefined;
    if (user?.role !== "platform_admin") {
      throw new ForbiddenException("Platform admin role required");
    }
    return true;
  }
}
