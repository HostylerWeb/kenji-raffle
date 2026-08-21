import { Body, Controller, Post, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import type { TenantContext, PlayerAuthUser } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { PlayerAuthService } from "./player-auth.service";
import { PlayerAuthGuard } from "./player-auth.guard";
import { PlayerTenantGuard } from "./player-tenant.guard";
import { CurrentPlayer } from "./player.decorators";

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsDateString()
  date_of_birth!: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  cart_session_id?: string;
}

class VerifyEmailDto {
  @IsString()
  token!: string;
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

class RefreshDto {
  @IsString()
  refresh_token!: string;
}

class LogoutDto {
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

@ApiTags("player-auth")
@Controller("v1/auth")
export class PlayerAuthController {
  constructor(private readonly authService: PlayerAuthService) {}

  @PublicRoute()
  @Post("register")
  register(@TenantCtx() tenant: TenantContext, @Body() body: RegisterDto) {
    return this.authService.register(tenant, body);
  }

  @PublicRoute()
  @Post("login")
  login(@TenantCtx() tenant: TenantContext, @Body() body: LoginDto) {
    return this.authService.login(
      tenant,
      body.email,
      body.password,
      body.cart_session_id,
    );
  }

  @PublicRoute()
  @Post("refresh")
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @PublicRoute()
  @Post("verify-email")
  verifyEmail(@TenantCtx() tenant: TenantContext, @Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(tenant, body.token);
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
  @UseGuards(PlayerAuthGuard, PlayerTenantGuard)
  @Post("logout")
  logout(
    @TenantCtx() tenant: TenantContext,
    @CurrentPlayer() player: PlayerAuthUser,
    @Body() body: LogoutDto,
  ) {
    return this.authService.logout(
      tenant.operatorId,
      player.id,
      body.refresh_token,
    );
  }
}

@ApiTags("player")
@ApiBearerAuth()
@UseGuards(PlayerAuthGuard, PlayerTenantGuard)
@Controller("v1")
export class PlayerMeController {
  constructor(private readonly authService: PlayerAuthService) {}

  @Get("me")
  me(@TenantCtx() tenant: TenantContext, @CurrentPlayer() player: PlayerAuthUser) {
    return this.authService.getMe(tenant, player);
  }
}
