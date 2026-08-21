import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_OPTIONAL_PLAYER } from "./player.decorators";

@Injectable()
export class OptionalPlayerAuthGuard extends AuthGuard("player-jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_PLAYER,
      [context.getHandler(), context.getClass()],
    );
    if (!isOptional) {
      return super.canActivate(context);
    }

    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info?: unknown,
    _context?: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      return undefined as TUser;
    }
    return user;
  }
}
