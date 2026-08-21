import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { verifyDomainRecord } from "@kenji-raffle/database-platform";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";
import type { OperatorAuthUser } from "@kenji-raffle/shared";

const HOSTNAME_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

@Injectable()
export class OperatorDomainsService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly audit: TenantAuditService,
  ) {}

  async list(operatorId: string) {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { id: operatorId },
      include: {
        domains: { orderBy: { is_primary: "desc" } },
      },
    });
    if (!operator) {
      throw new NotFoundException("Operator not found");
    }

    const staging = operator.domains.find((d) => d.domain_type === "subdomain");

    return {
      staging_hostname: staging?.hostname ?? null,
      domains: operator.domains.map((d) => this.mapDomain(d)),
      dns_instructions: this.dnsInstructions(operatorId),
      go_live_steps: this.goLiveSteps(staging?.hostname),
    };
  }

  async addCustomDomain(
    actor: OperatorAuthUser,
    operatorId: string,
    hostname: string,
  ) {
    const normalized = hostname.trim().toLowerCase();
    if (!HOSTNAME_PATTERN.test(normalized)) {
      throw new BadRequestException("Invalid hostname");
    }

    const existing = await this.platformPrisma.client.operator_domains.findUnique({
      where: { hostname: normalized },
    });
    if (existing) {
      throw new ConflictException("Hostname is already registered");
    }

    const domain = await this.platformPrisma.client.operator_domains.create({
      data: {
        operator_id: operatorId,
        hostname: normalized,
        domain_type: "custom",
        verification_status: "pending",
        ssl_status: "pending",
        is_primary: false,
      },
    });

    await this.audit.log(
      operatorId,
      actor,
      "domain.custom_added",
      "operator_domains",
      domain.id,
      { hostname: normalized },
    );

    return {
      domain: this.mapDomain(domain),
      dns_instructions: this.dnsInstructions(operatorId),
    };
  }

  async verifyDns(
    actor: OperatorAuthUser,
    operatorId: string,
    domainId: string,
  ) {
    const domain = await this.platformPrisma.client.operator_domains.findFirst({
      where: { id: domainId, operator_id: operatorId },
    });
    if (!domain) {
      throw new NotFoundException("Domain not found");
    }

    const result = await verifyDomainRecord(operatorId, domainId);

    await this.audit.log(
      operatorId,
      actor,
      "domain.dns_verified",
      "operator_domains",
      domainId,
      result,
    );

    const updated = await this.platformPrisma.client.operator_domains.findUnique({
      where: { id: domainId },
    });

    return {
      ...result,
      domain: updated ? this.mapDomain(updated) : null,
    };
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

  private dnsInstructions(operatorId: string) {
    const cnameTarget =
      process.env.CUSTOM_DOMAIN_CNAME_TARGET ?? "customers.kenji-raffle.co.ke";
    const txtName = `_kenji-verify.${operatorId.slice(0, 8)}`;
    const txtValue = `kenji-verify=${operatorId}`;

    return {
      cname_target: cnameTarget,
      txt_record_name: txtName,
      txt_record_value: txtValue,
      cloudflare_recommended: true,
      records: [
        {
          type: "CNAME",
          name: "www (or raffles)",
          value: cnameTarget,
          note: "Point www.yourbrand.co.ke (or raffles.yourbrand.co.ke) to this target. Do not CNAME www to your apex domain.",
        },
        {
          type: "TXT",
          name: txtName,
          value: txtValue,
          note: "Optional verification record if CNAME check fails.",
        },
      ],
      warnings: [
        "Remove old A records on @ (apex) that conflict with Cloudflare.",
        "Use Cloudflare for DNS (free plan) — move nameservers from GoDaddy/Namecheap if needed.",
        "Allow 15–30 minutes after DNS changes before verifying.",
      ],
    };
  }

  private goLiveSteps(stagingHostname: string | null | undefined) {
    return [
      {
        step: 1,
        title: "Customise your site",
        detail:
          "Set colours, logo, and raffles in Admin. Preview on your staging URL.",
        href: "/admin/settings",
      },
      {
        step: 2,
        title: "Add your domain",
        detail: "Enter www.yourbrand.co.ke (or a subdomain) on the Domains page.",
        href: "/admin/domains",
      },
      {
        step: 3,
        title: "Update DNS at Cloudflare",
        detail:
          "Add the CNAME and TXT records shown below at your registrar or Cloudflare DNS.",
        href: "/admin/domains",
      },
      {
        step: 4,
        title: "Verify DNS",
        detail: "Click Verify DNS in Admin after records propagate.",
        href: "/admin/domains",
      },
      {
        step: 5,
        title: "Go live",
        detail: stagingHostname
          ? `Your site will load on your custom domain. Admin: https://your-domain/admin (staging: ${stagingHostname})`
          : "Your site will load on your custom domain. Admin: https://your-domain/admin",
      },
    ];
  }
}
