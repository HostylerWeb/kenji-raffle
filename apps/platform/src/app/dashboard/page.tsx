"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformShell } from "../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../lib/api";
import { usePlatformSession } from "../../lib/use-platform-session";
import { formatKes, formatNumber } from "../../lib/format";

type Dashboard = {
  operators_total: number;
  operators_active: number;
  operators_onboarding: number;
  operators_failed: number;
  gross_sales_today: number;
  tax_collected_today: number;
  orders_today: number;
  failed_gra_events_today: number;
  gross_sales_total: number;
  orders_total: number;
  failed_gra_events_total: number;
  alerts: Array<{
    type: string;
    message: string;
    operator_id?: string;
    operator_slug?: string;
  }>;
};

type SystemHealth = {
  status: string;
  postgres: { ok: boolean };
  redis: { ok: boolean };
  worker: { worker_alive: boolean };
};

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = usePlatformSession();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    Promise.all([
      platformFetch<Dashboard>("/v1/platform/dashboard"),
      platformFetch<SystemHealth>("/v1/platform/system/health").catch(
        () => null,
      ),
    ])
      .then(([dash, sys]) => {
        setDashboard(dash);
        setHealth(sys);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const todayLabel = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <PlatformShell
      title="Dashboard"
      subtitle={todayLabel}
      actions={
        isAdmin ? (
          <Link href="/operators/new" className="btn">
            New operator
          </Link>
        ) : undefined
      }
    >
      {loading && (
        <div className="dashboard-loading">
          <div className="skeleton skeleton-hero" />
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </div>
      )}

      {!loading && dashboard && (
        <div className="dashboard">
          <section className="dashboard-hero card">
            <div>
              <p className="dashboard-hero-label">Platform overview</p>
              <h2 className="dashboard-hero-title">
                {user?.email ? `Welcome back` : "Welcome"}
              </h2>
              <p className="muted dashboard-hero-desc">
                Monitor licensed operators, sales rollups, and compliance
                signals across all tenant sites.
              </p>
            </div>
            <div className="dashboard-hero-metrics">
              <div>
                <span className="stat-card-label">Operators live</span>
                <span className="stat-card-value stat-card-value--sm">
                  {formatNumber(dashboard.operators_active)}
                </span>
              </div>
              <div>
                <span className="stat-card-label">Sales today</span>
                <span className="stat-card-value stat-card-value--sm">
                  {formatKes(dashboard.gross_sales_today)}
                </span>
              </div>
            </div>
          </section>

          {health && (
            <p className="muted" style={{ marginBottom: 16 }}>
              Infrastructure: Postgres {health.postgres.ok ? "OK" : "down"} · Redis{" "}
              {health.redis.ok ? "OK" : "down"} · Worker{" "}
              {health.worker.worker_alive ? "alive" : "not responding"} ·{" "}
              <Link href="/system">System details</Link>
            </p>
          )}

          {dashboard.alerts.length > 0 && (
            <section className="dashboard-alerts">
              <h3 className="section-title">Needs attention</h3>
              <ul className="alert-stack">
                {dashboard.alerts.map((alert, i) => (
                  <li key={i} className="alert-item">
                    <span className="alert-dot" />
                    {alert.operator_id ? (
                      <Link href={`/operators/${alert.operator_id}`}>
                        {alert.message}
                      </Link>
                    ) : (
                      <span>{alert.message}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="section-title">Operators</h3>
            <div className="stat-grid">
              <StatCard
                label="Total"
                value={formatNumber(dashboard.operators_total)}
                hint="All licensed tenants"
                tone="info"
              />
              <StatCard
                label="Active"
                value={formatNumber(dashboard.operators_active)}
                hint="Provisioned & live"
                tone="success"
              />
              <StatCard
                label="Onboarding"
                value={formatNumber(dashboard.operators_onboarding)}
                hint="Provisioning in progress"
                tone="warning"
              />
              <StatCard
                label="Failed provision"
                value={formatNumber(dashboard.operators_failed)}
                hint="Needs intervention"
                tone={
                  dashboard.operators_failed > 0 ? "danger" : "default"
                }
              />
            </div>
          </section>

          <div className="dashboard-columns">
            <section className="card dashboard-panel">
              <div className="panel-header">
                <h3 className="section-title">Today</h3>
                <span className="status-pill">Live rollups</span>
              </div>
              <div className="metric-rows">
                <div className="metric-row">
                  <span>Gross sales</span>
                  <strong>{formatKes(dashboard.gross_sales_today)}</strong>
                </div>
                <div className="metric-row">
                  <span>Orders</span>
                  <strong>{formatNumber(dashboard.orders_today)}</strong>
                </div>
                <div className="metric-row">
                  <span>Tax collected</span>
                  <strong>{formatKes(dashboard.tax_collected_today)}</strong>
                </div>
                <div className="metric-row">
                  <span>Failed GRA events</span>
                  <strong
                    className={
                      dashboard.failed_gra_events_today > 0
                        ? "text-danger"
                        : undefined
                    }
                  >
                    {formatNumber(dashboard.failed_gra_events_today)}
                  </strong>
                </div>
              </div>
            </section>

            <section className="card dashboard-panel">
              <div className="panel-header">
                <h3 className="section-title">Lifetime</h3>
                <span className="status-pill status-muted">All tenants</span>
              </div>
              <div className="metric-rows">
                <div className="metric-row">
                  <span>Gross sales</span>
                  <strong>{formatKes(dashboard.gross_sales_total)}</strong>
                </div>
                <div className="metric-row">
                  <span>Orders</span>
                  <strong>{formatNumber(dashboard.orders_total)}</strong>
                </div>
                <div className="metric-row">
                  <span>Failed GRA events</span>
                  <strong
                    className={
                      dashboard.failed_gra_events_total > 0
                        ? "text-danger"
                        : undefined
                    }
                  >
                    {formatNumber(dashboard.failed_gra_events_total)}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <section className="card dashboard-quick">
            <h3 className="section-title">Quick actions</h3>
            <div className="quick-links">
              <Link href="/operators" className="quick-link">
                <span className="quick-link-title">Operators</span>
                <span className="muted">Manage tenant sites</span>
              </Link>
              <Link href="/reports" className="quick-link">
                <span className="quick-link-title">Reports</span>
                <span className="muted">Rollups & GRA health</span>
              </Link>
              <Link href="/system" className="quick-link">
                <span className="quick-link-title">System</span>
                <span className="muted">Health & worker status</span>
              </Link>
              <Link href="/settings" className="quick-link">
                <span className="quick-link-title">Settings</span>
                <span className="muted">Account security & platform config</span>
              </Link>
            </div>
          </section>

          <p className="dashboard-footnote muted">
            Sales figures sync from nightly rollups and update when payments
            complete. Failed GRA counts reflect government registry submissions.
          </p>
        </div>
      )}
    </PlatformShell>
  );
}
