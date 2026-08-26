import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import type { PlatformAuthUser, PlatformRole } from "@kenji-raffle/shared";
import { PlatformRoute } from "../tenant/tenant.decorators";
import { PlatformAuthGuard } from "../platform-auth/platform-auth.guard";
import { PlatformAdminGuard } from "./platform-admin.guard";
import {
  CurrentPlatformUser,
  PlatformAdminOnly,
} from "./platform.decorators";
import {
  PlatformOperatorsService,
  type UpdateOperatorInput,
} from "./platform-operators.service";
import {
  PlatformDrilldownService,
  PlatformReportsService,
} from "./platform-reports.service";

class CreateOperatorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(48)
  slug!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  gra_registry_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  licence_number?: string;
}

class UpdateOperatorDto {
  @IsOptional()
  @IsIn(["active", "suspended", "archived"])
  status?: UpdateOperatorInput["status"];

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  gra_registry_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  licence_number?: string;
}

class AddDomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  hostname!: string;

  @IsIn(["subdomain", "custom"])
  domain_type!: "subdomain" | "custom";
}

class UpdateDomainDto {
  @IsOptional()
  is_primary?: boolean;
}

class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  gra_api_key?: string;

  @IsOptional()
  @IsString()
  gra_hmac_secret?: string;

  @IsOptional()
  @IsString()
  support_email?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logo_url?: string;

  @IsOptional()
  feature_flags?: Record<string, boolean>;
}

class InviteStaffDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsIn(["manager", "support", "finance"])
  role?: "manager" | "support" | "finance";
}

class HardDestroyDto {
  @IsString()
  @MinLength(2)
  confirm_slug!: string;
}

@ApiTags("platform-operators")
@PlatformRoute()
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard, PlatformAdminGuard)
@Controller("v1/platform/operators")
export class PlatformOperatorsController {
  constructor(
    private readonly operatorsService: PlatformOperatorsService,
    private readonly reportsService: PlatformReportsService,
    private readonly drilldownService: PlatformDrilldownService,
  ) {}

  @PlatformAdminOnly()
  @Post()
  create(
    @CurrentPlatformUser() user: Parameters<PlatformOperatorsService["create"]>[0],
    @Body() body: CreateOperatorDto,
  ) {
    return this.operatorsService.create(user, body);
  }

  @Get(":id/rollup")
  rollup(@Param("id") id: string) {
    return this.reportsService.operatorRollup(id);
  }

  @Get(":id/drill-down/orders")
  drillDownOrders(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.drilldownService.orders(
      user,
      id,
      Number(page ?? 1),
      Number(limit ?? 50),
    );
  }

  @Get(":id/drill-down/payments")
  drillDownPayments(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.drilldownService.payments(
      user,
      id,
      Number(page ?? 1),
      Number(limit ?? 50),
    );
  }

  @Get(":id/drill-down/summary")
  drillDownSummary(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
  ) {
    return this.drilldownService.summary(user, id);
  }

  @Get(":id/drill-down/gra-events")
  drillDownGraEvents(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.drilldownService.graEvents(
      user,
      id,
      Number(page ?? 1),
      Number(limit ?? 50),
      status,
    );
  }

  @PlatformAdminOnly()
  @Post(":id/drill-down/gra-events/:eventId/retry")
  retryGraEvent(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Param("eventId") eventId: string,
  ) {
    return this.drilldownService.retryGraEvent(user, id, eventId);
  }

  @PlatformAdminOnly()
  @Post(":id/invite-staff")
  inviteStaff(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Body() body: InviteStaffDto,
  ) {
    return this.operatorsService.inviteStaff(user, id, body);
  }

  @PlatformAdminOnly()
  @Post(":id/destroy")
  hardDestroy(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Body() body: HardDestroyDto,
  ) {
    return this.operatorsService.queueHardDestroy(user, id, body.confirm_slug);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.operatorsService.getById(id);
  }

  @PlatformAdminOnly()
  @Patch(":id")
  update(
    @CurrentPlatformUser() user: Parameters<PlatformOperatorsService["updateStatus"]>[0],
    @Param("id") id: string,
    @Body() body: UpdateOperatorDto,
  ) {
    return this.operatorsService.updateStatus(user, id, body);
  }

  @PlatformAdminOnly()
  @Post(":id/reprovision-db")
  reprovision(
    @CurrentPlatformUser() user: Parameters<PlatformOperatorsService["reprovisionDb"]>[0],
    @Param("id") id: string,
  ) {
    return this.operatorsService.reprovisionDb(user, id);
  }

  @PlatformAdminOnly()
  @Post(":id/migrate")
  migrate(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
  ) {
    return this.operatorsService.migrateTenant(user, id);
  }

  @Post(":id/test-connection")
  testConnection(@Param("id") id: string) {
    return this.operatorsService.testConnection(id);
  }

  @Get(":id/domains")
  listDomains(@Param("id") id: string) {
    return this.operatorsService.listDomains(id);
  }

  @PlatformAdminOnly()
  @Post(":id/domains")
  addDomain(
    @CurrentPlatformUser() user: Parameters<PlatformOperatorsService["addDomain"]>[0],
    @Param("id") id: string,
    @Body() body: AddDomainDto,
  ) {
    return this.operatorsService.addDomain(user, id, body);
  }

  @PlatformAdminOnly()
  @Patch(":id/domains/:domainId")
  updateDomain(
    @CurrentPlatformUser() user: Parameters<PlatformOperatorsService["updateDomain"]>[0],
    @Param("id") id: string,
    @Param("domainId") domainId: string,
    @Body() body: UpdateDomainDto,
  ) {
    return this.operatorsService.updateDomain(user, id, domainId, body);
  }

  @PlatformAdminOnly()
  @Post(":id/domains/:domainId/verify-dns")
  verifyDns(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Param("domainId") domainId: string,
  ) {
    return this.operatorsService.verifyDomainDns(user, id, domainId);
  }

  @PlatformAdminOnly()
  @Post(":id/domains/:domainId/verify-dns-queue")
  verifyDnsQueue(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Param("domainId") domainId: string,
  ) {
    return this.operatorsService.queueVerifyDomainDns(user, id, domainId);
  }

  @Get(":id/settings")
  getSettings(@Param("id") id: string) {
    return this.operatorsService.getSettings(id);
  }

  @PlatformAdminOnly()
  @Patch(":id/settings")
  updateSettings(
    @CurrentPlatformUser() user: Parameters<PlatformOperatorsService["updateSettings"]>[0],
    @Param("id") id: string,
    @Body() body: UpdateSettingsDto,
  ) {
    return this.operatorsService.updateSettings(user, id, body);
  }

  @PlatformAdminOnly()
  @Post(":id/test-gra-connection")
  testGraConnection(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
  ) {
    return this.operatorsService.testGraConnection(user, id);
  }
}
