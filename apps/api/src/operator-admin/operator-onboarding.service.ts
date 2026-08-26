import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import {
  getKenyaRegionForCounty,
  isGraComplianceReady,
  signPlatformIntegrationBody,
  type GraOperatorApplicationPayload,
} from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";

export type LegalProfileInput = {
  legal_name?: string;
  trading_name?: string;
  registration_number?: string;
  kra_pin?: string;
  beneficial_owner?: string;
  business_email?: string;
  business_phone?: string;
  county?: string;
  region?: string;
  website?: string;
};

const LEGAL_REQUIRED: (keyof LegalProfileInput)[] = [
  "legal_name",
  "trading_name",
  "registration_number",
  "kra_pin",
  "beneficial_owner",
  "business_email",
  "business_phone",
  "county",
  "website",
];

function normalizeWebsite(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidWebsite(url: string): boolean {
  try {
    const parsed = new URL(normalizeWebsite(url));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

@Injectable()
export class OperatorOnboardingService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly audit: TenantAuditService,
  ) {}

  async getStatus(tenant: TenantContext) {
    const settings = await this.getSettingsOrThrow(tenant.operatorId);
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: tenant.operatorId },
      select: { gra_registry_id: true, name: true, slug: true },
    });
    if (!operator) throw new NotFoundException("Operator not found");

    return {
      gra_registry_id: operator.gra_registry_id,
      gra_application_status: settings.gra_application_status,
      legal_profile_locked: Boolean(settings.legal_profile_locked_at),
      gra_connected: isGraComplianceReady(settings),
      gra_application_submitted_at:
        settings.gra_application_submitted_at?.toISOString() ?? null,
      gra_approved_at: settings.gra_approved_at?.toISOString() ?? null,
      gra_rejection_reason: settings.gra_rejection_reason,
      checkout_enabled:
        (settings.feature_flags as Record<string, boolean>)?.checkout_enabled !==
        false,
    };
  }

  async getLegalProfile(tenant: TenantContext) {
    const settings = await this.getSettingsOrThrow(tenant.operatorId);
    return this.mapLegalProfile(settings);
  }

  async updateLegalProfile(
    tenant: TenantContext,
    actor: OperatorAuthUser,
    input: LegalProfileInput,
  ) {
    const settings = await this.getSettingsOrThrow(tenant.operatorId);
    if (settings.legal_profile_locked_at) {
      throw new ForbiddenException(
        "Legal profile is locked and cannot be changed",
      );
    }
    if (
      settings.gra_application_status === "pending_review" ||
      settings.gra_application_status === "approved"
    ) {
      throw new ForbiddenException(
        "Legal profile cannot be edited while GRA review is in progress or complete",
      );
    }

    const county = input.county?.trim() || settings.county;
    const region =
      getKenyaRegionForCounty(county) ??
      (input.region?.trim() || settings.region);
    const websiteRaw = input.website?.trim() || settings.website;
    const website = websiteRaw ? normalizeWebsite(websiteRaw) : null;
    if (websiteRaw && !isValidWebsite(websiteRaw)) {
      throw new BadRequestException("Website URL must be a valid http(s) address");
    }

    const updated = await this.platformPrisma.client.operator_settings.update({
      where: { operator_id: tenant.operatorId },
      data: {
        legal_name: input.legal_name?.trim() || settings.legal_name,
        trading_name: input.trading_name?.trim() || settings.trading_name,
        registration_number:
          input.registration_number?.trim() || settings.registration_number,
        kra_pin: input.kra_pin?.trim() || settings.kra_pin,
        beneficial_owner:
          input.beneficial_owner?.trim() || settings.beneficial_owner,
        business_email: input.business_email?.trim() || settings.business_email,
        business_phone: input.business_phone?.trim() || settings.business_phone,
        county,
        region,
        website,
      },
    });

    await this.audit.log(
      tenant.operatorId,
      actor,
      "onboarding.legal_profile_updated",
      "operator_settings",
      updated.id,
    );

    return this.mapLegalProfile(updated);
  }

  async confirmLegalProfile(
    tenant: TenantContext,
    actor: OperatorAuthUser,
    confirmText: string,
  ) {
    if (confirmText.trim() !== "CONFIRM") {
      throw new BadRequestException('Type CONFIRM to lock your legal profile');
    }

    const settings = await this.getSettingsOrThrow(tenant.operatorId);
    if (settings.legal_profile_locked_at) {
      return this.mapLegalProfile(settings);
    }

    const profile = this.mapLegalProfile(settings);
    for (const field of LEGAL_REQUIRED) {
      if (!profile[field]?.trim()) {
        throw new BadRequestException(`Missing required field: ${field}`);
      }
    }

    if (!isValidWebsite(profile.website!)) {
      throw new BadRequestException("Website URL must be a valid http(s) address");
    }

    const derivedRegion = getKenyaRegionForCounty(profile.county);
    if (profile.county?.trim() && !derivedRegion) {
      throw new BadRequestException("Could not determine region for selected county");
    }

    const updated = await this.platformPrisma.client.operator_settings.update({
      where: { operator_id: tenant.operatorId },
      data: {
        legal_profile_locked_at: new Date(),
        ...(derivedRegion ? { region: derivedRegion } : {}),
        website: normalizeWebsite(profile.website!.trim()),
      },
    });

    await this.audit.log(
      tenant.operatorId,
      actor,
      "onboarding.legal_profile_confirmed",
      "operator_settings",
      updated.id,
    );

    return this.mapLegalProfile(updated);
  }

  async requestGraConnection(
    tenant: TenantContext,
    actor: OperatorAuthUser,
  ) {
    const settings = await this.getSettingsOrThrow(tenant.operatorId);
    if (!settings.legal_profile_locked_at) {
      throw new BadRequestException(
        "Confirm your legal profile before requesting GRA connection",
      );
    }
    if (
      settings.gra_application_status === "submitted" ||
      settings.gra_application_status === "pending_review"
    ) {
      throw new BadRequestException("GRA application already submitted");
    }
    if (settings.gra_application_status === "approved") {
      throw new BadRequestException("GRA connection is already approved");
    }

    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: tenant.operatorId },
      include: {
        domains: { where: { is_primary: true }, take: 1 },
      },
    });
    if (!operator) throw new NotFoundException("Operator not found");

    const stagingHostname =
      operator.domains[0]?.hostname ??
      `${operator.slug}.${process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ?? "force42.com"}`;

    const callbackUrl =
      process.env.KENJI_PLATFORM_CALLBACK_URL ??
      `${process.env.API_PUBLIC_URL ?? "https://api.force42.com"}/v1/platform/integrations/gra/credentials`;

    const payload: GraOperatorApplicationPayload = {
      platform_operator_id: tenant.operatorId,
      proposed_external_id: operator.gra_registry_id,
      staging_hostname: stagingHostname,
      callback_url: callbackUrl,
      legal_name: settings.legal_name!,
      trading_name: settings.trading_name!,
      registration_number: settings.registration_number ?? undefined,
      kra_pin: settings.kra_pin ?? undefined,
      beneficial_owner: settings.beneficial_owner ?? undefined,
      email: settings.business_email ?? undefined,
      phone: settings.business_phone ?? undefined,
      county: settings.county ?? undefined,
      region: settings.region ?? undefined,
      website: settings.website ?? undefined,
      licence_number: operator.licence_number ?? undefined,
    };

    const graBase =
      process.env.GRA_INTEGRATIONS_URL ??
      "https://console.force42.com/api/integrations/v1";
    const secret = process.env.PLATFORM_GRA_INTEGRATION_SECRET?.trim();
    if (!secret) {
      throw new BadRequestException(
        "GRA integration is not configured on the platform",
      );
    }

    const bodyJson = JSON.stringify(payload);
    const signature = signPlatformIntegrationBody(bodyJson, secret);

    const res = await fetch(`${graBase.replace(/\/$/, "")}/operator-applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Platform-Signature": signature,
      },
      body: bodyJson,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new BadRequestException(
        `GRA application failed (${res.status}): ${errText.slice(0, 200)}`,
      );
    }

    const result = (await res.json()) as { application_id: string; status: string };

    await this.platformPrisma.client.operator_settings.update({
      where: { operator_id: tenant.operatorId },
      data: {
        gra_application_status: "pending_review",
        gra_application_id: result.application_id,
        gra_application_submitted_at: new Date(),
        gra_rejection_reason: null,
      },
    });

    await this.audit.log(
      tenant.operatorId,
      actor,
      "onboarding.gra_application_submitted",
      "operator_settings",
      tenant.operatorId,
      { gra_application_id: result.application_id },
    );

    return {
      gra_application_id: result.application_id,
      gra_application_status: "pending_review" as const,
    };
  }

  private async getSettingsOrThrow(operatorId: string) {
    const settings =
      await this.platformPrisma.client.operator_settings.findUnique({
        where: { operator_id: operatorId },
      });
    if (!settings) throw new NotFoundException("Operator settings not found");
    return settings;
  }

  private mapLegalProfile(settings: {
    legal_name: string | null;
    trading_name: string | null;
    registration_number: string | null;
    kra_pin: string | null;
    beneficial_owner: string | null;
    business_email: string | null;
    business_phone: string | null;
    county: string | null;
    region: string | null;
    website: string | null;
    legal_profile_locked_at: Date | null;
    gra_application_status: string;
  }) {
    return {
      legal_name: settings.legal_name,
      trading_name: settings.trading_name,
      registration_number: settings.registration_number,
      kra_pin: settings.kra_pin,
      beneficial_owner: settings.beneficial_owner,
      business_email: settings.business_email,
      business_phone: settings.business_phone,
      county: settings.county,
      region: settings.region,
      website: settings.website,
      legal_profile_locked_at:
        settings.legal_profile_locked_at?.toISOString() ?? null,
      gra_application_status: settings.gra_application_status,
    };
  }
}
