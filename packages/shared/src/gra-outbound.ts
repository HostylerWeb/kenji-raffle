import { createHmac } from "node:crypto";
import {
  createTenantPrismaClient,
  type TenantPrismaClient,
} from "@kenji-raffle/database-tenant";
import { platformPrisma } from "@kenji-raffle/database-platform";
import { decryptSecret, requireEnv } from "./crypto";
import {
  classifyGraHttpResponse,
  computeNextAttemptAt,
  emptyGraRelayMetrics,
  getGraRelayRateLimiter,
  graIdempotencyKey,
  graRelayConfig,
  GRA_RELAY_MAX_RETRIES,
  logGraRelayRun,
  mapWithConcurrency,
  type GraIngestPostResult,
  type GraRelayRunMetrics,
} from "./gra-relay";

export const GRA_STAKE_BANDS = [
  "0-50",
  "51-100",
  "101-250",
  "251-500",
  "501-1000",
  "1001+",
] as const;

export type GraStakeBand = (typeof GRA_STAKE_BANDS)[number];

export function emptyGraStakeBandDistribution(): Record<GraStakeBand, number> {
  return {
    "0-50": 0,
    "51-100": 0,
    "101-250": 0,
    "251-500": 0,
    "501-1000": 0,
    "1001+": 0,
  };
}

/** Map a gross order/session amount to GRA stake bands. */
export function graStakeBandForAmount(amount: number): GraStakeBand {
  if (amount <= 50) return "0-50";
  if (amount <= 100) return "51-100";
  if (amount <= 250) return "101-250";
  if (amount <= 500) return "251-500";
  if (amount <= 1000) return "501-1000";
  return "1001+";
}

export type GraIngestBuildResult =
  | { kind: "send"; path: string; body: Record<string, unknown> }
  | { kind: "skip"; reason: string };

function iso(value: unknown, fallback = new Date()): string {
  if (typeof value === "string" && value.length > 0) return value;
  if (value instanceof Date) return value.toISOString();
  return fallback.toISOString();
}

