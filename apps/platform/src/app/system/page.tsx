"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformShell } from "../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../lib/api";

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
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [worker, setWorker] = useState<WorkerStatus | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    Promise.all([
      platformFetch<SystemHealth>("/v1/platform/system/health"),
      platformFetch<WorkerStatus>("/v1/platform/system/worker").catch(
        () => null,
      ),
    ])
      .then(([h, w]) => {
        setHealth(h);
        setWorker(w);
      })
      .catch(() => router.replace("/"));
  }, [router]);

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
                      {health.worker.worker_alive ? "Alive" : "Not responding"}
                    </span>
                  </strong>
                </div>
                <div className="metric-row">
                  <span>Queue waiting</span>
                  <strong>{health.queue.waiting_jobs}</strong>
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
              </div>
            </section>
          </div>

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
            Run <code>npm run dev:worker</code> so tenant provisioning and
            rollups complete. Checked{" "}
            {new Date(health.checked_at).toLocaleString("en-KE")}.
          </p>
        </div>
      )}
    </PlatformShell>
  );
}
