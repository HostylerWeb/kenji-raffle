import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { OperatorAuthUser } from "@kenji-raffle/shared";

@Injectable()
export class OperatorTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as OperatorAuthUser | undefined;
    const tenant = request.tenantContext as { operatorId?: string } | undefined;

    if (!user || !tenant?.operatorId) {
      return true;
    }

    if (user.operatorId !== tenant.operatorId) {
      throw new ForbiddenException("Token not valid for this operator site");
    }

    return true;
  }
}
