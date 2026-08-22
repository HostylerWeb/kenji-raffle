"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformShell } from "../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../lib/api";

type ReportRow = {
  operator_id: string;
  slug: string;
  name: string;
  status: string;
  gross_sales_total: number;
  tax_collected_total: number;
  orders_total: number;
  failed_gra_events_total: number;
};

type FailedProvisionReport = {
  stuck_onboarding: Array<{
    operator_id: string;
    slug: string;
    name: string;
    provision_error?: string | null;
  }>;
  onboarding_failed: Array<{
    operator_id: string;
    slug: string;
    name: string;
    provision_error?: string | null;
  }>;
  tenant_db_failed: Array<{
    operator_id: string;
    slug?: string;
    name?: string;
    provision_error?: string | null;
  }>;
};

type GraHealthRow = {
  operator_id: string;
  slug: string;
  name: string;
  status: string;
  gra_credentials_configured: boolean;
  failed_gra_events_total: number;
  pending_queue_depth: number;
  failed_queue_count: number;
  oldest_pending_at: string | null;
  oldest_pending_age_minutes: number | null;
  last_successful_send_at: string | null;
  gra_last_heartbeat_at: string | null;
  gra_last_heartbeat_status: string | null;
  gra_last_heartbeat_error: string | null;
  alert_stale_pending: boolean;
  alert_failed_events: boolean;
  alert_heartbeat_failed: boolean;
};

export default function ReportsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [failedReport, setFailedReport] = useState<FailedProvisionReport | null>(
    null,
  );
  const [graHealth, setGraHealth] = useState<GraHealthRow[]>([]);

  function load() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    platformFetch<ReportRow[]>(
      `/v1/platform/reports/cross-operator${qs ? `?${qs}` : ""}`,
    ).then(setRows);

    platformFetch<FailedProvisionReport>(
      "/v1/platform/reports/failed-provisions",
    ).then(setFailedReport);

    platformFetch<GraHealthRow[]>("/v1/platform/reports/gra-health").then(
      setGraHealth,
    );
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    load();
  }, [router]);

  function exportCsv() {
    const header =
      "operator,name,status,gross_sales,tax_collected,orders,failed_gra";
    const lines = rows.map(
      (r) =>
        `${r.slug},${r.name},${r.status},${r.gross_sales_total},${r.tax_collected_total},${r.orders_total},${r.failed_gra_events_total}`,
    );
    const blob = new Blob([[header, ...lines].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cross-operator-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PlatformShell title="Cross-operator reports">
      <div className="form filter-form">
        <label>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Apply range
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Status</th>
              <th>Gross sales</th>
              <th>Tax collected</th>
              <th>Orders</th>
              <th>Failed GRA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.operator_id}>
                <td>
                  <Link href={`/operators/${row.operator_id}`}>{row.name}</Link>
                </td>
                <td>{row.status}</td>
                <td>{row.gross_sales_total}</td>
                <td>{row.tax_collected_total}</td>
                <td>{row.orders_total}</td>
                <td>{row.failed_gra_events_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>GRA health</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Credentials</th>
              <th>Pending</th>
              <th>Oldest pending</th>
              <th>Last send</th>
              <th>Heartbeat</th>
              <th>Failed GRA (rollup)</th>
            </tr>
          </thead>
          <tbody>
            {graHealth.map((row) => (
              <tr
                key={row.operator_id}
                className={
                  row.alert_stale_pending || row.alert_heartbeat_failed
                    ? "row-alert"
                    : undefined
                }
              >
                <td>
                  <Link href={`/operators/${row.operator_id}`}>{row.name}</Link>
                </td>
                <td>
                  {row.gra_credentials_configured ? "Configured" : "Missing"}
                </td>
                <td>{row.pending_queue_depth}</td>
                <td>
                  {row.oldest_pending_age_minutes != null
                    ? `${row.oldest_pending_age_minutes} min`
                    : "—"}
                </td>
                <td className="muted">
                  {row.last_successful_send_at
                    ? new Date(row.last_successful_send_at).toLocaleString()
                    : "—"}
                </td>
                <td>
                  {row.gra_last_heartbeat_status === "ok"
                    ? "OK"
                    : row.gra_last_heartbeat_status === "failed"
                      ? "Failed"
                      : "—"}
                </td>
                <td>{row.failed_gra_events_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {graHealth.length === 0 && (
          <p className="muted">No active operators for GRA health report.</p>
        )}
      </div>

      {failedReport && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Failed / stuck provisions</h2>
          {failedReport.onboarding_failed.length === 0 &&
          failedReport.stuck_onboarding.length === 0 &&
          failedReport.tenant_db_failed.length === 0 ? (
            <p className="muted">No failed or stuck provisions.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Issue</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {failedReport.onboarding_failed.map((row) => (
                  <tr key={row.operator_id}>
                    <td>
                      <Link href={`/operators/${row.operator_id}`}>{row.name}</Link>
                    </td>
                    <td>onboarding_failed</td>
                    <td className="muted">{row.provision_error ?? "—"}</td>
                  </tr>
                ))}
                {failedReport.stuck_onboarding.map((row) => (
                  <tr key={row.operator_id}>
                    <td>
                      <Link href={`/operators/${row.operator_id}`}>{row.name}</Link>
                    </td>
                    <td>stuck onboarding (&gt;15m)</td>
                    <td className="muted">{row.provision_error ?? "—"}</td>
                  </tr>
                ))}
                {failedReport.tenant_db_failed.map((row) => (
                  <tr key={row.operator_id}>
                    <td>
                      <Link href={`/operators/${row.operator_id}`}>
                        {row.name ?? row.slug ?? row.operator_id}
                      </Link>
                    </td>
                    <td>tenant_db_failed</td>
                    <td className="muted">{row.provision_error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </PlatformShell>
  );
}
