import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PublicRoute, TenantCtx } from "./tenant.decorators";
import type { TenantContext } from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@ApiTags("tenant")
@Controller("v1/tenant")
export class TenantController {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  @PublicRoute()
  @Get("context")
  async context(@TenantCtx() tenant: TenantContext) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: tenant.operatorId },
    });
    const social =
      settings?.social_links && typeof settings.social_links === "object"
        ? (settings.social_links as Record<string, string>)
        : {};

    return {
      slug: tenant.slug,
      name: tenant.name,
      gra_registry_id: tenant.graRegistryId,
      hostname: tenant.hostname,
      branding: {
        logo_url: settings?.logo_url,
        primary_color: settings?.primary_color ?? "#00a551",
        support_email: settings?.support_email,
        footer_licence_text: settings?.footer_licence_text,
        social_links: social,
      },
      analytics:
        settings?.analytics_enabled
          ? {
              ga4_measurement_id: settings.ga4_measurement_id,
              facebook_pixel_id: settings.facebook_pixel_id,
            }
          : null,
      legal: {
        faq_text: settings?.faq_text,
        terms_text: settings?.terms_text,
        privacy_text: settings?.privacy_text,
      },
    };
  }
}
