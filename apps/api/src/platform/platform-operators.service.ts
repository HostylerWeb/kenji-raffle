import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import type { PlatformAuthUser, PlatformRole } from "@kenji-raffle/shared";
import {
  encryptSecret,
  requireEnv,
  decryptSecret,
  testGraIngestConnection,
} from "@kenji-raffle/shared";
import {
  TENANT_SCHEMA_VERSION,
  createTenantPrismaClient,
} from "@kenji-raffle/database-tenant";
import { verifyDomainRecord } from "@kenji-raffle/database-platform";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformQueueService } from "./platform-queue.service";
import { PlatformAuthService } from "../platform-auth/platform-auth.service";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HOSTNAME_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export type CreateOperatorInput = {
  name: string;
  slug: string;
  gra_registry_id?: string;
  licence_number?: string;
  owner_email?: string;
  owner_password?: string;
};

export type UpdateOperatorInput = {
  status?: "active" | "suspended" | "archived";
  name?: string;
  gra_registry_id?: string;
  licence_number?: string;
};

export type AddDomainInput = {
  hostname: string;
  domain_type: "subdomain" | "custom";
};

export type UpdateDomainInput = {
  is_primary?: boolean;
};

export type UpdateOperatorSettingsInput = {
  gra_api_key?: string;
  gra_hmac_secret?: string;
  support_email?: string;
  primary_color?: string;
  logo_url?: string;
  feature_flags?: Record<string, boolean>;
};

