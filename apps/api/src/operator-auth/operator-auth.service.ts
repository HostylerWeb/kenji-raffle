import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import type {
  OperatorAuthUser,
  OperatorLoginResponse,
  TenantContext,
} from "@kenji-raffle/shared";
import {
  encryptSecret,
  decryptSecret,
  OPERATOR_JWT_AUDIENCE,
  requireEnv,
} from "@kenji-raffle/shared";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { EmailService } from "../email/email.service";
import { OperatorTokenStoreService } from "./operator-token-store.service";

export type OperatorLoginResult =
  | OperatorLoginResponse
  | { mfa_required: true; message: string };

@Injectable()
export class OperatorAuthService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly platformPrisma: PlatformPrismaService,
    private readonly jwtService: JwtService,
    private readonly audit: TenantAuditService,
    private readonly email: EmailService,
    private readonly tokenStore: OperatorTokenStoreService,
  ) {}

  async login(
    tenant: TenantContext,
    email: string,
    password: string,
    mfaCode?: string,
  ): Promise<OperatorLoginResult> {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!staff) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, staff.password_hash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (staff.mfa_enabled && staff.mfa_secret_encrypted) {
      if (!mfaCode?.trim()) {
        return { mfa_required: true, message: "MFA code required" };
      }
      const secret = this.decryptMfaSecret(staff.mfa_secret_encrypted);
      if (!verifySync({ token: mfaCode.trim(), secret })) {
        throw new UnauthorizedException("Invalid MFA code");
      }
    }

    await client.operator_staff.update({
      where: { id: staff.id },
      data: { last_login_at: new Date() },
    });

    const user: OperatorAuthUser = {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      operatorId: tenant.operatorId,
    };

    await this.audit.log(
      tenant.operatorId,
      user,
      "staff.login",
      "operator_staff",
      user.id,
    );

    return this.tokenResponse(user);
  }

  async refresh(refreshToken: string): Promise<OperatorLoginResponse> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: OperatorAuthUser["role"];
        operatorId: string;
        aud?: string;
        type?: string;
        jti?: string;
      }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      });

      if (payload.aud !== OPERATOR_JWT_AUDIENCE || payload.type !== "refresh") {
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
      const staff = await client.operator_staff.findUnique({
        where: { id: payload.sub },
      });
      if (!staff) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user: OperatorAuthUser = {
        id: staff.id,
        email: staff.email,
        role: staff.role,
        operatorId: payload.operatorId,
      };

      return this.tokenResponse(user);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(
    operatorId: string,
    staffId: string,
    refreshToken?: string,
  ): Promise<{ ok: true; revoked: number }> {
    let revoked = 0;
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify<{ sub: string; jti?: string }>(
          refreshToken,
          {
            secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
          },
        );
        if (payload.jti && payload.sub === staffId) {
          await this.tokenStore.revokeRefreshToken(
            payload.jti,
            operatorId,
            staffId,
          );
          revoked = 1;
        }
      } catch {
        // ignore invalid token on logout
      }
    }
    revoked += await this.tokenStore.revokeAllForUser(operatorId, staffId);
    return { ok: true, revoked };
  }

  async getSession(tenant: TenantContext, actor: OperatorAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: actor.id },
    });
    if (!staff) throw new UnauthorizedException();
    return {
      user: {
        id: staff.id,
        email: staff.email,
        role: staff.role,
        operatorId: tenant.operatorId,
      },
      mfa_enabled: staff.mfa_enabled,
    };
  }

  async setupMfa(tenant: TenantContext, actor: OperatorAuthUser) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: actor.id },
    });
    if (!staff) throw new UnauthorizedException();

    const secret = generateSecret();
    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    await client.operator_staff.update({
      where: { id: actor.id },
      data: {
        mfa_secret_encrypted: encryptSecret(secret, encryptionKey),
        mfa_enabled: false,
      },
    });

    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: tenant.operatorId },
    });

    const otpauthUrl = generateURI({
      issuer: operator?.name ?? "Kenji Raffle Operator",
      label: staff.email,
      secret,
    });

    return { otpauth_url: otpauthUrl, secret };
  }

  async enableMfa(
    tenant: TenantContext,
    actor: OperatorAuthUser,
    code: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: actor.id },
    });
    if (!staff?.mfa_secret_encrypted) {
      throw new BadRequestException("Run MFA setup first");
    }
    const secret = this.decryptMfaSecret(staff.mfa_secret_encrypted);
    if (!verifySync({ token: code.trim(), secret })) {
      throw new BadRequestException("Invalid MFA code");
    }
    await client.operator_staff.update({
      where: { id: actor.id },
      data: { mfa_enabled: true },
    });
    await this.tokenStore.revokeAllForUser(tenant.operatorId, actor.id);
    return { ok: true };
  }

  async disableMfa(
    tenant: TenantContext,
    actor: OperatorAuthUser,
    code: string,
    password: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: actor.id },
    });
    if (!staff) throw new UnauthorizedException();
    if (!bcrypt.compareSync(password, staff.password_hash)) {
      throw new BadRequestException("Invalid password");
    }
    if (staff.mfa_secret_encrypted) {
      const secret = this.decryptMfaSecret(staff.mfa_secret_encrypted);
      if (!verifySync({ token: code.trim(), secret })) {
        throw new BadRequestException("Invalid MFA code");
      }
    }
    await client.operator_staff.update({
      where: { id: actor.id },
      data: { mfa_enabled: false, mfa_secret_encrypted: null },
    });
    await this.tokenStore.revokeAllForUser(tenant.operatorId, actor.id);
    return { ok: true };
  }

  async forgotPassword(tenant: TenantContext, email: string) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!staff) return { ok: true };

    const token = this.jwtService.sign(
      { sub: staff.id, purpose: "password-reset", audience: "operator" },
      { secret: process.env.JWT_SECRET, expiresIn: "24h" },
    );

    const supportEmail = await this.getSupportEmail(tenant.operatorId);
    await this.email.sendPasswordReset(
      tenant,
      staff.email,
      token,
      "operator",
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
        secret: process.env.JWT_SECRET,
      }) as { sub: string; purpose?: string; audience?: string };

      if (
        payload.purpose !== "password-reset" ||
        payload.audience !== "operator"
      ) {
        throw new BadRequestException("Invalid reset token");
      }

      const password_hash = await bcrypt.hash(newPassword, 12);
      const client = await this.tenantConnection.getClient(tenant.operatorId);
      await client.operator_staff.update({
        where: { id: payload.sub },
        data: { password_hash },
      });

      return { ok: true };
    } catch {
      throw new BadRequestException("Invalid or expired reset token");
    }
  }

  async changePassword(
    tenant: TenantContext,
    actor: OperatorAuthUser,
    currentPassword: string,
    newPassword: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: actor.id },
    });
    if (!staff) throw new NotFoundException("Staff not found");

    const valid = await bcrypt.compare(currentPassword, staff.password_hash);
    if (!valid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await client.operator_staff.update({
      where: { id: actor.id },
      data: { password_hash },
    });

    await this.audit.log(
      tenant.operatorId,
      actor,
      "staff.password_changed",
      "operator_staff",
      actor.id,
    );

    await this.tokenStore.revokeAllForUser(tenant.operatorId, actor.id);

    return { ok: true };
  }

  private tokenResponse(user: OperatorAuthUser): OperatorLoginResponse {
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

  private decryptMfaSecret(encrypted: string): string {
    return decryptSecret(encrypted, requireEnv("CREDENTIALS_ENCRYPTION_KEY"));
  }

  private async getSupportEmail(operatorId: string) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: operatorId },
    });
    return settings?.support_email ?? null;
  }

  private signAccess(user: OperatorAuthUser): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        operatorId: user.operatorId,
        aud: OPERATOR_JWT_AUDIENCE,
        type: "access",
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: parseJwtExpires(process.env.JWT_EXPIRES_IN ?? "30m"),
      },
    );
  }

  private signRefresh(user: OperatorAuthUser, jti: string): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        operatorId: user.operatorId,
        aud: OPERATOR_JWT_AUDIENCE,
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
