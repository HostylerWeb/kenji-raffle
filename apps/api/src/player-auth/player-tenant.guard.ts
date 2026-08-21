import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { PlayerAuthUser, TenantContext } from "@kenji-raffle/shared";

@Injectable()
export class PlayerTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as PlayerAuthUser | undefined;
    const tenant = request.tenantContext as TenantContext | undefined;

    if (!user || !tenant) return true;
    if (user.operatorId !== tenant.operatorId) {
      throw new ForbiddenException("Token not valid for this site");
    }
    return true;
  }
}
