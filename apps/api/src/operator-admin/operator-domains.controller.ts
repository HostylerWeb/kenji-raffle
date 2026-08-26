import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import {
  CurrentOperatorStaff,
  OperatorRoles,
} from "./operator.decorators";
import { OperatorDomainsService } from "./operator-domains.service";

class AddDomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i)
  hostname!: string;
}

@ApiTags("operator-admin")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/domains")
export class OperatorDomainsController {
  constructor(private readonly domainsService: OperatorDomainsService) {}

  @Get()
  list(@TenantCtx() tenant: TenantContext) {
    return this.domainsService.list(tenant.operatorId);
  }

  @OperatorRoles("owner", "manager")
  @Post()
  add(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Body() body: AddDomainDto,
  ) {
    return this.domainsService.addCustomDomain(
      actor,
      tenant.operatorId,
      body.hostname,
    );
  }

  @OperatorRoles("owner", "manager")
  @Post(":domainId/verify-dns")
  verify(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("domainId") domainId: string,
  ) {
    return this.domainsService.verifyDns(actor, tenant.operatorId, domainId);
  }

  @OperatorRoles("owner", "manager")
  @Post(":domainId/set-primary")
  setPrimary(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Param("domainId") domainId: string,
  ) {
    return this.domainsService.setPrimary(actor, tenant.operatorId, domainId);
  }
}
