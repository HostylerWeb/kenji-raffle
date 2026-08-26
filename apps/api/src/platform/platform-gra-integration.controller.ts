import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsIn, IsString, IsUUID, MinLength } from "class-validator";
import type { FastifyRequest } from "fastify";
import {
  PublicRoute,
  PlatformRoute,
} from "../tenant/tenant.decorators";
import { PlatformGraIntegrationService } from "./platform-gra-integration.service";

class GraCredentialsCallbackDto {
  @IsUUID()
  platform_operator_id!: string;

  @IsString()
  @MinLength(2)
  gra_registry_id!: string;

  @IsUUID()
  gra_application_id!: string;

  @IsString()
  @MinLength(8)
  api_key!: string;

  @IsString()
  @MinLength(16)
  hmac_secret!: string;

  @IsIn(["approved"])
  status!: "approved";
}

class GraRejectedCallbackDto {
  @IsUUID()
  platform_operator_id!: string;

  @IsUUID()
  gra_application_id!: string;

  @IsIn(["rejected"])
  status!: "rejected";

  @IsString()
  @MinLength(2)
  rejection_reason!: string;
}

@ApiTags("platform-integrations")
@PlatformRoute()
@Controller("v1/platform/integrations/gra")
export class PlatformGraIntegrationController {
  constructor(private readonly integration: PlatformGraIntegrationService) {}

  @PublicRoute()
  @Post("credentials")
  deliverCredentials(
    @Body() body: GraCredentialsCallbackDto,
    @Headers("x-platform-signature") signature: string | undefined,
    @Req() req: FastifyRequest,
  ) {
    this.integration.verifySignature(req.rawBody, signature);
    return this.integration.deliverCredentials(body, req.rawBody ?? "");
  }

  @PublicRoute()
  @Post("application-rejected")
  rejectApplication(
    @Body() body: GraRejectedCallbackDto,
    @Headers("x-platform-signature") signature: string | undefined,
    @Req() req: FastifyRequest,
  ) {
    this.integration.verifySignature(req.rawBody, signature);
    return this.integration.rejectApplication(body);
  }
}
