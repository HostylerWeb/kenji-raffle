import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import {
  CurrentOperatorStaff,
  OperatorRoles,
} from "./operator.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import {
  OperatorOnboardingService,
  type LegalProfileInput,
} from "./operator-onboarding.service";

class LegalProfileDto implements LegalProfileInput {
  @IsOptional()
  @IsString()
  @MinLength(2)
  legal_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  trading_name?: string;

  @IsOptional()
  @IsString()
  registration_number?: string;

  @IsOptional()
  @IsString()
  kra_pin?: string;

  @IsOptional()
  @IsString()
  beneficial_owner?: string;

  @IsOptional()
  @IsString()
  business_email?: string;

  @IsOptional()
  @IsString()
  business_phone?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

class ConfirmLegalProfileDto {
  @IsString()
  confirm_text!: string;
}

@ApiTags("operator-admin")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/onboarding")
export class OperatorOnboardingController {
  constructor(private readonly onboarding: OperatorOnboardingService) {}

  @OperatorRoles("owner", "manager")
  @Get("status")
  getStatus(@TenantCtx() tenant: TenantContext) {
    return this.onboarding.getStatus(tenant);
  }

  @OperatorRoles("owner", "manager")
  @Get("legal-profile")
  getLegalProfile(@TenantCtx() tenant: TenantContext) {
    return this.onboarding.getLegalProfile(tenant);
  }

  @OperatorRoles("owner", "manager")
  @Patch("legal-profile")
  updateLegalProfile(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @Body() body: LegalProfileDto,
  ) {
    return this.onboarding.updateLegalProfile(tenant, actor, body);
  }

  @OperatorRoles("owner")
  @Post("confirm-legal-profile")
  confirmLegalProfile(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @Body() body: ConfirmLegalProfileDto,
  ) {
    return this.onboarding.confirmLegalProfile(
      tenant,
      actor,
      body.confirm_text,
    );
  }

  @OperatorRoles("owner")
  @Post("request-gra")
  requestGra(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
  ) {
    return this.onboarding.requestGraConnection(tenant, actor);
  }
}
