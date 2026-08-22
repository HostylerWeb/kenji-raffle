import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import type { OperatorAuthUser, OperatorStaffRole, TenantContext } from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import { EmailService } from "../email/email.service";
import {
  buildRaffleLookupForAudit,
  resolveAuditEntityHref,
} from "../common/audit-entity-links";

const INVITE_ROLES: Record<OperatorStaffRole, OperatorStaffRole[]> = {
  owner: ["owner", "manager", "support", "finance"],
  manager: ["manager", "support", "finance"],
  support: [],
  finance: [],
};

@Injectable()
export class OperatorStaffService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
    private readonly email: EmailService,
    private readonly platformPrisma: PlatformPrismaService,
  ) {}

  async list(operatorId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const rows = await client.operator_staff.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        last_login_at: true,
        created_at: true,
      },
    });
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      last_login_at: row.last_login_at?.toISOString(),
      created_at: row.created_at.toISOString(),
    }));
  }

  async get(operatorId: string, staffId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const staff = await client.operator_staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        email: true,
        role: true,
        mfa_enabled: true,
        mfa_secret_encrypted: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!staff) throw new NotFoundException("Staff member not found");

    const recent_activity = await client.tenant_audit_logs.findMany({
      where: { operator_staff_id: staffId },
      orderBy: { created_at: "desc" },
      take: 25,
      select: {
        id: true,
        action: true,
        entity_type: true,
        entity_id: true,
        created_at: true,
      },
    });

    const raffleLookup = await buildRaffleLookupForAudit(client, recent_activity);

    return {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      mfa_enabled: staff.mfa_enabled,
      mfa_pending: Boolean(staff.mfa_secret_encrypted) && !staff.mfa_enabled,
      last_login_at: staff.last_login_at?.toISOString() ?? null,
      created_at: staff.created_at.toISOString(),
      updated_at: staff.updated_at.toISOString(),
      recent_activity: recent_activity.map((row) => ({
        id: row.id,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        entity_href: resolveAuditEntityHref(
          row.entity_type,
          row.entity_id,
          raffleLookup,
        ),
        created_at: row.created_at.toISOString(),
      })),
    };
  }

  async invite(
    actor: OperatorAuthUser,
    tenant: TenantContext,
    input: { email: string; password: string; role: OperatorStaffRole },
  ) {
    const allowed = INVITE_ROLES[actor.role];
    if (!allowed.includes(input.role)) {
      throw new ForbiddenException("You cannot assign this role");
    }

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const email = input.email.trim().toLowerCase();
    const existing = await client.operator_staff.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email is already in use");
    }

    const password_hash = await bcrypt.hash(input.password, 12);
    const staff = await client.operator_staff.create({
      data: {
        email,
        password_hash,
        role: input.role,
      },
    });

    await this.audit.log(actor.operatorId, actor, "staff.invited", "operator_staff", staff.id, {
      email,
      role: input.role,
    });

    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: tenant.operatorId },
    });
    await this.email.sendStaffInvite(
      tenant,
      email,
      input.password,
      settings?.support_email,
    );

    return {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      created_at: staff.created_at.toISOString(),
    };
  }

  async updateRole(
    actor: OperatorAuthUser,
    operatorId: string,
    staffId: string,
    role: OperatorStaffRole,
  ) {
    const allowed = INVITE_ROLES[actor.role];
    if (!allowed.includes(role)) {
      throw new ForbiddenException("You cannot assign this role");
    }

    const client = await this.tenantConnection.getClient(operatorId);
    const staff = await client.operator_staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }

    if (staff.role === "owner" && actor.role !== "owner") {
      throw new ForbiddenException("Only owners can change owner accounts");
    }

    if (staff.id === actor.id && role !== actor.role) {
      throw new BadRequestException("You cannot change your own role");
    }

    const updated = await client.operator_staff.update({
      where: { id: staffId },
      data: { role },
    });

    await this.audit.log(actor.operatorId, actor, "staff.role_updated", "operator_staff", staffId, {
      role,
    });

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
    };
  }
}

@Injectable()
export class OperatorSettingsService {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  async get(operatorId: string) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: operatorId },
      include: { settings: true },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    return {
      name: operator.name,
      slug: operator.slug,
      gra_registry_id: operator.gra_registry_id,
      licence_number: operator.licence_number,
      default_tax_rate: Number(operator.default_tax_rate),
      branding: {
        logo_url: operator.settings?.logo_url,
        primary_color: operator.settings?.primary_color ?? "#00a551",
        support_email: operator.settings?.support_email,
        footer_licence_text: operator.settings?.footer_licence_text,
        social_links: operator.settings?.social_links ?? {},
      },
      analytics: {
        ga4_measurement_id: operator.settings?.ga4_measurement_id,
        facebook_pixel_id: operator.settings?.facebook_pixel_id,
        analytics_enabled: operator.settings?.analytics_enabled ?? false,
      },
      legal: {
        faq_text: operator.settings?.faq_text,
        terms_text: operator.settings?.terms_text,
        privacy_text: operator.settings?.privacy_text,
      },
    };
  }

  async update(
    operatorId: string,
    input: {
      support_email?: string;
      primary_color?: string;
      footer_licence_text?: string;
      licence_number?: string;
      social_links?: Record<string, string>;
      ga4_measurement_id?: string | null;
      facebook_pixel_id?: string | null;
      analytics_enabled?: boolean;
      faq_text?: string | null;
      terms_text?: string | null;
      privacy_text?: string | null;
      logo_url?: string | null;
    },
  ) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: operatorId },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    if (input.licence_number !== undefined) {
      await this.platformPrisma.client.operators.update({
        where: { id: operatorId },
        data: { licence_number: input.licence_number },
      });
    }

    await this.platformPrisma.client.operator_settings.upsert({
      where: { operator_id: operatorId },
      update: {
        support_email: input.support_email,
        primary_color: input.primary_color,
        footer_licence_text: input.footer_licence_text,
        social_links: input.social_links as object | undefined,
        ga4_measurement_id: input.ga4_measurement_id,
        facebook_pixel_id: input.facebook_pixel_id,
        analytics_enabled: input.analytics_enabled,
        faq_text: input.faq_text,
        terms_text: input.terms_text,
        privacy_text: input.privacy_text,
        logo_url: input.logo_url,
      },
      create: {
        operator_id: operatorId,
        support_email: input.support_email,
        primary_color: input.primary_color ?? "#00a551",
        footer_licence_text: input.footer_licence_text,
        social_links: input.social_links as object | undefined,
        ga4_measurement_id: input.ga4_measurement_id,
        facebook_pixel_id: input.facebook_pixel_id,
        analytics_enabled: input.analytics_enabled ?? false,
        faq_text: input.faq_text,
        terms_text: input.terms_text,
        privacy_text: input.privacy_text,
        logo_url: input.logo_url,
      },
    });

    return this.get(operatorId);
  }

  async getStagingHostname(operatorId: string) {
    const domains = await this.platformPrisma.client.operator_domains.findMany({
      where: { operator_id: operatorId },
    });
    const staging = domains.find((d) => d.domain_type === "subdomain");
    const customVerified = domains.some(
      (d) =>
        d.domain_type === "custom" && d.verification_status === "verified",
    );
    return {
      staging_hostname: staging?.hostname ?? null,
      custom_domain_verified: customVerified,
    };
  }
}