function compactBody(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export function buildGraIngestRequest(
  eventType: string,
  payload: Record<string, unknown>,
): GraIngestBuildResult {
  if (eventType === "payment.completed") {
    return {
      kind: "send",
      path: "/events/payment",
      body: compactBody({
        action: "completed",
        payment_id: String(payload.payment_id ?? ""),
        amount: Number(payload.total ?? payload.amount ?? 0),
        currency: payload.currency ?? "KES",
        method: payload.payment_method ?? payload.method ?? "mock",
        reference: payload.order_id ? String(payload.order_id) : undefined,
        occurred_at: iso(payload.completed_at ?? payload.occurred_at),
      }),
    };
  }

  if (eventType === "payment.failed") {
    return {
      kind: "send",
      path: "/events/payment",
      body: compactBody({
        action: "failed",
        payment_id: String(payload.payment_id ?? payload.order_id ?? ""),
        amount: Number(payload.amount ?? payload.total ?? 0),
        currency: payload.currency ?? "KES",
        method: payload.payment_method ?? payload.method ?? "mock",
        reference: payload.order_id ? String(payload.order_id) : undefined,
        occurred_at: iso(payload.failed_at ?? payload.occurred_at),
      }),
    };
  }

  if (eventType === "ticket.purchased" || eventType === "ticket.voided") {
    const action = eventType === "ticket.voided" ? "voided" : "purchased";
    return {
      kind: "send",
      path: "/events/ticket",
      body: compactBody({
        action,
        ticket_id: String(payload.ticket_id ?? ""),
        raffle_id: payload.raffle_id ? String(payload.raffle_id) : undefined,
        raffle_name: payload.raffle_name ? String(payload.raffle_name) : undefined,
        amount: Number(payload.amount ?? 0),
        currency: payload.currency ?? "KES",
        purchased_at: iso(
          payload.purchased_at ?? payload.voided_at ?? payload.created_at,
        ),
      }),
    };
  }

  if (eventType === "play_safe.activated") {
    const county =
      typeof payload.county === "string" ? payload.county.trim() : "";
    if (!county) {
      return {
        kind: "skip",
        reason: "Missing county for GRA player-safety event",
      };
    }

    const occurredAt = iso(payload.occurred_at ?? payload.activated_at);
    const occurredDate = new Date(occurredAt);

    return {
      kind: "send",
      path: "/events/player-safety",
      body: compactBody({
        event_type: "play_safe",
        county,
        region: payload.region ? String(payload.region) : undefined,
        occurred_at: occurredAt,
        hour_of_day: occurredDate.getUTCHours(),
        day_of_week: occurredDate.getUTCDay(),
      }),
    };
  }

  if (eventType === "session.aggregate") {
    const county =
      typeof payload.county === "string" ? payload.county.trim() : "";
    if (!county) {
      return {
        kind: "skip",
        reason: "Missing county for GRA session aggregate",
      };
    }

    const bucketStart = iso(payload.bucket_start ?? payload.hour_start);
    const bucketDate = new Date(bucketStart);
    const distribution =
      payload.stake_band_distribution &&
      typeof payload.stake_band_distribution === "object"
        ? (payload.stake_band_distribution as Record<string, number>)
        : emptyGraStakeBandDistribution();

    const normalized = emptyGraStakeBandDistribution();
    for (const band of GRA_STAKE_BANDS) {
      normalized[band] = Number(distribution[band] ?? 0);
    }

    return {
      kind: "send",
      path: "/events/session-aggregate",
      body: compactBody({
        county,
        region: payload.region ? String(payload.region) : undefined,
        bucket_start: bucketStart,
        session_count: Number(payload.session_count ?? 0),
        total_session_minutes: Number(payload.total_session_minutes ?? 0),
        stake_band_distribution: normalized,
        hour_of_day:
          payload.hour_of_day !== undefined
            ? Number(payload.hour_of_day)
            : bucketDate.getUTCHours(),
        day_of_week:
          payload.day_of_week !== undefined
            ? Number(payload.day_of_week)
            : bucketDate.getUTCDay(),
      }),
    };
  }

  if (eventType === "monthly.return") {
    return {
      kind: "send",
      path: "/returns/monthly",
      body: compactBody({
        reporting_year: Number(payload.reporting_year),
        reporting_month: Number(payload.reporting_month),
        tickets_sold: Number(payload.tickets_sold ?? 0),
        gross_revenue: Number(payload.gross_revenue ?? 0),
        prizes_paid: Number(payload.prizes_paid ?? 0),
        expenses: Number(payload.expenses ?? 0),
        gross_gaming_revenue: Number(payload.gross_gaming_revenue ?? 0),
        tax_due:
          payload.tax_due !== undefined
            ? Number(payload.tax_due)
            : undefined,
        tax_paid: Number(payload.tax_paid ?? 0),
        notes: payload.notes ? String(payload.notes) : undefined,
      }),
    };
  }

  return { kind: "skip", reason: `Unknown event type: ${eventType}` };
}

export async function postGraIngestRequest(input: {
  ingestBase: string;
  apiKey: string;
  hmacSecret: string;
  idempotencyKey: string;
  path: string;
  body: Record<string, unknown>;
}): Promise<GraIngestPostResult> {
  const bodyJson = JSON.stringify(input.body);
  const signature = createHmac("sha256", input.hmacSecret)
    .update(bodyJson)
    .digest("hex");

  try {
    const res = await fetch(
      `${input.ingestBase.replace(/\/$/, "")}${input.path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": input.apiKey,
          "X-Signature": signature,
          "X-Idempotency-Key": input.idempotencyKey,
        },
        body: bodyJson,
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return classifyGraHttpResponse(
        res.status,
        text,
        res.headers.get("retry-after"),
      );
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: true,
    };
  }
}

/** @deprecated Use postGraIngestRequest result directly; kept for callers expecting boolean error shape. */
export async function postGraIngestRequestLegacy(input: {
  ingestBase: string;
  apiKey: string;
  hmacSecret: string;
  idempotencyKey: string;
  path: string;
  body: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await postGraIngestRequest(input);
  if (result.ok) return { ok: true };
  return { ok: false, error: result.error };
}

export async function testGraIngestConnection(input: {
  apiKey: string;
  hmacSecret: string;
  ingestBase?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ingestBase = input.ingestBase ?? process.env.GRA_INGEST_URL ?? "http://localhost:4001/v1";
  const body = {
    message: "Kenji Raffle connection test",
    site_version: "kenji-raffle",
  };

  const result = await postGraIngestRequest({
    ingestBase,
    apiKey: input.apiKey,
    hmacSecret: input.hmacSecret,
    idempotencyKey: `gra-test-${Date.now()}`,
    path: "/heartbeat",
    body,
  });

  if (result.ok) return { ok: true };
  return { ok: false, error: result.error };
}

type GraEventRow = {
  id: string;
  event_type: string;
  payload: unknown;
  retry_count: number;
  created_at: Date;
};

type SendGraEventResult = "sent" | "skipped" | "failed" | "rate_limited" | "deferred";

async function sendGraEvent(
  client: TenantPrismaClient,
  event: GraEventRow,
  operatorId: string,
  ingestBase: string,
  apiKey: string,
  hmacSecret: string,
  metrics: GraRelayRunMetrics,
): Promise<SendGraEventResult> {
  const rateLimiter = getGraRelayRateLimiter();
  if (!rateLimiter.tryConsume(operatorId)) {
    metrics.events_rate_limited += 1;
    return "rate_limited";
  }

  const raw = (event.payload ?? {}) as Record<string, unknown>;
  const payload = { ...raw };

  if (
    (event.event_type === "payment.completed" ||
      event.event_type === "payment.failed") &&
    !payload.payment_id
  ) {
    payload.payment_id = event.id;
  }
  if (
    (event.event_type === "ticket.purchased" ||
      event.event_type === "ticket.voided") &&
    !payload.ticket_id
  ) {
    payload.ticket_id = event.id;
  }

  const built = buildGraIngestRequest(event.event_type, payload);

  if (built.kind === "skip") {
    await client.gra_outbound_events.update({
      where: { id: event.id },
      data: {
        status: "failed",
        last_error: built.reason,
        processed_at: new Date(),
        next_attempt_at: null,
      },
    });
    metrics.events_skipped += 1;
    return "skipped";
  }

  const result = await postGraIngestRequest({
    ingestBase,
    apiKey,
    hmacSecret,
    idempotencyKey: graIdempotencyKey({
      id: event.id,
      event_type: event.event_type,
      payload,
    }),
    path: built.path,
    body: built.body,
  });

  if (!result.ok) {
    if (result.httpStatus === 429) {
      metrics.http_429_total += 1;
    }

    if (!result.retryable || event.retry_count >= GRA_RELAY_MAX_RETRIES - 1) {
      await client.gra_outbound_events.update({
        where: { id: event.id },
        data: {
          status: "failed",
          retry_count: { increment: 1 },
          last_error: result.error,
          processed_at: new Date(),
          next_attempt_at: null,
        },
      });
      metrics.events_failed += 1;
      return "failed";
    }

    const nextAttempt = computeNextAttemptAt(
      event.retry_count,
      result.retryAfterMs,
    );
    await client.gra_outbound_events.update({
      where: { id: event.id },
      data: {
        status: "pending",
        retry_count: { increment: 1 },
        last_error: result.error,
        next_attempt_at: nextAttempt,
      },
    });
    return "deferred";
  }

  await client.gra_outbound_events.update({
    where: { id: event.id },
    data: {
      status: "sent",
      processed_at: new Date(),
      last_error: null,
      next_attempt_at: null,
    },
  });

  if (
    event.event_type === "payment.completed" &&
    typeof payload.payment_id === "string"
  ) {
    await client.payments
      .update({
        where: { id: payload.payment_id },
        data: { gra_reported_at: new Date() },
      })
      .catch(() => undefined);
  }

  metrics.events_sent += 1;
  const latencyMs = Date.now() - event.created_at.getTime();
  metrics.relay_latency_ms_sum += latencyMs;
  metrics.relay_latency_samples += 1;
  if (latencyMs > metrics.relay_latency_ms_max) {
    metrics.relay_latency_ms_max = latencyMs;
  }
  return "sent";
}

export type GraOutboundProcessResult = {
  processed: number;
  operator_id?: string;
  skipped?: boolean;
  reason?: string;
  metrics?: GraRelayRunMetrics;
};

export async function processGraOutboundForOperator(
  operatorId: string,
): Promise<GraOutboundProcessResult> {
  const settings = await platformPrisma.operator_settings.findUnique({
    where: { operator_id: operatorId },
  });

  if (
    !settings?.gra_api_key_encrypted ||
    !settings.gra_hmac_secret_encrypted
  ) {
    return { processed: 0, skipped: true, reason: "no_gra_keys" };
  }

  if (settings.gra_application_status !== "approved") {
    return { processed: 0, skipped: true, reason: "gra_not_approved" };
  }

  const ingestBase = process.env.GRA_INGEST_URL ?? "http://localhost:4001/v1";
  const encKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const apiKey = decryptSecret(settings.gra_api_key_encrypted, encKey);
  const hmacSecret = decryptSecret(settings.gra_hmac_secret_encrypted, encKey);

  const db = await platformPrisma.tenant_databases.findUnique({
    where: { operator_id: operatorId },
  });
  if (!db || db.status !== "active") {
    return { processed: 0, skipped: true, reason: "tenant_not_active" };
  }

  const url = decryptSecret(db.connection_url_encrypted, encKey);
  const client = createTenantPrismaClient(url);
  const config = graRelayConfig();
  const metrics = emptyGraRelayMetrics();
  const now = new Date();

  try {
    const events = await client.gra_outbound_events.findMany({
      where: {
        status: "pending",
        OR: [{ next_attempt_at: null }, { next_attempt_at: { lte: now } }],
      },
      orderBy: { created_at: "asc" },
      take: config.batchSize,
    });

    for (const event of events) {
      const outcome = await sendGraEvent(
        client,
        event,
        operatorId,
        ingestBase,
        apiKey,
        hmacSecret,
        metrics,
      );
      if (outcome === "rate_limited") {
        break;
      }
    }

    metrics.backlog_remaining = await client.gra_outbound_events.count({
      where: {
        status: "pending",
        OR: [{ next_attempt_at: null }, { next_attempt_at: { lte: new Date() } }],
      },
    });

    logGraRelayRun(operatorId, metrics, { job: "process-gra-outbound" });

    return {
      processed: metrics.events_sent,
      operator_id: operatorId,
      metrics,
    };
  } finally {
    await client.$disconnect();
  }
}

export async function processGraOutboundForAllTenants() {
  const databases = await platformPrisma.tenant_databases.findMany({
    where: { status: "active" },
    select: { operator_id: true },
  });

  const config = graRelayConfig();
  return mapWithConcurrency(
    databases,
    config.operatorConcurrency,
    async (db) => processGraOutboundForOperator(db.operator_id),
  );
}

export async function runGraHeartbeatForOperator(
  operatorId: string,
): Promise<{ ok: boolean; error?: string }> {
  const settings = await platformPrisma.operator_settings.findUnique({
    where: { operator_id: operatorId },
  });

  if (
    !settings?.gra_api_key_encrypted ||
    !settings.gra_hmac_secret_encrypted
  ) {
    return { ok: false, error: "no_gra_keys" };
  }

  const encKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const apiKey = decryptSecret(settings.gra_api_key_encrypted, encKey);
  const hmacSecret = decryptSecret(settings.gra_hmac_secret_encrypted, encKey);

  const result = await testGraIngestConnection({ apiKey, hmacSecret });
  const at = new Date();

  await platformPrisma.operator_settings.update({
    where: { operator_id: operatorId },
    data: {
      gra_last_heartbeat_at: at,
      gra_last_heartbeat_status: result.ok ? "ok" : "failed",
      gra_last_heartbeat_error: result.ok ? null : result.error,
    },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function runGraHeartbeatForAllOperators() {
  const operators = await platformPrisma.operators.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  const results = [];
  for (const op of operators) {
    results.push({
      operator_id: op.id,
      ...(await runGraHeartbeatForOperator(op.id)),
    });
  }
  return results;
}

export type GraOperatorQueueStats = {
  pending_count: number;
  failed_count: number;
  oldest_pending_at: string | null;
  oldest_pending_age_minutes: number | null;
  last_successful_at: string | null;
};

export async function getGraQueueStatsForOperator(
  operatorId: string,
): Promise<GraOperatorQueueStats | null> {
  const db = await platformPrisma.tenant_databases.findUnique({
    where: { operator_id: operatorId },
  });
  if (!db || db.status !== "active") return null;

  const encKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const url = decryptSecret(db.connection_url_encrypted, encKey);
  const client = createTenantPrismaClient(url);

  try {
    const [pendingCount, failedCount, oldestPending, lastSuccess] =
      await Promise.all([
        client.gra_outbound_events.count({ where: { status: "pending" } }),
        client.gra_outbound_events.count({ where: { status: "failed" } }),
        client.gra_outbound_events.findFirst({
          where: { status: "pending" },
          orderBy: { created_at: "asc" },
          select: { created_at: true },
        }),
        client.gra_outbound_events.findFirst({
          where: { status: "sent" },
          orderBy: { processed_at: "desc" },
          select: { processed_at: true },
        }),
      ]);

    const oldestAt = oldestPending?.created_at ?? null;
    const ageMinutes =
      oldestAt != null
        ? Math.round((Date.now() - oldestAt.getTime()) / 60_000)
        : null;

    return {
      pending_count: pendingCount,
      failed_count: failedCount,
      oldest_pending_at: oldestAt?.toISOString() ?? null,
      oldest_pending_age_minutes: ageMinutes,
      last_successful_at: lastSuccess?.processed_at?.toISOString() ?? null,
    };
  } finally {
    await client.$disconnect();
  }
}
