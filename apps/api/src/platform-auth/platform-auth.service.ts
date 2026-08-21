import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { generateSecret, generateURI, verifySync } from "otplib";
import type { PlatformAuthUser, PlatformLoginResponse } from "@kenji-raffle/shared";
import { encryptSecret, decryptSecret, PLATFORM_JWT_AUDIENCE, requireEnv } from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { PlatformTokenStoreService } from "./platform-token-store.service";
import { sendMail } from "../email/mailer";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export type LoginResult =
  | PlatformLoginResponse
  | { mfa_required: true; message: string };

@Injectable()
export class PlatformAuthService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly jwtService: JwtService,
    private readonly tokenStore: PlatformTokenStoreService,
  ) {}

  async login(
    email: string,
    password: string,
    ip = "unknown",
    mfaCode?: string,
  ): Promise<LoginResult> {
    this.assertLoginRateLimit(ip);

    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.mfa_enabled && user.mfa_secret_encrypted) {
      if (!mfaCode) {
        return {
          mfa_required: true,
          message: "MFA code required",
        };
      }
      const secret = this.decryptMfaSecret(user.mfa_secret_encrypted);
      const ok = verifySync({ token: mfaCode, secret });
      if (!ok) {
        throw new UnauthorizedException("Invalid MFA code");
      }
    }

    await this.platformPrisma.client.platform_users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const authUser: PlatformAuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return this.tokenResponse(authUser);
  }

  async refresh(refreshToken: string): Promise<PlatformLoginResponse> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: PlatformAuthUser["role"];
        aud: string;
        type: string;
        jti?: string;
      }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      });

      if (payload.aud !== PLATFORM_JWT_AUDIENCE || payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      if (!payload.jti) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const valid = await this.tokenStore.validateRefreshToken(
        payload.jti,
        payload.sub,
      );
      if (!valid) {
        throw new UnauthorizedException("Refresh token revoked or expired");
      }

      await this.tokenStore.revokeRefreshToken(payload.jti, payload.sub);

      const user = await this.platformPrisma.client.platform_users.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const authUser: PlatformAuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return this.tokenResponse(authUser);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<{ ok: true; revoked: number }> {
    let revoked = 0;
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify<{ sub: string; jti?: string }>(
          refreshToken,
          {
            secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
          },
        );
        if (payload.jti && payload.sub === userId) {
          await this.tokenStore.revokeRefreshToken(payload.jti, userId);
          revoked = 1;
        }
      } catch {
        // ignore invalid token on logout
      }
    }
    revoked += await this.tokenStore.revokeAllForUser(userId);
    return { ok: true, revoked };
  }

  async setupMfa(userId: string) {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    const secret = generateSecret();
    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    await this.platformPrisma.client.platform_users.update({
      where: { id: userId },
      data: {
        mfa_secret_encrypted: encryptSecret(secret, encryptionKey),
        mfa_enabled: false,
      },
    });

    const otpauthUrl = generateURI({
      issuer: "Kenji Raffle Platform",
      label: user.email,
      secret,
    });

    return { otpauth_url: otpauthUrl, secret };
  }

  async enableMfa(userId: string, code: string) {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: userId },
    });
    if (!user?.mfa_secret_encrypted) {
      throw new BadRequestException("Run MFA setup first");
    }
    const secret = this.decryptMfaSecret(user.mfa_secret_encrypted);
    if (!verifySync({ token: code, secret })) {
      throw new BadRequestException("Invalid MFA code");
    }
    await this.platformPrisma.client.platform_users.update({
      where: { id: userId },
      data: { mfa_enabled: true },
    });
    await this.tokenStore.revokeAllForUser(userId);
    return { ok: true };
  }

  async disableMfa(userId: string, code: string, password: string) {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();
    if (!bcrypt.compareSync(password, user.password_hash)) {
      throw new BadRequestException("Invalid password");
    }
    if (user.mfa_secret_encrypted) {
      const secret = this.decryptMfaSecret(user.mfa_secret_encrypted);
      if (!verifySync({ token: code, secret })) {
        throw new BadRequestException("Invalid MFA code");
      }
    }
    await this.platformPrisma.client.platform_users.update({
      where: { id: userId },
      data: { mfa_enabled: false, mfa_secret_encrypted: null },
    });
    return { ok: true };
  }

  async getSession(userId: string) {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      mfa_enabled: user.mfa_enabled,
    };
  }

  async verifyActorMfa(userId: string, mfaCode?: string): Promise<void> {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: userId },
    });
    if (!user?.mfa_enabled || !user.mfa_secret_encrypted) {
      return;
    }
    if (!mfaCode?.trim()) {
      throw new BadRequestException("MFA code required");
    }
    const secret = this.decryptMfaSecret(user.mfa_secret_encrypted);
    const ok = verifySync({ token: mfaCode.trim(), secret });
    if (!ok) {
      throw new BadRequestException("Invalid MFA code");
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: true }> {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new BadRequestException("Current password is incorrect");
    }

    if (newPassword.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await this.platformPrisma.client.platform_users.update({
      where: { id: userId },
      data: { password_hash },
    });
    await this.tokenStore.revokeAllForUser(userId);

    return { ok: true };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalized = email.trim().toLowerCase();
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { email: normalized },
    });

    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id, purpose: "platform-password-reset" },
        { secret: process.env.JWT_SECRET, expiresIn: "24h" },
      );
      const base = (
        process.env.NEXT_PUBLIC_PLATFORM_URL ??
        `http://platform.kenji-raffle.local:${process.env.PLATFORM_WEB_PORT ?? "3003"}`
      ).replace(/\/$/, "");
      const link = `${base}/reset-password?token=${encodeURIComponent(token)}`;
      await sendMail({
        to: user.email,
        subject: "Reset your Kenji Raffle platform password",
        text: `Reset your platform console password: ${link} (expires in 24 hours)`,
        html: `<p><a href="${link}">Reset your platform password</a> (expires in 24 hours)</p>`,
      });
    }

    return {
      message:
        "If an account exists for that email, password reset instructions have been sent.",
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ ok: true }> {
    if (newPassword.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as { sub: string; purpose?: string };

      if (payload.purpose !== "platform-password-reset") {
        throw new BadRequestException("Invalid reset token");
      }

      const user = await this.platformPrisma.client.platform_users.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new BadRequestException("Invalid or expired reset token");
      }

      const password_hash = await bcrypt.hash(newPassword, 12);
      await this.platformPrisma.client.platform_users.update({
        where: { id: user.id },
        data: { password_hash },
      });
      await this.tokenStore.revokeAllForUser(user.id);

      return { ok: true };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException("Invalid or expired reset token");
    }
  }

  private tokenResponse(authUser: PlatformAuthUser): PlatformLoginResponse {
    const jti = this.tokenStore.createJti();
    const refreshExpires = parseJwtExpires(
      process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    );
    const refresh_token = this.signRefresh(authUser, jti);

    void this.tokenStore.storeRefreshToken(authUser.id, jti, refreshExpires);

    return {
      access_token: this.signAccess(authUser),
      refresh_token,
      user: authUser,
    };
  }

  private decryptMfaSecret(encrypted: string): string {
    return decryptSecret(encrypted, requireEnv("CREDENTIALS_ENCRYPTION_KEY"));
  }

  private assertLoginRateLimit(ip: string) {
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
      loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
      return;
    }
    entry.count += 1;
    if (entry.count > LOGIN_MAX_ATTEMPTS) {
      throw new UnauthorizedException(
        "Too many login attempts. Try again later.",
      );
    }
  }

  private signAccess(user: PlatformAuthUser): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        aud: PLATFORM_JWT_AUDIENCE,
        type: "access",
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: parseJwtExpires(process.env.JWT_EXPIRES_IN ?? "30m"),
      },
    );
  }

  private signRefresh(user: PlatformAuthUser, jti: string): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        aud: PLATFORM_JWT_AUDIENCE,
        type: "refresh",
        jti,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
        expiresIn: parseJwtExpires(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"),
      },
    );
  }
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
