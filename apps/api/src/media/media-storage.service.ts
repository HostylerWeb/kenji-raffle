import { Injectable, NotFoundException } from "@nestjs/common";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream, existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = resolve(
  process.env.MEDIA_LOCAL_ROOT ?? join(__dirname, "../../../../uploads"),
);

@Injectable()
export class MediaStorageService {
  private readonly mode = process.env.MEDIA_STORAGE ?? "local";
  private readonly bucket = process.env.MINIO_BUCKET ?? "kenji-raffle";
  private readonly publicBase =
    process.env.API_PUBLIC_URL ??
    `http://localhost:${process.env.API_PORT ?? 4002}`;

  private s3Client(): S3Client | null {
    if (this.mode !== "s3") return null;
    const endpoint = process.env.MINIO_ENDPOINT;
    if (!endpoint) return null;
    const port = process.env.MINIO_PORT ?? "9000";
    const useSsl = process.env.MINIO_USE_SSL === "true";
    return new S3Client({
      region: "us-east-1",
      endpoint: `${useSsl ? "https" : "http"}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
      },
    });
  }

  buildStorageKey(operatorId: string, filename: string): string {
    const ext = filename.includes(".")
      ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
      : "";
    return `tenants/${operatorId}/${randomUUID()}${ext}`;
  }

  buildKycStorageKey(operatorId: string, filename: string): string {
    const ext = filename.includes(".")
      ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
      : "";
    return `tenants/${operatorId}/kyc/${randomUUID()}${ext}`;
  }

  isKycStorageKey(storageKey: string): boolean {
    return /\/kyc\//.test(storageKey);
  }

  /** Resolve a stored KYC reference (storage key or legacy URL) to a storage key. */
  resolveKycStorageKey(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith("tenants/") && this.isKycStorageKey(trimmed)) {
      return trimmed;
    }
    const match = trimmed.match(
      /\/v1\/media\/files\/[^/]+\/(kyc\/[^/?#]+)|tenants\/[^/]+\/kyc\/[^/?#]+/,
    );
    if (!match) return null;
    if (match[0].startsWith("tenants/")) return match[0];
    const operatorMatch = trimmed.match(/\/v1\/media\/files\/([^/]+)\//);
    if (operatorMatch) {
      return `tenants/${operatorMatch[1]}/${match[1] ?? match[0]}`;
    }
    return null;
  }

  publicUrl(storageKey: string): string {
    if (this.isKycStorageKey(storageKey)) {
      throw new Error("KYC media must not use public URLs");
    }
    const match = storageKey.match(/^tenants\/([^/]+)\/(.+)$/);
    if (!match) {
      return `${this.publicBase}/v1/media/files/${encodeURIComponent(storageKey)}`;
    }
    return `${this.publicBase}/v1/media/files/${match[1]}/${match[2]}`;
  }

  async save(
    operatorId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<{ storage_key: string; url: string }> {
    const storageKey = this.buildStorageKey(operatorId, originalName);
    await this.writeObject(storageKey, buffer, mimeType);
    return { storage_key: storageKey, url: this.publicUrl(storageKey) };
  }

  async saveKyc(
    operatorId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<{ storage_key: string }> {
    const storageKey = this.buildKycStorageKey(operatorId, originalName);
    await this.writeObject(storageKey, buffer, mimeType);
    return { storage_key: storageKey };
  }

  async openStream(storageKey: string): Promise<{
    stream: NodeJS.ReadableStream;
    mimeType: string;
  }> {
    if (storageKey.includes("..")) {
      throw new NotFoundException("File not found");
    }

    const s3 = this.s3Client();
    if (s3) {
      const result = await s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }),
      );
      if (!result.Body) {
        throw new NotFoundException("File not found");
      }
      return {
        stream: result.Body as NodeJS.ReadableStream,
        mimeType: result.ContentType ?? "application/octet-stream",
      };
    }

    const filePath = join(UPLOAD_ROOT, storageKey);
    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    const ext = storageKey.slice(storageKey.lastIndexOf(".")).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
    };

    return {
      stream: createReadStream(filePath),
      mimeType: mimeMap[ext] ?? "application/octet-stream",
    };
  }

  async delete(storageKey: string): Promise<void> {
    if (storageKey.includes("..")) {
      throw new NotFoundException("File not found");
    }

    const s3 = this.s3Client();
    if (s3) {
      await s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
      );
      return;
    }

    const filePath = join(UPLOAD_ROOT, storageKey);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  private async writeObject(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    const s3 = this.s3Client();
    if (s3) {
      await s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
      return;
    }

    const filePath = join(UPLOAD_ROOT, storageKey);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, buffer);
  }
}
