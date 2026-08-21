import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import {
  PLATFORM_LAST_PROVISION_KEY,
  PLATFORM_LAST_ROLLUP_KEY,
  PLATFORM_WORKER_HEARTBEAT_KEY,
} from "@kenji-raffle/database-platform";

export const PLATFORM_QUEUE_NAME = "raffle-platform-jobs";

@Injectable()
export class PlatformQueueService {
  private readonly connection: IORedis;
  private readonly queue: Queue;

  constructor() {
    this.connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6383", {
      maxRetriesPerRequest: null,
    });
    this.queue = new Queue(PLATFORM_QUEUE_NAME, { connection: this.connection });
  }

  async enqueueProvisionTenant(operatorId: string) {
    const jobId = `provision-tenant-${operatorId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      "provision-tenant",
      { operatorId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );
  }

  async enqueueMigrateTenant(operatorId: string) {
    const jobId = `migrate-tenant-${operatorId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      "migrate-tenant",
      { operatorId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 2,
      },
    );
  }

  async enqueueDestroyTenant(operatorId: string) {
    const jobId = `destroy-tenant-${operatorId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      "destroy-tenant",
      { operatorId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 1,
      },
    );
  }

  async enqueueProcessGraOutbound(operatorId: string) {
    const jobId = `process-gra-outbound-${operatorId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (state === "active" || state === "waiting" || state === "delayed") {
        return;
      }
      await existing.remove();
    }

    await this.queue.add(
      "process-gra-outbound",
      { operatorId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
      },
    );
  }

  async enqueueAutoDraw(operatorId: string, raffleId: string) {
    const jobId = `auto-draw-${raffleId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      "auto-draw",
      { operatorId, raffleId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 2,
      },
    );
  }

  async enqueueVerifyDns(operatorId: string, domainId: string) {
    const jobId = `verify-dns-${domainId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      "verify-domain-dns",
      { operatorId, domainId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 2,
      },
    );
  }

  async enqueueSendEmail(payload: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    from?: string;
  }) {
    await this.queue.add("send-email", payload, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });
  }

  async enqueueWinnerEmails(operatorId: string, raffleId: string) {
    const jobId = `winner-emails-${raffleId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      "winner-emails",
      { operatorId, raffleId },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 2,
      },
    );
  }

  async getRecentJobs(limit = 25) {
    const failed = await this.queue.getJobs(["failed"], 0, limit - 1);
    const completed = await this.queue.getJobs(["completed"], 0, limit - 1);
    const active = await this.queue.getJobs(["active"], 0, limit - 1);
    const waiting = await this.queue.getJobs(["waiting"], 0, limit - 1);

    const all = [...active, ...waiting, ...failed, ...completed];
    const seen = new Set<string>();
    const jobs = [];

    for (const job of all) {
      const key = String(job.id);
      if (seen.has(key)) continue;
      seen.add(key);
      jobs.push({
        id: job.id,
        name: job.name,
        state: await job.getState(),
        attempts_made: job.attemptsMade,
        failed_reason: job.failedReason,
        processed_on: job.processedOn,
        finished_on: job.finishedOn,
        timestamp: job.timestamp,
        data: job.data,
      });
      if (jobs.length >= limit) break;
    }

    return jobs;
  }

  async getWorkerStatus() {
    const heartbeatRaw = await this.connection.get(PLATFORM_WORKER_HEARTBEAT_KEY);
    const lastRollupRaw = await this.connection.get(PLATFORM_LAST_ROLLUP_KEY);
    const lastProvisionRaw = await this.connection.get(
      PLATFORM_LAST_PROVISION_KEY,
    );

    let heartbeat: Record<string, unknown> | null = null;
    let lastRollup: Record<string, unknown> | null = null;
    let lastProvision: Record<string, unknown> | null = null;

    try {
      if (heartbeatRaw) heartbeat = JSON.parse(heartbeatRaw);
      if (lastRollupRaw) lastRollup = JSON.parse(lastRollupRaw);
      if (lastProvisionRaw) lastProvision = JSON.parse(lastProvisionRaw);
    } catch {
      // ignore parse errors
    }

    const alive =
      heartbeat?.at &&
      Date.now() - new Date(String(heartbeat.at)).getTime() < 120000;

    return {
      worker_alive: Boolean(alive),
      heartbeat,
      last_rollup: lastRollup,
      last_provision: lastProvision,
    };
  }
}
