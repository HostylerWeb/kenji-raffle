export const GRA_RELAY_MAX_RETRIES = 5;

export const GRA_RELAY_BACKOFF_MS = [
  60_000,
  300_000,
  900_000,
  3_600_000,
  14_400_000,
] as const;

export type GraRelayConfig = {
  batchSize: number;
  maxPerMinute: number;
  operatorConcurrency: number;
};

export function graRelayConfig(): GraRelayConfig {
  return {
    batchSize: Math.max(1, Number(process.env.GRA_RELAY_BATCH_SIZE ?? 50)),
    maxPerMinute: Math.max(1, Number(process.env.GRA_RELAY_MAX_PER_MINUTE ?? 50)),
    operatorConcurrency: Math.max(
      1,
      Number(process.env.GRA_RELAY_OPERATOR_CONCURRENCY ?? 3),
    ),
  };
}

export type GraIngestPostResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      retryable: boolean;
      retryAfterMs?: number;
      httpStatus?: number;
    };

export class GraOperatorRateLimiter {
  private readonly windows = new Map<string, { count: number; windowStart: number }>();

  constructor(private readonly maxPerMinute: number) {}

  tryConsume(operatorId: string): boolean {
    const now = Date.now();
    const windowMs = 60_000;
    let entry = this.windows.get(operatorId);
    if (!entry || now - entry.windowStart >= windowMs) {
      entry = { count: 0, windowStart: now };
    }
    if (entry.count >= this.maxPerMinute) {
      this.windows.set(operatorId, entry);
      return false;
    }
    entry.count += 1;
    this.windows.set(operatorId, entry);
    return true;
  }
}

const relayRateLimiter = new GraOperatorRateLimiter(graRelayConfig().maxPerMinute);

export function getGraRelayRateLimiter(): GraOperatorRateLimiter {
  return relayRateLimiter;
}

export function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.ceil(seconds * 1000);
  }
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    const delta = dateMs - Date.now();
    return delta > 0 ? delta : 60_000;
  }
  return undefined;
}

export function classifyGraHttpResponse(
  status: number,
  body: string,
  retryAfterHeader?: string | null,
): GraIngestPostResult {
  if (status >= 200 && status < 300) {
    return { ok: true };
  }

  const error = `GRA ingest ${status}: ${body.slice(0, 200)}`;

  if (status === 429) {
    return {
      ok: false,
      error,
      retryable: true,
      retryAfterMs: parseRetryAfterMs(retryAfterHeader ?? null) ?? 60_000,
      httpStatus: 429,
    };
  }

  if (status >= 500) {
    return {
      ok: false,
      error,
      retryable: true,
      httpStatus: status,
    };
  }

  return {
    ok: false,
    error,
    retryable: false,
    httpStatus: status,
  };
}

export function computeNextAttemptAt(
  retryCount: number,
  retryAfterMs?: number,
): Date {
  if (retryAfterMs && retryAfterMs > 0) {
    return new Date(Date.now() + retryAfterMs);
  }
  const index = Math.min(retryCount, GRA_RELAY_BACKOFF_MS.length - 1);
  return new Date(Date.now() + GRA_RELAY_BACKOFF_MS[index]!);
}

export function graIdempotencyKey(input: {
  id: string;
  event_type: string;
  payload: unknown;
}): string {
  const payload = (input.payload ?? {}) as Record<string, unknown>;
  if (
    input.event_type === "ticket.purchased" ||
    input.event_type === "ticket.voided"
  ) {
    const ticketId =
      typeof payload.ticket_id === "string" && payload.ticket_id.length > 0
        ? payload.ticket_id
        : input.id;
    return `gra-ticket-${ticketId}`;
  }
  return `gra-${input.id}`;
}

export type GraRelayRunMetrics = {
  events_sent: number;
  events_failed: number;
  events_skipped: number;
  events_rate_limited: number;
  http_429_total: number;
  backlog_remaining: number;
  relay_latency_ms_max: number;
  relay_latency_ms_sum: number;
  relay_latency_samples: number;
};

export function emptyGraRelayMetrics(): GraRelayRunMetrics {
  return {
    events_sent: 0,
    events_failed: 0,
    events_skipped: 0,
    events_rate_limited: 0,
    http_429_total: 0,
    backlog_remaining: 0,
    relay_latency_ms_max: 0,
    relay_latency_ms_sum: 0,
    relay_latency_samples: 0,
  };
}

export function logGraRelayRun(
  operatorId: string,
  metrics: GraRelayRunMetrics,
  extra?: Record<string, unknown>,
): void {
  const relay_latency_ms_avg =
    metrics.relay_latency_samples > 0
      ? Math.round(metrics.relay_latency_ms_sum / metrics.relay_latency_samples)
      : null;

  console.log(
    JSON.stringify({
      event: "gra_relay_run",
      operator_id: operatorId,
      gra_relay_events_sent: metrics.events_sent,
      gra_relay_events_failed: metrics.events_failed,
      gra_relay_events_skipped: metrics.events_skipped,
      gra_relay_events_rate_limited: metrics.events_rate_limited,
      gra_relay_http_429_total: metrics.http_429_total,
      gra_relay_backlog: metrics.backlog_remaining,
      gra_relay_latency_ms_max: metrics.relay_latency_ms_max,
      gra_relay_latency_ms_avg: relay_latency_ms_avg,
      ...extra,
      at: new Date().toISOString(),
    }),
  );
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await fn(items[current]!);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
