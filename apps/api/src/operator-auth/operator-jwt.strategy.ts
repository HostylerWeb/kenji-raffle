import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { OperatorAuthUser } from "@kenji-raffle/shared";
import { OPERATOR_JWT_AUDIENCE } from "@kenji-raffle/shared";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { requireJwtSecret } from "../common/security-config";

interface JwtPayload {
  sub: string;
  email: string;
  role: OperatorAuthUser["role"];
  operatorId: string;
  aud?: string;
  type?: string;
}

@Injectable()
export class OperatorJwtStrategy extends PassportStrategy(
  Strategy,
  "operator-jwt",
) {
  constructor(private readonly tenantConnection: TenantConnectionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<OperatorAuthUser> {
    if (payload.aud !== OPERATOR_JWT_AUDIENCE || payload.type !== "access") {
      throw new UnauthorizedException("Invalid token");
    }

    const client = await this.tenantConnection.getClient(payload.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: payload.sub },
    });
    if (!staff) {
      throw new UnauthorizedException("Invalid token");
    }

    return {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      operatorId: payload.operatorId,
    };
  }
}
