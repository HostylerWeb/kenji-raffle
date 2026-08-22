import "./load-env";
import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import {
  platformPrisma,
  provisionTenantForOperator,
  runRollupsForAllActiveOperators,
  migrateTenantForOperator,
  migrateAllTenantDatabases,
  destroyOperatorTenant,
  PLATFORM_WORKER_HEARTBEAT_KEY,
  PLATFORM_LAST_ROLLUP_KEY,
  PLATFORM_LAST_PROVISION_KEY,
} from "@kenji-raffle/database-platform";
import { releaseExpiredCartsForAllTenants } from "./cart-expiry";
import { expireStalePendingOrdersForAllTenants } from "./pending-order-expiry";
import { verifyDomainRecord } from "./verify-dns";
import { processGraOutboundForOperator, processGraOutboundForAllTenants, runGraHeartbeatForAllOperators } from "./gra-outbound";
import { runAutoDrawForOperator, scheduleAutoDrawsForAllTenants } from "./auto-draw";
import { transitionEndedRafflesForAllTenants } from "./raffle-lifecycle";
import { runSessionAggregatesForAllTenants } from "./session-aggregate";
import { runMonthlyGraExportForAllTenants } from "./monthly-export";
import { sendWinnerEmailsForRaffle, processSendEmailJob } from "./send-email";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6383", {
  maxRetriesPerRequest: null,
});

const queue = new Queue("raffle-platform-jobs", { connection });

async function writeHeartbeat(meta: Record<string, unknown>) {
  const payload = JSON.stringify({
    ...meta,
    at: new Date().toISOString(),
  });
  await connection.set(PLATFORM_WORKER_HEARTBEAT_KEY, payload, "EX", 120);
}

async function rollupTenants() {
  const result = await runRollupsForAllActiveOperators();
  await connection.set(
    PLATFORM_LAST_ROLLUP_KEY,
    JSON.stringify({
      at: new Date().toISOString(),
      operators_processed: result.operators_processed,
      errors: result.errors,
    }),
    "EX",
    86400 * 7,
  );
  console.log(
    `Rollup job processed ${result.operators_processed} operator(s), ${result.errors.length} error(s).`,
  );
  if (result.errors.length > 0) {
    console.error(result.errors.join("\n"));
  }
}

async function scheduleNightlyRollups() {
  await queue.upsertJobScheduler(
    "nightly-tenant-rollups",
    { pattern: "0 2 * * *" },
    { name: "tenant-rollups", data: {} },
  );
  console.log("Scheduled nightly tenant rollups at 02:00 UTC.");
}

async function scheduleCartExpiry() {
  await queue.upsertJobScheduler(
    "cart-expiry",
    { pattern: "*/1 * * * *" },
    { name: "cart-expiry", data: {} },
  );
  console.log("Scheduled cart expiry every 1 minute.");
}

async function schedulePendingOrderExpiry() {
  await queue.upsertJobScheduler(
    "pending-order-expiry",
    { pattern: "*/5 * * * *" },
    { name: "pending-order-expiry", data: {} },
  );
  console.log("Scheduled pending order expiry every 5 minutes.");
}

async function scheduleAutoDraw() {
  await queue.upsertJobScheduler(
    "auto-draw-check",
    { pattern: "*/15 * * * *" },
    { name: "auto-draw-check", data: {} },
  );
  console.log("Scheduled auto-draw check every 15 minutes.");
}

async function scheduleGraOutboundSweep() {
  await queue.upsertJobScheduler(
    "gra-outbound-sweep",
    { pattern: "*/5 * * * *" },
    { name: "gra-outbound-sweep", data: {} },
  );
  console.log("Scheduled GRA outbound sweep every 5 minutes.");
}

async function scheduleRaffleLifecycle() {
  await queue.upsertJobScheduler(
    "raffle-lifecycle",
    { pattern: "*/5 * * * *" },
    { name: "raffle-lifecycle", data: {} },
  );
  console.log("Scheduled raffle lifecycle every 5 minutes.");
}

async function scheduleSessionAggregate() {
  await queue.upsertJobScheduler(
    "session-aggregate",
    { pattern: "0 * * * *" },
    { name: "session-aggregate", data: {} },
  );
  console.log("Scheduled session aggregate hourly.");
}

async function scheduleMonthlyExport() {
  await queue.upsertJobScheduler(
    "monthly-gra-export",
    { pattern: "0 3 1 * *" },
    { name: "monthly-gra-export", data: {} },
  );
  console.log("Scheduled monthly GRA export on 1st at 03:00 UTC.");
}