@Injectable()
export class PlatformOperatorsService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly audit: PlatformAuditService,
    private readonly queue: PlatformQueueService,
  ) {}

  async create(user: PlatformAuthUser, input: CreateOperatorInput) {
    const slug = input.slug.trim().toLowerCase();
    if (!SLUG_PATTERN.test(slug)) {
      throw new BadRequestException(
        "Slug must be lowercase letters, numbers, and hyphens only",
      );
    }

    const graId = (input.gra_registry_id?.trim() || `op-${slug}`).toLowerCase();
    const existingSlug = await this.platformPrisma.client.operators.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException("Slug is already in use");
    }

    const existingGra = await this.platformPrisma.client.operators.findUnique({
      where: { gra_registry_id: graId },
    });
    if (existingGra) {
      throw new ConflictException("GRA registry id is already in use");
    }

    const ownerEmail = input.owner_email?.trim().toLowerCase();
    if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      throw new BadRequestException("Owner email is invalid");
    }
    if (input.owner_password && input.owner_password.length < 8) {
      throw new BadRequestException(
        "Owner password must be at least 8 characters",
      );
    }
    if (input.owner_password && !ownerEmail) {
      throw new BadRequestException(
        "Owner email is required when setting an owner password",
      );
    }

    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    const resolvedOwnerEmail = ownerEmail ?? `owner@${slug}.local`;

    const operator = await this.platformPrisma.client.operators.create({
      data: {
        name: input.name.trim(),
        slug,
        gra_registry_id: graId,
        licence_number: input.licence_number?.trim() ?? graId,
        status: "onboarding",
      },
    });

    await this.platformPrisma.client.operator_settings.create({
      data: {
        operator_id: operator.id,
        gra_application_status: "not_started",
        feature_flags: {
          checkout_enabled: false,
          owner_password_custom: Boolean(input.owner_password),
        },
        primary_color: "#00a551",
        support_email: `support@${slug}.local`,
        provision_owner_email: resolvedOwnerEmail,
        provision_owner_password_encrypted: input.owner_password
          ? encryptSecret(input.owner_password, encryptionKey)
          : null,
      },
    });

    await this.queue.enqueueProvisionTenant(operator.id);

    await this.audit.log(
      user,
      "operator.created",
      "operators",
      operator.id,
      operator.id,
      {
        slug,
        gra_registry_id: graId,
        owner_email: resolvedOwnerEmail,
        owner_password_custom: Boolean(input.owner_password),
      },
    );

    const created = await this.getById(operator.id);
    return {
      ...created,
      owner_login: {
        email: resolvedOwnerEmail,
        ...(input.owner_password
          ? {}
          : { temporary_password: "ChangeMe123!" }),
      },
    };
  }

  async getById(id: string) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id },
      include: {
        tenant_database: true,
        domains: { orderBy: { is_primary: "desc" } },
        settings: true,
      },
    });

    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    const mapped = this.mapOperator(operator);
    return {
      ...mapped,
      owner_login: await this.resolveOwnerLogin(operator),
    };
  }

  async updateStatus(
    user: PlatformAuthUser,
    id: string,
    input: UpdateOperatorInput,
  ) {
    if (
      !input.status &&
      !input.name &&
      !input.gra_registry_id &&
      !input.licence_number
    ) {
      throw new BadRequestException("No fields to update");
    }

    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    if (input.status === "active" && operator.status === "onboarding_failed") {
      throw new BadRequestException(
        "Re-provision the operator before activating",
      );
    }

    if (input.gra_registry_id) {
      const graId = input.gra_registry_id.trim();
      const existingGra = await this.platformPrisma.client.operators.findFirst({
        where: { gra_registry_id: graId, NOT: { id } },
      });
      if (existingGra) {
        throw new ConflictException("GRA registry id is already in use");
      }
    }

    const updated = await this.platformPrisma.client.operators.update({
      where: { id },
      data: {
        status: input.status,
        name: input.name?.trim(),
        gra_registry_id: input.gra_registry_id?.trim(),
        licence_number: input.licence_number?.trim(),
      },
      include: {
        tenant_database: true,
        domains: { orderBy: { is_primary: "desc" } },
        settings: true,
      },
    });

    await this.audit.log(
      user,
      input.status ? "operator.status_updated" : "operator.updated",
      "operators",
      id,
      id,
      input,
    );

    return this.getById(id);
  }

  async testConnection(operatorId: string) {
    const operator = await this.getOperatorOrThrow(operatorId);
    if (operator.tenant_database?.status !== "active") {
      throw new BadRequestException("Tenant database is not active");
    }

    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    const url = decryptSecret(
      operator.tenant_database!.connection_url_encrypted,
      encryptionKey,
    );
    const client = createTenantPrismaClient(url);
    try {
      await client.$queryRaw`SELECT 1`;
      await client.$disconnect();
      return {
        ok: true,
        schema_version: operator.tenant_database!.schema_version,
        expected_schema_version: TENANT_SCHEMA_VERSION,
        schema_drift:
          operator.tenant_database!.schema_version !== TENANT_SCHEMA_VERSION,
      };
    } catch (err) {
      await client.$disconnect().catch(() => undefined);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Connection failed",
      };
    }
  }

  async migrateTenant(user: PlatformAuthUser, operatorId: string) {
    await this.getOperatorOrThrow(operatorId);
    await this.queue.enqueueMigrateTenant(operatorId);
    await this.audit.log(
      user,
      "operator.migrate_requested",
      "tenant_databases",
      operatorId,
      operatorId,
    );
    return { ok: true, message: "Migration job queued" };
  }

  async inviteStaff(
    user: PlatformAuthUser,
    operatorId: string,
    input: { email: string; role?: "manager" | "support" | "finance" },
  ) {
    const operator = await this.getOperatorOrThrow(operatorId);
    if (operator.tenant_database?.status !== "active") {
      throw new BadRequestException("Tenant database is not active");
    }

    const email = input.email.trim().toLowerCase();
    const role = input.role ?? "manager";
    const tempPassword = randomBytes(12).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    const url = decryptSecret(
      operator.tenant_database!.connection_url_encrypted,
      encryptionKey,
    );
    const client = createTenantPrismaClient(url);
    try {
      const existing = await client.operator_staff.findUnique({
        where: { email },
      });
      if (existing) {
        throw new ConflictException("Staff email already exists for operator");
      }

      const staff = await client.operator_staff.create({
        data: {
          email,
          password_hash: passwordHash,
          role,
        },
      });

      await this.audit.log(
        user,
        "operator.staff_invited",
        "operator_staff",
        staff.id,
        operatorId,
        { email, role },
      );

      return {
        ok: true,
        staff_id: staff.id,
        email,
        role,
        temporary_password: tempPassword,
      };
    } finally {
      await client.$disconnect();
    }
  }

  async queueHardDestroy(
    user: PlatformAuthUser,
    operatorId: string,
    confirmSlug: string,
  ) {
    const operator = await this.getOperatorOrThrow(operatorId);
    if (operator.slug === "demo") {
      throw new BadRequestException('Operator slug "demo" is protected from deletion');
    }
    if (confirmSlug.trim().toLowerCase() !== operator.slug) {
      throw new BadRequestException("Slug confirmation does not match");
    }

    await this.queue.enqueueDestroyTenant(operatorId);
    await this.audit.log(
      user,
      "operator.hard_destroy_queued",
      "operators",
      operatorId,
      operatorId,
      { slug: operator.slug },
    );

    return { ok: true, message: "Permanent delete job queued" };
  }

  async verifyDomainDns(
    user: PlatformAuthUser,
    operatorId: string,
    domainId: string,
  ) {
    await this.getOperatorOrThrow(operatorId);
    const result = await verifyDomainRecord(operatorId, domainId);
    await this.audit.log(
      user,
      "operator.domain_dns_verified",
      "operator_domains",
      domainId,
      operatorId,
      result,
    );
    const domain = await this.platformPrisma.client.operator_domains.findUnique({
      where: { id: domainId },
    });
    return {
      ...result,
      domain: domain ? this.mapDomain(domain) : null,
    };
  }

  async queueVerifyDomainDns(
    user: PlatformAuthUser,
    operatorId: string,
    domainId: string,
  ) {
    await this.getOperatorOrThrow(operatorId);
    const domain = await this.platformPrisma.client.operator_domains.findFirst({
      where: { id: domainId, operator_id: operatorId },
    });
    if (!domain) {
      throw new NotFoundException("Domain not found");
    }
    await this.queue.enqueueVerifyDns(operatorId, domainId);
    await this.audit.log(
      user,
      "operator.domain_dns_verify_queued",
      "operator_domains",
      domainId,
      operatorId,
    );
    return { ok: true, message: "DNS verification job queued" };
  }

  async reprovisionDb(user: PlatformAuthUser, id: string) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id },
      include: { tenant_database: true },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    if (
      operator.status !== "onboarding_failed" &&
      operator.tenant_database?.status !== "failed"
    ) {
      throw new BadRequestException(
        "Re-provision is only allowed for failed onboarding",
      );
    }

    await this.platformPrisma.client.operators.update({
      where: { id },
      data: { status: "onboarding" },
    });

    await this.queue.enqueueProvisionTenant(id);

    await this.audit.log(
      user,
      "operator.reprovision_requested",
      "operators",
      id,
      id,
    );

    return this.getById(id);
  }

  async listDomains(operatorId: string) {
    const operator = await this.getOperatorOrThrow(operatorId);
    return {
      domains: operator.domains.map((domain) => this.mapDomain(domain)),
      dns_instructions: this.dnsInstructions(operatorId),
    };
  }

  async addDomain(
    user: PlatformAuthUser,
    operatorId: string,
    input: AddDomainInput,
  ) {
    await this.getOperatorOrThrow(operatorId);
    const hostname = input.hostname.trim().toLowerCase();

    if (!HOSTNAME_PATTERN.test(hostname)) {
      throw new BadRequestException("Invalid hostname");
    }

    const existing = await this.platformPrisma.client.operator_domains.findUnique({
      where: { hostname },
    });
    if (existing) {
      throw new ConflictException("Hostname is already registered");
    }

    const domain = await this.platformPrisma.client.operator_domains.create({
      data: {
        operator_id: operatorId,
        hostname,
        domain_type: input.domain_type,
        verification_status:
          input.domain_type === "subdomain" ? "verified" : "pending",
        ssl_status: input.domain_type === "subdomain" ? "active" : "pending",
        is_primary: false,
      },
    });

    await this.audit.log(
      user,
      "operator.domain_added",
      "operator_domains",
      domain.id,
      operatorId,
      { hostname, domain_type: input.domain_type },
    );

    return {
      domain: this.mapDomain(domain),
      dns_instructions: this.dnsInstructions(operatorId),
    };
  }

  async updateDomain(
    user: PlatformAuthUser,
    operatorId: string,
    domainId: string,
    input: UpdateDomainInput,
  ) {
    const domain = await this.platformPrisma.client.operator_domains.findFirst({
      where: { id: domainId, operator_id: operatorId },
    });
    if (!domain) {
      throw new NotFoundException("Domain not found");
    }

    if (input.is_primary) {
      await this.platformPrisma.client.operator_domains.updateMany({
        where: { operator_id: operatorId, is_primary: true },
        data: { is_primary: false },
      });
    }

    const updated = await this.platformPrisma.client.operator_domains.update({
      where: { id: domainId },
      data: {
        is_primary: input.is_primary,
      },
    });

    await this.audit.log(
      user,
      "operator.domain_updated",
      "operator_domains",
      domainId,
      operatorId,
      input,
    );

    return this.mapDomain(updated);
  }

  async getSettings(operatorId: string) {
    await this.getOperatorOrThrow(operatorId);
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: operatorId },
    });

    return {
      support_email: settings?.support_email,
      primary_color: settings?.primary_color,
      logo_url: settings?.logo_url,
      feature_flags: (settings?.feature_flags as Record<string, boolean>) ?? {},
      gra_api_key_masked: settings?.gra_api_key_encrypted ? "********" : null,
      gra_hmac_secret_masked: settings?.gra_hmac_secret_encrypted
        ? "********"
        : null,
      gra_credentials_configured:
        Boolean(settings?.gra_api_key_encrypted) &&
        Boolean(settings?.gra_hmac_secret_encrypted),
      gra_last_heartbeat_at:
        settings?.gra_last_heartbeat_at?.toISOString() ?? null,
      gra_last_heartbeat_status: settings?.gra_last_heartbeat_status ?? null,
      gra_last_heartbeat_error: settings?.gra_last_heartbeat_error ?? null,
    };
  }

  async updateSettings(
    user: PlatformAuthUser,
    operatorId: string,
    input: UpdateOperatorSettingsInput,
  ) {
    await this.getOperatorOrThrow(operatorId);
    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");

    const data: Record<string, unknown> = {};
    if (input.support_email !== undefined) {
      data.support_email = input.support_email.trim() || null;
    }
    if (input.primary_color !== undefined) {
      data.primary_color = input.primary_color.trim() || null;
    }
    if (input.logo_url !== undefined) {
      data.logo_url = input.logo_url.trim() || null;
    }
    if (input.feature_flags !== undefined) {
      data.feature_flags = input.feature_flags;
    }
    if (input.gra_api_key) {
      data.gra_api_key_encrypted = encryptSecret(
        input.gra_api_key,
        encryptionKey,
      );
    }
    if (input.gra_hmac_secret) {
      data.gra_hmac_secret_encrypted = encryptSecret(
        input.gra_hmac_secret,
        encryptionKey,
      );
    }

    await this.platformPrisma.client.operator_settings.upsert({
      where: { operator_id: operatorId },
      update: data,
      create: {
        operator_id: operatorId,
        ...data,
      },
    });

    await this.audit.log(
      user,
      "operator.settings_updated",
      "operator_settings",
      operatorId,
      operatorId,
      {
        gra_keys_updated: Boolean(input.gra_api_key || input.gra_hmac_secret),
      },
    );

    return this.getSettings(operatorId);
  }

  async testGraConnection(user: PlatformAuthUser, operatorId: string) {
    await this.getOperatorOrThrow(operatorId);
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: operatorId },
    });

    if (
      !settings?.gra_api_key_encrypted ||
      !settings.gra_hmac_secret_encrypted
    ) {
      throw new BadRequestException("GRA API key and HMAC secret are not configured");
    }

    const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
    const apiKey = decryptSecret(settings.gra_api_key_encrypted, encryptionKey);
    const hmacSecret = decryptSecret(
      settings.gra_hmac_secret_encrypted,
      encryptionKey,
    );

    const result = await testGraIngestConnection({ apiKey, hmacSecret });

    await this.platformPrisma.client.operator_settings.update({
      where: { operator_id: operatorId },
      data: {
        gra_last_heartbeat_at: new Date(),
        gra_last_heartbeat_status: result.ok ? "ok" : "failed",
        gra_last_heartbeat_error: result.ok ? null : result.error,
      },
    });

    await this.audit.log(
      user,
      "operator.gra_connection_test",
      "operator_settings",
      operatorId,
      operatorId,
      { ok: result.ok },
    );

    if (!result.ok) {
      throw new BadRequestException(result.error);
    }

    return { ok: true, message: "GRA ingest connection successful" };
  }

  private dnsInstructions(operatorId: string) {
    const cnameTarget =
      process.env.CUSTOM_DOMAIN_CNAME_TARGET ?? "customers.kenji-raffle.co.ke";
    return {
      cname_target: cnameTarget,
      txt_record_name: `_kenji-verify.${operatorId.slice(0, 8)}`,
      txt_record_value: `kenji-verify=${operatorId}`,
      steps: [
        "Customer adds hostname in their Admin → Domains (or you add it here for them).",
        `At Cloudflare DNS: CNAME www (or raffles) → ${cnameTarget}.`,
        "Remove conflicting apex A records. Optional TXT for verification.",
        "Customer clicks Verify DNS in their admin (or Verify DNS here).",
      ],
    };
  }

  private async resolveOwnerLogin(operator: {
    slug: string;
    tenant_database: { status: string; connection_url_encrypted: string } | null;
    settings: {
      provision_owner_email?: string | null;
      feature_flags?: unknown;
    } | null;
  }) {
    const flags =
      (operator.settings?.feature_flags as Record<string, boolean>) ?? {};
    const defaultEmail = `owner@${operator.slug}.local`;
    let email =
      operator.settings?.provision_owner_email?.trim() || defaultEmail;

    if (operator.tenant_database?.status === "active") {
      try {
        const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
        const url = decryptSecret(
          operator.tenant_database.connection_url_encrypted,
          encryptionKey,
        );
        const client = createTenantPrismaClient(url);
        try {
          const owner = await client.operator_staff.findFirst({
            where: { role: "owner" },
            select: { email: true },
          });
          if (owner?.email) {
            email = owner.email;
          }
        } finally {
          await client.$disconnect();
        }
      } catch {
        // fall back to platform settings
      }
    }

    const passwordCustom = Boolean(flags.owner_password_custom);

    return {
      email,
      password_custom: passwordCustom,
      temporary_password: passwordCustom ? null : "ChangeMe123!",
    };
  }

  private async getOperatorOrThrow(id: string) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id },
      include: {
        tenant_database: true,
        domains: { orderBy: { is_primary: "desc" } },
        settings: true,
      },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }
    return operator;
  }

  private mapDomain(domain: {
    id: string;
    hostname: string;
    domain_type: string;
    verification_status: string;
    ssl_status: string;
    is_primary: boolean;
  }) {
    return {
      id: domain.id,
      hostname: domain.hostname,
      domain_type: domain.domain_type,
      verification_status: domain.verification_status,
      ssl_status: domain.ssl_status,
      is_primary: domain.is_primary,
    };
  }

  private mapOperator(operator: {
    id: string;
    gra_registry_id: string;
    name: string;
    slug: string;
    status: string;
    licence_number: string | null;
    default_tax_rate: unknown;
    created_at: Date;
    updated_at: Date;
    tenant_database: {
      status: string;
      database_name: string;
      database_host: string;
      database_port: number;
      schema_version: string;
      provisioned_at: Date | null;
      provision_error: string | null;
    } | null;
    domains: Array<{
      id: string;
      hostname: string;
      domain_type: string;
      verification_status: string;
      ssl_status: string;
      is_primary: boolean;
    }>;
    settings: {
      support_email: string | null;
      primary_color: string | null;
      logo_url: string | null;
      feature_flags?: unknown;
      gra_api_key_encrypted: string | null;
      gra_hmac_secret_encrypted: string | null;
      gra_last_heartbeat_at: Date | null;
      gra_last_heartbeat_status: string | null;
      gra_last_heartbeat_error: string | null;
      gra_application_status?: string | null;
      gra_application_submitted_at?: Date | null;
      gra_approved_at?: Date | null;
      gra_rejection_reason?: string | null;
      legal_profile_locked_at?: Date | null;
    } | null;
  }) {
    return {
      id: operator.id,
      gra_registry_id: operator.gra_registry_id,
      name: operator.name,
      slug: operator.slug,
      status: operator.status,
      licence_number: operator.licence_number,
      default_tax_rate: Number(operator.default_tax_rate),
      created_at: operator.created_at.toISOString(),
      updated_at: operator.updated_at.toISOString(),
      tenant_database: operator.tenant_database
        ? {
            status: operator.tenant_database.status,
            database_name: operator.tenant_database.database_name,
            database_host: operator.tenant_database.database_host,
            database_port: operator.tenant_database.database_port,
            schema_version: operator.tenant_database.schema_version,
            provisioned_at: operator.tenant_database.provisioned_at?.toISOString(),
            provision_error: operator.tenant_database.provision_error,
          }
        : null,
      domains: operator.domains.map((domain) => this.mapDomain(domain)),
      settings: operator.settings
        ? {
            support_email: operator.settings.support_email,
            primary_color: operator.settings.primary_color,
            logo_url: operator.settings.logo_url,
            feature_flags:
              (operator.settings.feature_flags as Record<string, boolean>) ??
              {},
            gra_credentials_configured:
              Boolean(operator.settings.gra_api_key_encrypted) &&
              Boolean(operator.settings.gra_hmac_secret_encrypted),
            gra_last_heartbeat_at:
              operator.settings.gra_last_heartbeat_at?.toISOString() ?? null,
            gra_last_heartbeat_status:
              operator.settings.gra_last_heartbeat_status ?? null,
            gra_last_heartbeat_error:
              operator.settings.gra_last_heartbeat_error ?? null,
            gra_application_status: operator.settings.gra_application_status,
            gra_application_submitted_at:
              operator.settings.gra_application_submitted_at?.toISOString() ??
              null,
            gra_approved_at:
              operator.settings.gra_approved_at?.toISOString() ?? null,
            gra_rejection_reason: operator.settings.gra_rejection_reason ?? null,
            legal_profile_locked: Boolean(operator.settings.legal_profile_locked_at),
          }
        : null,
      dns_instructions: this.dnsInstructions(operator.id),
    };
  }
}

