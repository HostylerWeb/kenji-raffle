import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { PlayerAuthUser } from "@kenji-raffle/shared";

export const IS_OPTIONAL_PLAYER = "isOptionalPlayer";

export const OptionalPlayer = () => SetMetadata(IS_OPTIONAL_PLAYER, true);

export const CurrentPlayer = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PlayerAuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as PlayerAuthUser | undefined;
  },
);