async function scheduleGraHeartbeat() {
  await queue.upsertJobScheduler(
    "gra-heartbeat",
    { pattern: "0 6 * * *" },
    { name: "gra-heartbeat", data: {} },
  );
  console.log("Scheduled daily GRA heartbeat at 06:00 UTC.");
}

const worker = new Worker(
  "raffle-platform-jobs",
  async (job) => {
    if (job.name === "tenant-rollups") {
      await rollupTenants();
      await writeHeartbeat({ last_job: "tenant-rollups", job_id: job.id });
      return;
    }

    if (job.name === "cart-expiry") {
      const released = await releaseExpiredCartsForAllTenants();
      console.log(`Cart expiry released ${released} ticket reservation(s).`);
      await writeHeartbeat({ last_job: "cart-expiry", job_id: job.id });
      return;
    }

    if (job.name === "pending-order-expiry") {
      const expired = await expireStalePendingOrdersForAllTenants();
      console.log(`Pending order expiry failed ${expired} stale order(s).`);
      await writeHeartbeat({ last_job: "pending-order-expiry", job_id: job.id });
      return;
    }

    if (job.name === "provision-tenant") {
      const operatorId = String(job.data.operatorId ?? "");
      if (!operatorId) {
        throw new Error("provision-tenant job missing operatorId");
      }
      try {
        const result = await provisionTenantForOperator(operatorId);
        await connection.set(
          PLATFORM_LAST_PROVISION_KEY,
          JSON.stringify({
            at: new Date().toISOString(),
            operator_id: operatorId,
            status: "success",
            hostname: result.hostname,
          }),
          "EX",
          86400 * 7,
        );
        console.log(
          `Provisioned tenant ${result.hostname} (${result.databaseName})`,
        );
        await writeHeartbeat({ last_job: "provision-tenant", job_id: job.id });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await connection.set(
          PLATFORM_LAST_PROVISION_KEY,
          JSON.stringify({
            at: new Date().toISOString(),
            operator_id: operatorId,
            status: "failed",
            error: message,
          }),
          "EX",
          86400 * 7,
        );
        throw err;
      }
    }

    if (job.name === "migrate-tenant") {
      const operatorId = String(job.data.operatorId ?? "");
      if (!operatorId) {
        throw new Error("migrate-tenant job missing operatorId");
      }
      const result = await migrateTenantForOperator(operatorId);
      console.log(`Migrated tenant for ${result.slug} to ${result.schema_version}`);
      await writeHeartbeat({ last_job: "migrate-tenant", job_id: job.id });
      return result;
    }

    if (job.name === "migrate-all-tenants") {
      const result = await migrateAllTenantDatabases();
      console.log(
        `migrate-all-tenants: ${result.migrated} migrated, ${result.errors.length} error(s)`,
      );
      if (result.errors.length > 0) {
        console.error(result.errors.join("\n"));
      }
      await writeHeartbeat({ last_job: "migrate-all-tenants", job_id: job.id });
      return result;
    }

    if (job.name === "verify-domain-dns") {
      const operatorId = String(job.data.operatorId ?? "");
      const domainId = String(job.data.domainId ?? "");
      if (!operatorId || !domainId) {
        throw new Error("verify-domain-dns job missing operatorId or domainId");
      }
      const result = await verifyDomainRecord(operatorId, domainId);
      console.log(`DNS verify ${domainId}: ${result.verified ? "ok" : "failed"}`);
      await writeHeartbeat({ last_job: "verify-domain-dns", job_id: job.id });
      return result;
    }

    if (job.name === "destroy-tenant") {
      const operatorId = String(job.data.operatorId ?? "");
      if (!operatorId) {
        throw new Error("destroy-tenant job missing operatorId");
      }
      await destroyOperatorTenant(operatorId);
      console.log(`Destroyed tenant for operator ${operatorId}`);
      await writeHeartbeat({ last_job: "destroy-tenant", job_id: job.id });
      return { ok: true, operator_id: operatorId };
    }

    if (job.name === "process-gra-outbound") {
      const operatorId = String(job.data.operatorId ?? "");
      if (!operatorId) {
        throw new Error("process-gra-outbound job missing operatorId");
      }
      const result = await processGraOutboundForOperator(operatorId);
      console.log(`GRA outbound ${operatorId}: processed ${result.processed}`);
      await writeHeartbeat({ last_job: "process-gra-outbound", job_id: job.id });
      return result;
    }

    if (job.name === "auto-draw") {
      const operatorId = String(job.data.operatorId ?? "");
      const raffleId = String(job.data.raffleId ?? "");
      if (!operatorId || !raffleId) {
        throw new Error("auto-draw job missing operatorId or raffleId");
      }
      const result = await runAutoDrawForOperator(operatorId, raffleId);
      console.log(`Auto-draw ${raffleId}: ${JSON.stringify(result)}`);
      await writeHeartbeat({ last_job: "auto-draw", job_id: job.id });
      return result;
    }

    if (job.name === "auto-draw-check") {
      const results = await scheduleAutoDrawsForAllTenants();
      console.log(`Auto-draw check: ${results.length} raffle(s) evaluated`);
      await writeHeartbeat({ last_job: "auto-draw-check", job_id: job.id });
      return results;
    }

    if (job.name === "gra-outbound-sweep") {
      const results = await processGraOutboundForAllTenants();
      const processed = results.reduce(
        (sum, r) => sum + ("processed" in r ? Number(r.processed) : 0),
        0,
      );
      console.log(`GRA outbound sweep: ${processed} event(s) sent`);
      await writeHeartbeat({ last_job: "gra-outbound-sweep", job_id: job.id });
      return results;
    }

    if (job.name === "raffle-lifecycle") {
      const result = await transitionEndedRafflesForAllTenants();
      console.log(`Raffle lifecycle: ${result.updated} raffle(s) moved to to_be_drawn`);
      await writeHeartbeat({ last_job: "raffle-lifecycle", job_id: job.id });
      return result;
    }

    if (job.name === "session-aggregate") {
      const result = await runSessionAggregatesForAllTenants();
      console.log(`Session aggregate: ${result.aggregates} bucket(s) queued`);
      await writeHeartbeat({ last_job: "session-aggregate", job_id: job.id });
      return result;
    }

    if (job.name === "monthly-gra-export") {
      const result = await runMonthlyGraExportForAllTenants();
      console.log(`Monthly GRA export: ${result.exports} tenant(s)`);
      await writeHeartbeat({ last_job: "monthly-gra-export", job_id: job.id });
      return result;
    }

    if (job.name === "gra-heartbeat") {
      const results = await runGraHeartbeatForAllOperators();
      const failed = results.filter((r) => !r.ok).length;
      console.log(`GRA heartbeat: ${results.length} operator(s), ${failed} failed`);
      await writeHeartbeat({ last_job: "gra-heartbeat", job_id: job.id });
      return results;
    }

    if (job.name === "send-email") {
      const result = await processSendEmailJob(job.data as {
        to: string;
        subject: string;
        text: string;
        html?: string;
        from?: string;
      });
      console.log(`send-email → ${job.data?.to} sent=${result.sent}`);
      await writeHeartbeat({ last_job: "send-email", job_id: job.id });
      return result;
    }

    if (job.name === "winner-emails") {
      const operatorId = String(job.data.operatorId ?? "");
      const raffleId = String(job.data.raffleId ?? "");
      if (!operatorId || !raffleId) {
        throw new Error("winner-emails job missing operatorId or raffleId");
      }
      const result = await sendWinnerEmailsForRaffle(operatorId, raffleId);
      console.log(`Winner emails ${raffleId}: ${result.sent}/${result.total}`);
      await writeHeartbeat({ last_job: "winner-emails", job_id: job.id });
      return result;
    }

    throw new Error(`Unknown job: ${job.name}`);
  },
  { connection },
);

