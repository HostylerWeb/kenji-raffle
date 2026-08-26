import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PLAYER_JWT_AUDIENCE } from "@kenji-raffle/shared";
import type { PlayerAuthUser } from "@kenji-raffle/shared";
import { requireJwtSecret } from "../common/security-config";

type JwtPayload = {
  sub: string;
  email: string;
  operatorId: string;
  aud: string;
  type: string;
};

@Injectable()
export class PlayerJwtStrategy extends PassportStrategy(Strategy, "player-jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(),
    });
  }

  validate(payload: JwtPayload): PlayerAuthUser {
    if (payload.aud !== PLAYER_JWT_AUDIENCE || payload.type !== "access") {
      throw new UnauthorizedException("Invalid player token");
    }
    return {
      id: payload.sub,
      email: payload.email,
      operatorId: payload.operatorId,
    };
  }
}
