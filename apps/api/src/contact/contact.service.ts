import { Injectable } from "@nestjs/common";
import type { TenantContext } from "@kenji-raffle/shared";
import { EmailService } from "../email/email.service";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";

@Injectable()
export class ContactService {
  constructor(
    private readonly email: EmailService,
    private readonly platformPrisma: PlatformPrismaService,
  ) {}

  async submit(
    tenant: TenantContext,
    input: { from_email: string; name?: string; body: string },
  ) {
    const settings = await this.platformPrisma.client.operator_settings.findUnique({
      where: { operator_id: tenant.operatorId },
    });
    const operatorEmail = settings?.support_email;
    if (!operatorEmail) {
      return { ok: true, emailed: false, reason: "no_support_email" };
    }

    await this.email.sendContactMessage(tenant, operatorEmail, input);
    return { ok: true, emailed: true };
  }
}
