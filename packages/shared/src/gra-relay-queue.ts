import { Queue } from "bullmq";
import IORedis from "ioredis";

export const PLATFORM_QUEUE_NAME = "raffle-platform-jobs";

let sharedConnection: IORedis | null = null;
let sharedQueue: Queue | null = null;

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6383";
}

function getQueue(): Queue {
  if (!sharedQueue) {
    sharedConnection = new IORedis(getRedisUrl(), {
      maxRetriesPerRequest: null,
    });
    sharedQueue = new Queue(PLATFORM_QUEUE_NAME, { connection: sharedConnection });
  }
  return sharedQueue;
}

/** Enqueue a per-operator GRA relay job (deduped while waiting/active). */
export async function enqueueProcessGraOutbound(operatorId: string): Promise<void> {
  const queue = getQueue();
  const jobId = `process-gra-outbound-${operatorId}`;
  const existing = await queue.getJob(jobId);
  if (existing) {
    const state = await existing.getState();
    if (state === "active" || state === "waiting" || state === "delayed") {
      return;
    }
    await existing.remove();
  }

  await queue.add(
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
