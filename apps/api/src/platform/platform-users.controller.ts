import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { PlatformAuthUser } from "@kenji-raffle/shared";
import { PlatformRoute } from "../tenant/tenant.decorators";
import { PlatformAuthGuard } from "../platform-auth/platform-auth.guard";
import { PlatformAdminGuard } from "./platform-admin.guard";
import {
  CurrentPlatformUser,
  PlatformAdminOnly,
} from "./platform.decorators";
import { PlatformUsersService } from "./platform-operators.service";
import {
  CreatePlatformUserDto,
  UpdatePlatformUserDto,
} from "./platform-users.dto";

@ApiTags("platform-users")
@PlatformRoute()
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard, PlatformAdminGuard)
@PlatformAdminOnly()
@Controller("v1/platform/platform-users")
export class PlatformUsersController {
  constructor(private readonly usersService: PlatformUsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  @Post()
  create(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Body() body: CreatePlatformUserDto,
  ) {
    return this.usersService.create(user, body);
  }

  @Patch(":id")
  update(
    @CurrentPlatformUser() user: PlatformAuthUser,
    @Param("id") id: string,
    @Body() body: UpdatePlatformUserDto,
  ) {
    return this.usersService.update(user, id, body);
  }
}
