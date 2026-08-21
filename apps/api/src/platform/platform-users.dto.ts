import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import type { PlatformRole } from "@kenji-raffle/shared";

export class CreatePlatformUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(["platform_admin", "platform_support"])
  role!: PlatformRole;

  @IsOptional()
  @IsString()
  @MinLength(6)
  mfa_code?: string;
}

export class UpdatePlatformUserDto {
  @IsOptional()
  @IsIn(["platform_admin", "platform_support"])
  role?: PlatformRole;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