worker.on("ready", async () => {
  console.log("Worker ready");
  await writeHeartbeat({ status: "ready" });
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.name} failed:`, err.message);
});

scheduleNightlyRollups().catch((err) => {
  console.error("Failed to schedule nightly rollups:", err.message);
});

scheduleCartExpiry().catch((err) => {
  console.error("Failed to schedule cart expiry:", err.message);
});

schedulePendingOrderExpiry().catch((err) => {
  console.error("Failed to schedule pending order expiry:", err.message);
});

scheduleAutoDraw().catch((err) => {
  console.error("Failed to schedule auto-draw:", err.message);
});

scheduleGraOutboundSweep().catch((err) => {
  console.error("Failed to schedule GRA outbound sweep:", err.message);
});

scheduleRaffleLifecycle().catch((err) => {
  console.error("Failed to schedule raffle lifecycle:", err.message);
});

scheduleSessionAggregate().catch((err) => {
  console.error("Failed to schedule session aggregate:", err.message);
});

scheduleMonthlyExport().catch((err) => {
  console.error("Failed to schedule monthly export:", err.message);
});

scheduleGraHeartbeat().catch((err) => {
  console.error("Failed to schedule GRA heartbeat:", err.message);
});

setInterval(() => {
  writeHeartbeat({ status: "alive" }).catch(() => undefined);
}, 30000);

console.log("Raffle platform worker started");
