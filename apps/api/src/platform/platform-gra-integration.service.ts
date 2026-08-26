import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  encryptSecret,
  requireEnv,
  verifyPlatformIntegrationSignature,
  type GraApplicationRejectedPayload,
  type GraCredentialsCallbackPayload,
} from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { PlatformAuditService } from "./platform-audit.service";

@Injectable()
export class PlatformGraIntegrationService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly audit: PlatformAuditService,
  ) {}

  verifySignature(rawBody: string | undefined, signature: string | undefined) {
    const secret = process.env.PLATFORM_GRA_INTEGRATION_SECRET?.trim();
    if (!verifyPlatformIntegrationSignature(rawBody ?? "", signature, secret)) {
      throw new UnauthorizedException("Invalid integration signature");
    }
  }

  async deliverCredentials(
    payload: GraCredentialsCallbackPayload,
    rawBody: string,
  ) {
    if (payload.status !== "approved") {
      throw new BadRequestException("Invalid callback status");
    }

    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: payload.platform_operator_id },
    });
    if (!settings) {
      throw new BadRequestException("Unknown platform operator");
    }

    if (
      settings.gra_application_status === "approved" &&
      settings.gra_api_key_encrypted &&
      settings.gra_hmac_secret_encrypted
    ) {
      return { ok: true, idempotent: true };
    }

    const encKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    const flags =
      (settings.feature_flags as Record<string, boolean>) ?? {};

    await this.platformPrisma.client.operator_settings.update({
      where: { operator_id: payload.platform_operator_id },
      data: {
        gra_api_key_encrypted: encryptSecret(payload.api_key, encKey),
        gra_hmac_secret_encrypted: encryptSecret(payload.hmac_secret, encKey),
        gra_application_status: "approved",
        gra_application_id: payload.gra_application_id,
        gra_approved_at: new Date(),
        gra_rejection_reason: null,
        feature_flags: { ...flags, checkout_enabled: true },
      },
    });

    await this.platformPrisma.client.operators.update({
      where: { id: payload.platform_operator_id },
      data: { gra_registry_id: payload.gra_registry_id },
    });

    await this.audit.log(
      null,
      "gra.credentials_delivered",
      "operator_settings",
      payload.platform_operator_id,
      payload.platform_operator_id,
      { gra_application_id: payload.gra_application_id },
    );

    return { ok: true, idempotent: false };
  }

  async rejectApplication(payload: GraApplicationRejectedPayload) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: payload.platform_operator_id },
    });
    if (!settings) {
      throw new BadRequestException("Unknown platform operator");
    }

    const flags =
      (settings.feature_flags as Record<string, boolean>) ?? {};

    await this.platformPrisma.client.operator_settings.update({
      where: { operator_id: payload.platform_operator_id },
      data: {
        gra_application_status: "rejected",
        gra_rejection_reason: payload.rejection_reason,
        feature_flags: { ...flags, checkout_enabled: false },
      },
    });

    return { ok: true };
  }
}
