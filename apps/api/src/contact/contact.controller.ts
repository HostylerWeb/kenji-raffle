import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import type { TenantContext } from "@kenji-raffle/shared";
import { PublicRoute, TenantCtx } from "../tenant/tenant.decorators";
import { ContactService } from "./contact.service";

class ContactDto {
  @IsEmail()
  from_email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(10)
  body!: string;
}

@ApiTags("contact")
@Controller("v1/contact")
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @PublicRoute()
  @Post()
  submit(@TenantCtx() tenant: TenantContext, @Body() body: ContactDto) {
    return this.contact.submit(tenant, body);
  }
}
