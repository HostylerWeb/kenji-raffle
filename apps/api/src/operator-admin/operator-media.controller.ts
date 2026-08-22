import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { MediaStorageService } from "../media/media-storage.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { OperatorAuthGuard } from "../operator-auth/operator-auth.guard";
import { TenantCtx } from "../tenant/tenant.decorators";
import { OperatorTenantGuard } from "./operator-tenant.guard";
import { OperatorRolesGuard } from "./operator-roles.guard";
import { CurrentOperatorStaff, OperatorRoles } from "./operator.decorators";
import { paginate } from "../common/pagination";

@ApiTags("operator-media")
@ApiBearerAuth()
@UseGuards(OperatorAuthGuard, OperatorTenantGuard, OperatorRolesGuard)
@Controller("v1/admin/media")
export class OperatorMediaController {
  constructor(
    private readonly storage: MediaStorageService,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  @Get()
  async list(
    @TenantCtx() tenant: TenantContext,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const { take, skip, page: currentPage, limit: currentLimit } = paginate(
      Number(page) || 1,
      Number(limit) || 50,
      100,
    );

    const [rows, total] = await Promise.all([
      client.media.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      client.media.count(),
    ]);

    return {
      items: rows.map((m) => ({
        id: m.id,
        storage_key: m.storage_key,
        url: this.storage.publicUrl(m.storage_key),
        mime_type: m.mime_type,
        size_bytes: m.size_bytes,
        created_at: m.created_at.toISOString(),
      })),
      total,
      page: currentPage,
      limit: currentLimit,
    };
  }

  @OperatorRoles("owner", "manager")
  @Delete(":id")
  async remove(
    @TenantCtx() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const media = await client.media.findUnique({ where: { id } });
    if (!media) {
      throw new BadRequestException("Media not found");
    }

    await this.storage.delete(media.storage_key);
    await client.media.delete({ where: { id } });
    return { ok: true };
  }

  @OperatorRoles("owner", "manager")
  @Post("upload")
  async upload(
    @CurrentOperatorStaff() actor: OperatorAuthUser,
    @TenantCtx() tenant: TenantContext,
    @Req() req: FastifyRequest,
  ) {
    const data = await req.file();
    if (!data) {
      throw new BadRequestException("No file uploaded");
    }

    const buffer = await data.toBuffer();
    const mimeType = data.mimetype ?? "application/octet-stream";
    const originalName = data.filename ?? "upload.bin";

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(mimeType)) {
      throw new BadRequestException(
        "Only JPEG, PNG, WebP, and GIF images are allowed",
      );
    }

    const saved = await this.storage.save(
      tenant.operatorId,
      buffer,
      mimeType,
      originalName,
    );

    const client = await this.tenantConnection.getClient(tenant.operatorId);
    const media = await client.media.create({
      data: {
        storage_key: saved.storage_key,
        mime_type: mimeType,
        size_bytes: buffer.length,
        uploaded_by_staff_id: actor.id,
      },
    });

    return {
      id: media.id,
      storage_key: saved.storage_key,
      url: saved.url,
      mime_type: mimeType,
      size_bytes: buffer.length,
    };
  }
}
