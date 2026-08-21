import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { FastifyRequest } from "fastify";
import type { PlatformAuthUser } from "@kenji-raffle/shared";
import { PLATFORM_JWT_AUDIENCE } from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

interface JwtPayload {
  sub: string;
  email: string;
  role: PlatformAuthUser["role"];
  aud?: string;
  type?: string;
}

function jwtFromRequest(req: FastifyRequest): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  if (cookies?.platform_access_token) {
    return cookies.platform_access_token;
  }
  return null;
}

@Injectable()
export class PlatformJwtStrategy extends PassportStrategy(Strategy, "platform-jwt") {
  constructor(private readonly platformPrisma: PlatformPrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => jwtFromRequest(req as FastifyRequest),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-secret",
    });
  }

  async validate(payload: JwtPayload): Promise<PlatformAuthUser> {
    if (payload.aud !== PLATFORM_JWT_AUDIENCE || payload.type !== "access") {
      throw new Error("Invalid token");
    }

    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new Error("Invalid token");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
