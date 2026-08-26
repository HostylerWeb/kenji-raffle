import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import { PublicRoute } from "../tenant/tenant.decorators";
import { MediaStorageService } from "./media-storage.service";

@ApiTags("media")
@Controller("v1/media")
export class MediaController {
  constructor(private readonly storage: MediaStorageService) {}

  /** Public marketing/operator uploads only — KYC files are never served here. */
  @PublicRoute()
  @Get("files/:operatorId/:name")
  async serveFile(
    @Param("operatorId") operatorId: string,
    @Param("name") name: string,
    @Res() reply: FastifyReply,
  ) {
    if (
      name.includes("..") ||
      operatorId.includes("..") ||
      name.startsWith("kyc/") ||
      name.includes("/kyc/")
    ) {
      throw new NotFoundException("File not found");
    }
    const storageKey = `tenants/${operatorId}/${name}`;
    if (this.storage.isKycStorageKey(storageKey)) {
      throw new NotFoundException("File not found");
    }
    const { stream, mimeType } = await this.storage.openStream(storageKey);
    reply.header("Content-Type", mimeType);
    reply.header("Cache-Control", "public, max-age=86400");
    return reply.send(stream);
  }
}
