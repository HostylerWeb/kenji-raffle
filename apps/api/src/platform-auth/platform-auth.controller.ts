import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PlatformRoute } from "../tenant/tenant.decorators";
import { PlatformAuthGuard } from "./platform-auth.guard";
import { PlatformAuthService } from "./platform-auth.service";
import { CurrentPlatformUser } from "../platform/platform.decorators";
import type { PlatformAuthUser } from "@kenji-raffle/shared";

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
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  current_password!: string;

  @IsString()
  @MinLength(8)
  new_password!: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

class MfaCodeDto {
  @IsString()
  @MinLength(6)
  code!: string;
}

class DisableMfaDto {
  @IsString()
  @MinLength(6)
  code!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

const USE_COOKIES = process.env.PLATFORM_AUTH_COOKIES === "true";
const ACCESS_MAX_AGE = 30 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

@ApiTags("platform-auth")
@PlatformRoute()
@Controller("v1/platform/auth")
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip ?? "unknown";
    const result = await this.authService.login(
      body.email,
      body.password,
      ip,
      body.mfa_code,
    );

    if ("mfa_required" in result) {
      return result;
    }

    if (USE_COOKIES) {
      this.setAuthCookies(res, result.access_token, result.refresh_token);
      return { user: result.user };
    }
    return result;
  }

  @Post("refresh")
  async refresh(
    @Body() body: RefreshDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const token =
      body.refresh_token ??
      (USE_COOKIES ? (req.cookies?.platform_refresh_token as string) : undefined);
    if (!token) {
      throw new UnauthorizedException("refresh_token required");
    }
    const result = await this.authService.refresh(token);
    if (USE_COOKIES) {
      this.setAuthCookies(res, result.access_token, result.refresh_token);
      return { user: result.user };
    }
    return result;
  }

  @UseGuards(PlatformAuthGuard)
  @Get("session")
  async session(@CurrentPlatformUser() user: PlatformAuthUser) {
    return this.authService.getSession(user.id);
  }

  @UseGuards(PlatformAuthGuard)
  @Post("logout")
  async logout(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Body() body: RefreshDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const token =
      body.refresh_token ??
      (USE_COOKIES ? (req.cookies?.platform_refresh_token as string) : undefined);
    const result = await this.authService.logout(user.id, token);
    if (USE_COOKIES) {
      res.clearCookie("platform_access_token", { path: "/" });
      res.clearCookie("platform_refresh_token", { path: "/" });
    }
    return result;
  }

  @UseGuards(PlatformAuthGuard)
  @Post("change-password")
  changePassword(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      body.current_password,
      body.new_password,
    );
  }

  @Post("forgot-password")
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post("reset-password")
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(PlatformAuthGuard)
  @Post("mfa/setup")
  setupMfa(@CurrentPlatformUser() user: PlatformAuthUser) {
    return this.authService.setupMfa(user.id);
  }

  @UseGuards(PlatformAuthGuard)
  @Post("mfa/enable")
  enableMfa(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Body() body: MfaCodeDto,
  ) {
    return this.authService.enableMfa(user.id, body.code);
  }

  @UseGuards(PlatformAuthGuard)
  @Post("mfa/disable")
  disableMfa(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Body() body: DisableMfaDto,
  ) {
    return this.authService.disableMfa(user.id, body.code, body.password);
  }

  private setAuthCookies(
    res: FastifyReply,
    accessToken: string,
    refreshToken: string,
  ) {
    res.setCookie("platform_access_token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: ACCESS_MAX_AGE,
    });
    res.setCookie("platform_refresh_token", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: REFRESH_MAX_AGE,
    });
  }
}