@Injectable()
export class PlatformUsersService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly audit: PlatformAuditService,
    private readonly authService: PlatformAuthService,
  ) {}

  async list() {
    const users = await this.platformPrisma.client.platform_users.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        last_login_at: true,
        created_at: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      last_login_at: user.last_login_at?.toISOString(),
      created_at: user.created_at.toISOString(),
    }));
  }

  async create(
    actor: PlatformAuthUser,
    input: {
      email: string;
      password: string;
      role: PlatformRole;
      mfa_code?: string;
    },
  ) {
    await this.authService.verifyActorMfa(actor.id, input.mfa_code);

    const email = input.email.trim().toLowerCase();
    const existing = await this.platformPrisma.client.platform_users.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException("Email is already in use");
    }

    const password_hash = await bcrypt.hash(input.password, 12);
    const user = await this.platformPrisma.client.platform_users.create({
      data: {
        email,
        password_hash,
        role: input.role,
      },
    });

    await this.audit.log(
      actor,
      "platform_user.created",
      "platform_users",
      user.id,
      undefined,
      { email, role: input.role },
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at.toISOString(),
    };
  }

  async update(
    actor: PlatformAuthUser,
    id: string,
    input: { role?: PlatformRole; password?: string },
  ) {
    const user = await this.platformPrisma.client.platform_users.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException("Platform user not found");
    }

    const data: { role?: PlatformRole; password_hash?: string } = {};
    if (input.role) {
      data.role = input.role;
    }
    if (input.password) {
      data.password_hash = await bcrypt.hash(input.password, 12);
    }

    const updated = await this.platformPrisma.client.platform_users.update({
      where: { id },
      data,
    });

    await this.audit.log(
      actor,
      "platform_user.updated",
      "platform_users",
      id,
      undefined,
      { role: input.role, password_reset: Boolean(input.password) },
    );

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      created_at: updated.created_at.toISOString(),
    };
  }
}
