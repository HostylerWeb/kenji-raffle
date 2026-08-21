import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { PlatformRoute } from "../tenant/tenant.decorators";
import { PlatformAuthGuard } from "../platform-auth/platform-auth.guard";
import { PlatformSystemService } from "./platform-system.service";
import { PlatformAdminGuard } from "./platform-admin.guard";
import { PlatformAdminOnly } from "./platform.decorators";

class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  tenant_base_domain?: string;

  @IsOptional()
  @IsEmail()
  alert_email?: string;

  @IsOptional()
  @IsString()
  rollup_schedule?: string;

  @IsOptional()
  @IsString()
  smtp_host?: string;

  @IsOptional()
  @IsInt()
  smtp_port?: number;

  @IsOptional()
  @IsString()
  smtp_user?: string;
}

@ApiTags("platform-system")
@PlatformRoute()
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard, PlatformAdminGuard)
@Controller("v1/platform/system")
export class PlatformSystemController {
  constructor(private readonly systemService: PlatformSystemService) {}

  @Get("health")
  health() {
    return this.systemService.getHealth();
  }

  @Get("worker")
  worker() {
    return this.systemService.getWorker();
  }

  @Get("settings")
  settings() {
    return this.systemService.getSettings();
  }

  @PlatformAdminOnly()
  @Patch("settings")
  updateSettings(@Body() body: UpdatePlatformSettingsDto) {
    return this.systemService.updateSettings(body);
  }
}
