import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import type { TenantContext, OperatorAuthUser } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { OperatorAuthService } from "./operator-auth.service";
import { OperatorAuthGuard } from "./operator-auth.guard";
import { OperatorTenantGuard } from "../operator-admin/operator-tenant.guard";
import { CurrentOperatorStaff } from "../operator-admin/operator.decorators";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  mfa_code?: string;
}

class RefreshDto {
  @IsString()
  refresh_token!: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

class ChangePasswordDto {
  @IsString()
  current_password!: string;

  @IsString()
  @MinLength(8)
  new_password!: string;
}

class MfaEnableDto {
  @IsString()
  code!: string;
}

class MfaDisableDto {
  @IsString()
  code!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

class LogoutDto {
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

@ApiTags("operator-auth")
@Controller("v1/admin/auth")
export class OperatorAuthController {
  constructor(private readonly authService: OperatorAuthService) {}

  @PublicRoute()
  @Post("login")
  login(@TenantCtx() tenant: TenantContext, @Body() body: LoginDto) {
    return this.authService.login(
      tenant,
      body.email,
      body.password,
      body.mfa_code,
    );
  }

  @PublicRoute()
  @Post("refresh")
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @PublicRoute()
  @Post("forgot-password")
  forgotPassword(
    @TenantCtx() tenant: TenantContext,
    @Body() body: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(tenant, body.email);
  }

  @PublicRoute()
  @Post("reset-password")
  resetPassword(
    @TenantCtx() tenant: TenantContext,
    @Body() body: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(tenant, body.token, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(OperatorAuthGuard, OperatorTenantGuard)
  @Post("logout")
  logout(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @Body() body: LogoutDto,
  ) {
    return this.authService.logout(
      tenant.operatorId,
      actor.id,
      body.refresh_token,
    );
  }

  @ApiBearerAuth()
  @UseGuards(OperatorAuthGuard, OperatorTenantGuard)
  @Get("session")
  session(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
  ) {
    return this.authService.getSession(tenant, actor);
  }

  @ApiBearerAuth()
  @UseGuards(OperatorAuthGuard, OperatorTenantGuard)
  @Patch("change-password")
  changePassword(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      tenant,
      actor,
      body.current_password,
      body.new_password,
    );
  }

  @ApiBearerAuth()
  @UseGuards(OperatorAuthGuard, OperatorTenantGuard)
  @Post("mfa/setup")
  setupMfa(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
  ) {
    return this.authService.setupMfa(tenant, actor);
  }

  @ApiBearerAuth()
  @UseGuards(OperatorAuthGuard, OperatorTenantGuard)
  @Post("mfa/enable")
  enableMfa(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @Body() body: MfaEnableDto,
  ) {
    return this.authService.enableMfa(tenant, actor, body.code);
  }

  @ApiBearerAuth()
  @UseGuards(OperatorAuthGuard, OperatorTenantGuard)
  @Post("mfa/disable")
  disableMfa(
    @TenantCtx() tenant: TenantContext,
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @Body() body: MfaDisableDto,
  ) {
    return this.authService.disableMfa(
      tenant,
      actor,
      body.code,
      body.password,
    );
  }
}
