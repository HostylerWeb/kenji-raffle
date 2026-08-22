"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformShell } from "../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../lib/api";
import { usePlatformSession } from "../../lib/use-platform-session";

type SystemHealth = {
  status: string;
  postgres: { ok: boolean; error?: string };
  redis: { ok: boolean; error?: string };
  minio: { ok: boolean; bucket?: string; error?: string };
  postgres_cluster: {
    connections?: number;
    max_connections?: number;
    platform_db_bytes?: number;
    error?: string;
  } | null;
  tenant_connection_pools: {
    cached_tenant_clients: number;
    operator_ids: string[];
  };
  queue: {
    name: string;
    waiting_jobs: number;
    failed_jobs: number;
    active_jobs: number;
    delayed_jobs?: number;
  };
  worker: {
    worker_alive: boolean;
    heartbeat: Record<string, unknown> | null;
    last_rollup: Record<string, unknown> | null;
    last_provision: Record<string, unknown> | null;
  };
  checked_at: string;
};

type WorkerStatus = {
  worker_alive: boolean;
  heartbeat: Record<string, unknown> | null;
  last_rollup: Record<string, unknown> | null;
  last_provision: Record<string, unknown> | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <span>
        <span className={ok ? "status-pill status-ok" : "status-pill status-bad"}>
          {ok ? "OK" : "Issue"}
        </span>
        <span className="muted system-detail">{detail}</span>
      </span>
    </div>
  );
}

