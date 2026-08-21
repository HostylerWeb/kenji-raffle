import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { OperatorAuthUser } from "@kenji-raffle/shared";
import { OPERATOR_ROLES_KEY } from "./operator.decorators";

@Injectable()
export class OperatorRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<OperatorAuthUser["role"][]>(
      OPERATOR_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles?.length) {
      return true;
    }

    const user = context.switchToHttp().getRequest().user as OperatorAuthUser;
    if (!roles.includes(user.role)) {
      throw new ForbiddenException("Insufficient operator role");
    }
    return true;
  }
}
