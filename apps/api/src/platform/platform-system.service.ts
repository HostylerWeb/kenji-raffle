import { Injectable } from "@nestjs/common";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import IORedis from "ioredis";
import { PlatformPrismaService } from "../platform-prisma/platform-prisma.service";
import { PlatformQueueService } from "./platform-queue.service";
import { TenantConnectionService } from "../tenant/tenant-connection.service";

@Injectable()
export class PlatformSystemService {
  constructor(
    private readonly platformPrisma: PlatformPrismaService,
    private readonly queueService: PlatformQueueService,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  async getHealth() {
    const postgres = await this.checkPostgres();
    const redis = await this.checkRedis();
    const minio = await this.checkMinio();
    const postgresCluster = postgres.ok
      ? await this.getPostgresClusterMetrics()
      : null;
    const tenantPools = await this.tenantConnection.getPoolStats();

    let queueWaiting = 0;
    let queueFailed = 0;
    let queueActive = 0;
    let queueDelayed = 0;
    if (redis.ok) {
      try {
        const counts = await this.queueService.getQueueCounts();
        queueWaiting = counts.waiting_jobs;
        queueFailed = counts.failed_jobs;
        queueActive = counts.active_jobs;
        queueDelayed = counts.delayed_jobs;
      } catch {
        queueWaiting = 0;
        queueFailed = 0;
        queueActive = 0;
        queueDelayed = 0;
      }
    }

    const worker = await this.queueService.getWorkerStatus();

    return {
      postgres,
      redis,
      minio,
      postgres_cluster: postgresCluster,
      tenant_connection_pools: tenantPools,
      queue: {
        name: "raffle-platform-jobs",
        waiting_jobs: queueWaiting,
        failed_jobs: queueFailed,
        active_jobs: queueActive,
        delayed_jobs: queueDelayed,
      },
      worker,
      status:
        postgres.ok && redis.ok
          ? minio.ok
            ? "healthy"
            : "degraded"
          : "degraded",
      checked_at: new Date().toISOString(),
    };
  }

  async getWorker() {
    return this.queueService.getWorkerStatus();
  }

  async cleanFailedQueue() {
    return this.queueService.cleanFailedJobs();
  }

  async getSettings() {
    const settings = await this.platformPrisma.client.platform_settings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      return {
        tenant_base_domain: "kenji-raffle.local",
        alert_email: null,
        rollup_schedule: "0 2 * * *",
        smtp_host: null,
        smtp_port: null,
        smtp_user: null,
      };
    }
    return {
      tenant_base_domain: settings.tenant_base_domain,
      alert_email: settings.alert_email,
      rollup_schedule: settings.rollup_schedule,
      smtp_host: settings.smtp_host,
      smtp_port: settings.smtp_port,
      smtp_user: settings.smtp_user,
    };
  }

  async updateSettings(input: {
    tenant_base_domain?: string;
    alert_email?: string | null;
    rollup_schedule?: string;
    smtp_host?: string | null;
    smtp_port?: number | null;
    smtp_user?: string | null;
  }) {
    const settings = await this.platformPrisma.client.platform_settings.upsert({
      where: { id: "default" },
      update: {
        tenant_base_domain: input.tenant_base_domain,
        alert_email: input.alert_email,
        rollup_schedule: input.rollup_schedule,
        smtp_host: input.smtp_host,
        smtp_port: input.smtp_port,
        smtp_user: input.smtp_user,
      },
      create: {
        tenant_base_domain:
          input.tenant_base_domain ?? "kenji-raffle.local",
        alert_email: input.alert_email,
        rollup_schedule: input.rollup_schedule ?? "0 2 * * *",
        smtp_host: input.smtp_host,
        smtp_port: input.smtp_port,
        smtp_user: input.smtp_user,
      },
    });

    return {
      tenant_base_domain: settings.tenant_base_domain,
      alert_email: settings.alert_email,
      rollup_schedule: settings.rollup_schedule,
      smtp_host: settings.smtp_host,
      smtp_port: settings.smtp_port,
      smtp_user: settings.smtp_user,
    };
  }

  private async checkPostgres() {
    try {
      await this.platformPrisma.client.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "postgres check failed",
      };
    }
  }

  private async getPostgresClusterMetrics() {
    try {
      const rows = await this.platformPrisma.client.$queryRaw<
        Array<{
          connections: number;
          max_connections: number;
          platform_db_bytes: number;
        }>
      >`
        SELECT
          (SELECT count(*)::int FROM pg_stat_activity) AS connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections,
          (SELECT pg_database_size(current_database())::bigint) AS platform_db_bytes
      `;
      const row = rows[0];
      return {
        connections: row?.connections ?? 0,
        max_connections: row?.max_connections ?? 0,
        platform_db_bytes: Number(row?.platform_db_bytes ?? 0),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "metrics failed",
      };
    }
  }

  private async checkRedis() {
    const connection = new IORedis(
      process.env.REDIS_URL ?? "redis://localhost:6383",
      { maxRetriesPerRequest: null },
    );
    try {
      const pong = await connection.ping();
      await connection.quit();
      return { ok: pong === "PONG" };
    } catch (error) {
      await connection.quit().catch(() => undefined);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "redis check failed",
      };
    }
  }

  private async checkMinio() {
    const endpoint = process.env.MINIO_ENDPOINT;
    const bucket = process.env.MINIO_BUCKET;
    if (!endpoint || !bucket) {
      return { ok: false, error: "MINIO not configured" };
    }

    const port = Number(process.env.MINIO_PORT ?? 9000);
    const useSsl = process.env.MINIO_USE_SSL === "true";
    const client = new S3Client({
      region: "us-east-1",
      endpoint: `${useSsl ? "https" : "http"}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
      },
    });

    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      return { ok: true, bucket };
    } catch (error) {
      const err = error as {
        name?: string;
        message?: string;
        Code?: string;
        $metadata?: { httpStatusCode?: number };
      };
      const code = err.name ?? err.Code;
      const status = err.$metadata?.httpStatusCode;
      let message = err.message ?? "minio check failed";
      if (code === "NotFound" || status === 404) {
        message = `Bucket "${bucket}" does not exist — create it in MinIO or set MINIO_BUCKET`;
      } else if (code === "UnknownError" && !message) {
        message = "Could not reach MinIO — is the service running on MINIO_ENDPOINT:MINIO_PORT?";
      }
      return {
        ok: false,
        bucket,
        error: message,
      };
    }
  }
}
