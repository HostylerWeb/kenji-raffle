import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { OperatorAuthUser, OperatorStaffRole } from "@kenji-raffle/shared";

export const OPERATOR_ROLES_KEY = "operatorRoles";

export const OperatorRoles = (...roles: OperatorStaffRole[]) =>
  SetMetadata(OPERATOR_ROLES_KEY, roles);

export const CurrentOperatorStaff = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): OperatorAuthUser => {
    return ctx.switchToHttp().getRequest().user as OperatorAuthUser;
  },
);
