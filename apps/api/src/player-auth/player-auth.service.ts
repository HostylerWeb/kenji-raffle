import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import type {
  PlayerAuthUser,
  PlayerLoginResponse,
  TenantContext,
} from "@kenji-raffle/shared";
import { PLAYER_JWT_AUDIENCE } from "@kenji-raffle/shared";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { EmailService } from "../email/email.service";
import { PlayerTokenStoreService } from "./player-token-store.service";
import {
  playerAutoVerifyEmailEnabled,
  requireJwtRefreshSecret,
  requireJwtSecret,
} from "../common/security-config";

@Injectable()
export class PlayerAuthService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly platformPrisma: PlatformPrismaService,
    private readonly jwtService: JwtService,
    private readonly email: EmailService,
    private readonly tokenStore: PlayerTokenStoreService,
  ) {}

  async register(
    tenant: TenantContext,
    input: {
      email: string;
      password: string;
      full_name?: string;
      date_of_birth: string;
      county?: string;
      phone?: string;
    },
  ) {
    if (!isAdult(new Date(input.date_of_birth))) {
      throw new BadRequestException("You must be 18 or older to register");
    }

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const email = input.email.trim().toLowerCase();
    const existing = await client.users.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const password_hash = await bcrypt.hash(input.password, 10);
    const autoVerify = playerAutoVerifyEmailEnabled();

    const user = await client.users.create({
      data: {
        email,
        password_hash,
        full_name: input.full_name,
        date_of_birth: new Date(input.date_of_birth),
        county: input.county?.trim() || null,
        phone: input.phone?.trim() || null,
        email_verified_at: autoVerify ? new Date() : null,
      },
    });

    const verifyToken = autoVerify
      ? null
      : this.jwtService.sign(
          { sub: user.id, email, purpose: "email-verify" },
          {
            secret: requireJwtSecret(),
            expiresIn: "24h",
          },
        );

    if (verifyToken) {
      const supportEmail = await this.getSupportEmail(tenant.operatorId);
      await this.email.sendVerifyEmail(
        tenant,
        email,
        verifyToken,
        supportEmail,
      );
    }

    return {
      id: user.id,
      email: user.email,
      email_verified: autoVerify,
    };
  }

  async login(
    tenant: TenantContext,
    email: string,
    password: string,
    cartSessionId?: string,
  ): Promise<PlayerLoginResponse> {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const user = await client.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.account_disabled) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    await client.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    if (cartSessionId && cartSessionId.length >= 8) {
      const now = new Date();
      await client.cart_items.updateMany({
        where: { session_id: cartSessionId, expires_at: { gt: now } },
        data: { user_id: user.id },
      });
      await client.tickets.updateMany({
        where: { session_id: cartSessionId, status: "reserved" },
        data: { user_id: user.id },
      });
    }

    const authUser: PlayerAuthUser = {
      id: user.id,
      email: user.email,
      operatorId: tenant.operatorId,
    };

    return this.tokenResponse(authUser);
  }

  async refresh(refreshToken: string): Promise<PlayerLoginResponse> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        operatorId: string;
        aud?: string;
        type?: string;
        jti?: string;
      }>(refreshToken, {
        secret: requireJwtRefreshSecret(),
      });

      if (payload.aud !== PLAYER_JWT_AUDIENCE || payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      if (!payload.jti) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const valid = await this.tokenStore.validateRefreshToken(
        payload.jti,
        payload.operatorId,
        payload.sub,
      );
      if (!valid) {
        throw new UnauthorizedException("Refresh token revoked or expired");
      }

      await this.tokenStore.revokeRefreshToken(
        payload.jti,
        payload.operatorId,
        payload.sub,
      );

      const client = await this.tenantConnection.getClient(payload.operatorId);
      const user = await client.users.findUnique({ where: { id: payload.sub } });
      if (!user || user.account_disabled) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const authUser: PlayerAuthUser = {
        id: user.id,
        email: user.email,
        operatorId: payload.operatorId,
      };

      return this.tokenResponse(authUser);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(
    operatorId: string,
    userId: string,
    refreshToken?: string,
  ): Promise<{ ok: true; revoked: number }> {
    let revoked = 0;
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify<{ sub: string; jti?: string }>(
          refreshToken,
          {
            secret: requireJwtRefreshSecret(),
          },
        );
        if (payload.jti && payload.sub === userId) {
          await this.tokenStore.revokeRefreshToken(
            payload.jti,
            operatorId,
            userId,
          );
          revoked = 1;
        }
      } catch {
        // ignore invalid token on logout
      }
    }
    revoked += await this.tokenStore.revokeAllForUser(operatorId, userId);
    return { ok: true, revoked };
  }

  async verifyEmail(tenant: TenantContext, token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: requireJwtSecret(),
      }) as { sub: string; purpose?: string };

      if (payload.purpose !== "email-verify") {
        throw new BadRequestException("Invalid verification token");
      }

      const client = await this.tenantConnection.getClient(tenant.operatorId);
      await client.users.update({
        where: { id: payload.sub },
        data: { email_verified_at: new Date() },
      });

      return { ok: true };
    } catch {
      throw new BadRequestException("Invalid or expired verification token");
    }
  }

  async forgotPassword(tenant: TenantContext, email: string) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const user = await client.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) {
      return { ok: true };
    }

    const token = this.jwtService.sign(
      { sub: user.id, purpose: "password-reset" },
      { secret: requireJwtSecret(), expiresIn: "24h" },
    );

    const supportEmail = await this.getSupportEmail(tenant.operatorId);
    await this.email.sendPasswordReset(
      tenant,
      user.email,
      token,
      "player",
      supportEmail,
    );

    return { ok: true };
  }

  async resetPassword(
    tenant: TenantContext,
    token: string,
    newPassword: string,
  ) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: requireJwtSecret(),
      }) as { sub: string; purpose?: string };

      if (payload.purpose !== "password-reset") {
        throw new BadRequestException("Invalid reset token");
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      const client = await this.tenantConnection.getClient(tenant.operatorId);
      await client.users.update({
        where: { id: payload.sub },
        data: { password_hash },
      });

      await this.tokenStore.revokeAllForUser(tenant.operatorId, payload.sub);

      return { ok: true };
    } catch {
      throw new BadRequestException("Invalid or expired reset token");
    }
  }

  async getMe(tenant: TenantContext, player: PlayerAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    let user = await client.users.findUnique({ where: { id: player.id } });
    if (!user) throw new NotFoundException("User not found");

    const now = new Date();
    if (
      user.play_safe_active &&
      user.play_safe_until &&
      user.play_safe_until <= now
    ) {
      user = await client.users.update({
        where: { id: player.id },
        data: { play_safe_active: false, play_safe_until: null },
      });
    }

    const activeTicketCount = await client.tickets.count({
      where: { user_id: player.id, status: "purchased" },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      email_verified: Boolean(user.email_verified_at),
      site_credit_balance: Number(user.site_credit_balance),
      play_safe_active: user.play_safe_active,
      play_safe_until: user.play_safe_until?.toISOString() ?? null,
      spending_limit: user.spending_limit ? Number(user.spending_limit) : null,
      spending_limit_period: user.spending_limit_period,
      county: user.county,
      kyc_status: user.kyc_status,
      kyc_document_submitted: Boolean(user.kyc_document_url),
      active_ticket_count: activeTicketCount,
    };
  }

  private async getSupportEmail(operatorId: string) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: operatorId },
    });
    return settings?.support_email ?? null;
  }

  private signAccess(user: PlayerAuthUser): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        operatorId: user.operatorId,
        aud: PLAYER_JWT_AUDIENCE,
        type: "access",
      },
      {
        secret: requireJwtSecret(),
        expiresIn: parseJwtExpires(process.env.JWT_EXPIRES_IN ?? "30m"),
      },
    );
  }

  private tokenResponse(user: PlayerAuthUser): PlayerLoginResponse {
    const jti = this.tokenStore.createJti();
    const refreshExpires = parseJwtExpires(
      process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    );
    const refresh_token = this.signRefresh(user, jti);
    void this.tokenStore.storeRefreshToken(
      user.operatorId,
      user.id,
      jti,
      refreshExpires,
    );

    return {
      access_token: this.signAccess(user),
      refresh_token,
      user,
    };
  }

  private signRefresh(user: PlayerAuthUser, jti: string): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        operatorId: user.operatorId,
        aud: PLAYER_JWT_AUDIENCE,
        type: "refresh",
        jti,
      },
      {
        secret: requireJwtRefreshSecret(),
        expiresIn: parseJwtExpires(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"),
      },
    );
  }
}

function isAdult(dob: Date): boolean {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
}

function parseJwtExpires(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return Number(value) || 1800;
  const amount = Number(match[1]);
  switch (match[2]) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 3600;
    case "d":
      return amount * 86400;
    default:
      return 1800;
  }
}