export default function SystemPage() {
  const router = useRouter();
  const { isAdmin: admin, ready } = usePlatformSession();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [worker, setWorker] = useState<WorkerStatus | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const loadHealth = useCallback(async () => {
    const [h, w] = await Promise.all([
      platformFetch<SystemHealth>("/v1/platform/system/health"),
      platformFetch<WorkerStatus>("/v1/platform/system/worker").catch(
        () => null,
      ),
    ]);
    setHealth(h);
    setWorker(w);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    loadHealth().catch(() => router.replace("/"));
    const timer = setInterval(() => {
      loadHealth().catch(() => undefined);
    }, 30000);
    return () => clearInterval(timer);
  }, [loadHealth, router]);

  async function cleanFailedJobs() {
    setCleaning(true);
    setActionMessage("");
    try {
      const result = await platformFetch<{ removed: number }>(
        "/v1/platform/system/queue/clean-failed",
        { method: "POST" },
      );
      setActionMessage(`Removed ${result.removed} failed job(s).`);
      await loadHealth();
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Failed to clean queue",
      );
    } finally {
      setCleaning(false);
    }
  }

  const heartbeatAt =
    worker?.heartbeat?.at ?? health?.worker.heartbeat?.at ?? null;
  const heartbeatAgeMs = heartbeatAt
    ? Date.now() - new Date(String(heartbeatAt)).getTime()
    : null;

  return (
    <PlatformShell title="System health">
      {health && (
        <div className="dashboard">
          <section className="card dashboard-panel">
            <div className="panel-header">
              <h3 className="section-title">Infrastructure</h3>
              <span
                className={
                  health.status === "healthy"
                    ? "status-pill status-ok"
                    : "status-pill status-warn"
                }
              >
                {health.status}
              </span>
            </div>
            <div className="metric-rows">
              <StatusRow
                label="PostgreSQL"
                ok={health.postgres.ok}
                detail={health.postgres.ok ? "Connected" : health.postgres.error ?? "Failed"}
              />
              <StatusRow
                label="Redis"
                ok={health.redis.ok}
                detail={health.redis.ok ? "Connected" : health.redis.error ?? "Failed"}
              />
              <StatusRow
                label="MinIO"
                ok={health.minio.ok}
                detail={
                  health.minio.ok
                    ? `Bucket ${health.minio.bucket}`
                    : health.minio.error ?? "Failed"
                }
              />
            </div>
          </section>

          <div className="dashboard-columns">
            <section className="card dashboard-panel">
              <h3 className="section-title">Database</h3>
              <div className="metric-rows">
                {health.postgres_cluster && (
                  <>
                    <div className="metric-row">
                      <span>Connections</span>
                      <strong>
                        {health.postgres_cluster.connections ?? "—"} /{" "}
                        {health.postgres_cluster.max_connections ?? "—"}
                      </strong>
                    </div>
                    <div className="metric-row">
                      <span>Platform DB size</span>
                      <strong>
                        {health.postgres_cluster.platform_db_bytes
                          ? formatBytes(health.postgres_cluster.platform_db_bytes)
                          : "—"}
                      </strong>
                    </div>
                  </>
                )}
                <div className="metric-row">
                  <span>Tenant pools (API)</span>
                  <strong>
                    {health.tenant_connection_pools.cached_tenant_clients} cached
                  </strong>
                </div>
              </div>
            </section>

            <section className="card dashboard-panel">
              <h3 className="section-title">Worker & queue</h3>
              <div className="metric-rows">
                <div className="metric-row">
                  <span>Worker</span>
                  <strong>
                    <span
                      className={
                        health.worker.worker_alive
                          ? "status-pill status-ok"
                          : "status-pill status-bad"
                      }
                    >
                      {health.worker.worker_alive ? "Alive" : "Not running"}
                    </span>
                    {heartbeatAt && (
                      <span className="muted system-detail">
                        {" "}
                        last ping{" "}
                        {heartbeatAgeMs !== null && heartbeatAgeMs < 120000
                          ? `${Math.round(heartbeatAgeMs / 1000)}s ago`
                          : String(heartbeatAt)}
                      </span>
                    )}
                  </strong>
                </div>
                <div className="metric-row">
                  <span>Queue waiting</span>
                  <strong>{Math.max(0, health.queue.waiting_jobs)}</strong>
                </div>
                <div className="metric-row">
                  <span>Queue delayed</span>
                  <strong>{Math.max(0, health.queue.delayed_jobs ?? 0)}</strong>
                </div>
                <div className="metric-row">
                  <span>Queue active</span>
                  <strong>{health.queue.active_jobs}</strong>
                </div>
                <div className="metric-row">
                  <span>Queue failed</span>
                  <strong
                    className={
                      health.queue.failed_jobs > 0 ? "text-danger" : undefined
                    }
                  >
                    {health.queue.failed_jobs}
                  </strong>
                </div>
                {ready && admin && health.queue.failed_jobs > 0 && (
                  <div className="metric-row">
                    <span>Failed jobs</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={cleaning}
                      onClick={cleanFailedJobs}
                    >
                      {cleaning ? "Cleaning…" : "Clear failed jobs"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {actionMessage && (
            <p className="muted" style={{ marginBottom: 16 }}>
              {actionMessage}
            </p>
          )}

          {worker && (
            <section className="card dashboard-panel">
              <h3 className="section-title">Worker jobs</h3>
              <div className="metric-rows">
                <div className="metric-row">
                  <span>Last heartbeat</span>
                  <strong>
                    {worker.heartbeat?.at
                      ? String(worker.heartbeat.at)
                      : "—"}
                  </strong>
                </div>
                <div className="metric-row">
                  <span>Last job</span>
                  <strong>
                    {worker.heartbeat?.last_job
                      ? String(worker.heartbeat.last_job)
                      : "—"}
                  </strong>
                </div>
                <div className="metric-row">
                  <span>Last rollup</span>
                  <strong>
                    {worker.last_rollup?.at
                      ? String(worker.last_rollup.at)
                      : "—"}
                  </strong>
                </div>
                <div className="metric-row">
                  <span>Last provision</span>
                  <strong>
                    {worker.last_provision?.at
                      ? `${String(worker.last_provision.status ?? "")} ${String(worker.last_provision.at)}`
                      : "—"}
                  </strong>
                </div>
              </div>
            </section>
          )}

          <p className="dashboard-footnote muted">
            {!health.worker.worker_alive && (
              <>
                Worker is offline or heartbeat expired (&gt;2 min) — start it with{" "}
                <code>npm run dev:worker</code> from the project root.
                {health.queue.failed_jobs > 50 && (
                  <>
                    {" "}
                    High failed count usually means the worker ran without{" "}
                    <code>.env</code> loaded (missing{" "}
                    <code>PLATFORM_DATABASE_URL</code> /{" "}
                    <code>CREDENTIALS_ENCRYPTION_KEY</code>).
                  </>
                )}
                <br />
              </>
            )}
            Checked{" "}
            {new Date(health.checked_at).toLocaleString("en-KE")}.
          </p>
        </div>
      )}
    </PlatformShell>
  );
}
