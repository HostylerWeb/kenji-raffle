import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { TenantContext } from "@kenji-raffle/shared";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@Injectable()
export class TenantResolverService {
  constructor(private readonly platformPrisma: PlatformPrismaService) {}

  isPlatformHost(hostname: string): boolean {
    const platformHost =
      process.env.NEXT_PUBLIC_PLATFORM_HOSTNAME ?? "platform.kenji-raffle.local";
    const bare = hostname.split(":")[0].toLowerCase();
    return bare === platformHost.toLowerCase();
  }

  async resolveByHostname(hostname: string): Promise<TenantContext> {
    const bare = hostname.split(":")[0].toLowerCase();

    if (process.env.NODE_ENV !== "production") {
      const devSlug = process.env.DEV_TENANT_SLUG;
      if (bare === "localhost" && devSlug) {
        return this.resolveBySlug(devSlug);
      }
    }

    const domain = await this.platformPrisma.client.operator_domains.findUnique({
      where: { hostname: bare },
      include: { operator: true },
    });

    if (!domain) {
      throw new NotFoundException("Tenant site not found");
    }

    if (domain.operator.status === "suspended") {
      throw new ForbiddenException("This operator site is suspended");
    }
    if (domain.operator.status === "archived") {
      throw new ForbiddenException("This operator site is archived");
    }
    if (domain.operator.status !== "active") {
      throw new NotFoundException("Tenant site not available");
    }

    return {
      operatorId: domain.operator.id,
      slug: domain.operator.slug,
      graRegistryId: domain.operator.gra_registry_id,
      name: domain.operator.name,
      hostname: bare,
    };
  }

  async resolveBySlug(slug: string): Promise<TenantContext> {
    const operator = await this.platformPrisma.client.operators.findUnique({
      where: { slug },
    });
    if (!operator) {
      throw new NotFoundException("Tenant not found");
    }
    if (operator.status === "suspended") {
      throw new ForbiddenException("This operator site is suspended");
    }
    if (operator.status === "archived") {
      throw new ForbiddenException("This operator site is archived");
    }
    if (operator.status !== "active") {
      throw new NotFoundException("Tenant not found");
    }
    const domain = await this.platformPrisma.client.operator_domains.findFirst({
      where: { operator_id: operator.id, is_primary: true },
    });
    return {
      operatorId: operator.id,
      slug: operator.slug,
      graRegistryId: operator.gra_registry_id,
      name: operator.name,
      hostname: domain?.hostname ?? `${slug}.kenji-raffle.local`,
    };
  }
}
