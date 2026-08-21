"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlatformShell } from "../../../components/PlatformShell";
import { StatusBadge } from "../../../components/StatusBadge";
import { isAuthenticated, platformFetch } from "../../../lib/api";
import { usePlatformSession } from "../../../lib/use-platform-session";
import { rollupWindowSummary } from "../../../lib/rollup-summary";

type RollupRow = {
  date: string;
  gross_sales: number;
  orders_count: number;
  tax_collected: number;
  failed_gra_events: number;
};

type DrillDownAuditRow = {
  action: string;
  user_email?: string;
  created_at: string;
};

type OperatorDetail = {
  id: string;
  name: string;
  slug: string;
  gra_registry_id: string;
  licence_number?: string | null;
  status: string;
  created_at: string;
  tenant_database: {
    status: string;
    database_name: string;
    schema_version: string;
    provisioned_at?: string;
    provision_error?: string | null;
  } | null;
  domains: Array<{
    id: string;
    hostname: string;
    domain_type: string;
    verification_status: string;
    ssl_status: string;
    is_primary: boolean;
  }>;
  settings: {
    support_email: string | null;
    primary_color: string | null;
    gra_credentials_configured: boolean;
    feature_flags?: Record<string, boolean>;
  } | null;
  dns_instructions: {
    cname_target: string;
    txt_record_name: string;
    txt_record_value: string;
    steps: string[];
  };
};

export default function OperatorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [operator, setOperator] = useState<OperatorDetail | null>(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [customHostname, setCustomHostname] = useState("");
  const [graApiKey, setGraApiKey] = useState("");
  const [graHmacSecret, setGraHmacSecret] = useState("");
  const [rollupRows, setRollupRows] = useState<RollupRow[]>([]);
  const [drillDownAudit, setDrillDownAudit] = useState<DrillDownAuditRow[]>([]);
  const [editName, setEditName] = useState("");
  const [editGraId, setEditGraId] = useState("");
  const [editLicence, setEditLicence] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "support" | "finance">(
    "manager",
  );
  const [inviteResult, setInviteResult] = useState("");
  const [destroyConfirm, setDestroyConfirm] = useState("");
  const [checkoutEnabled, setCheckoutEnabled] = useState(true);
  const [supportEmail, setSupportEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [graTestResult, setGraTestResult] = useState("");
  const { isAdmin: admin } = usePlatformSession();

  const salesToday = rollupWindowSummary(rollupRows, 1);
  const sales7d = rollupWindowSummary(rollupRows, 7);
  const sales30d = rollupWindowSummary(rollupRows, 30);

  const load = useCallback(async () => {
    const data = await platformFetch<OperatorDetail>(
      `/v1/platform/operators/${params.id}`,
    );
    setOperator(data);
    setEditName(data.name);
    setEditGraId(data.gra_registry_id);
    setEditLicence(data.licence_number ?? "");
    setCheckoutEnabled(
      data.settings?.feature_flags?.checkout_enabled !== false,
    );
    setSupportEmail(data.settings?.support_email ?? "");
    setPrimaryColor(data.settings?.primary_color ?? "");
    platformFetch<RollupRow[]>(`/v1/platform/operators/${params.id}/rollup`)
      .then(setRollupRows)
      .catch(() => setRollupRows([]));

    platformFetch<{ items: DrillDownAuditRow[] }>(
      `/v1/platform/audit-logs?operator_id=${params.id}&action=drill_down&limit=20`,
    )
      .then((res) => setDrillDownAudit(res.items))
      .catch(() => setDrillDownAudit([]));
  }, [params.id]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    load().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load operator");
    });
  }, [load, router]);

  useEffect(() => {
    if (!operator) return;
    const provisioning =
      operator.status === "onboarding" ||
      operator.tenant_database?.status === "provisioning";
    if (!provisioning) return;
    const interval = setInterval(() => load().catch(() => undefined), 3000);
    return () => clearInterval(interval);
  }, [operator, load]);

  async function updateStatus(status: "active" | "suspended" | "archived") {
    setActionLoading(true);
    setError("");
    try {
      setOperator(
        await platformFetch<OperatorDetail>(
          `/v1/platform/operators/${params.id}`,
          { method: "PATCH", body: JSON.stringify({ status }) },
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function reprovision() {
    setActionLoading(true);
    setError("");
    try {
      setOperator(
        await platformFetch<OperatorDetail>(
          `/v1/platform/operators/${params.id}/reprovision-db`,
          { method: "POST" },
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-provision failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function addCustomDomain(e: FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/domains`, {
        method: "POST",
        body: JSON.stringify({
          hostname: customHostname,
          domain_type: "custom",
        }),
      });
      setCustomHostname("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setActionLoading(false);
    }
  }

  async function verifyDomain(domainId: string) {
    setActionLoading(true);
    try {
      if (admin) {
        await platformFetch(
          `/v1/platform/operators/${params.id}/domains/${domainId}/verify-dns`,
          { method: "POST" },
        );
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify domain");
    } finally {
      setActionLoading(false);
    }
  }

  async function queueVerifyDomain(domainId: string) {
    setActionLoading(true);
    try {
      await platformFetch(
        `/v1/platform/operators/${params.id}/domains/${domainId}/verify-dns-queue`,
        { method: "POST" },
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to queue DNS verify");
    } finally {
      setActionLoading(false);
    }
  }

  async function migrateTenant() {
    setActionLoading(true);
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/migrate`, {
        method: "POST",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migrate failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function testConnection() {
    setActionLoading(true);
    try {
      const result = await platformFetch<{
        ok: boolean;
        error?: string;
        schema_drift?: boolean;
      }>(`/v1/platform/operators/${params.id}/test-connection`, {
        method: "POST",
      });
      if (!result.ok) {
        setError(result.error ?? "Connection failed");
      } else if (result.schema_drift) {
        setError("Connected but schema version drift detected — run migrate.");
      } else {
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveMetadata(e: FormEvent) {
    e.preventDefault();
    if (!admin) return;
    setActionLoading(true);
    setError("");
    try {
      setOperator(
        await platformFetch<OperatorDetail>(
          `/v1/platform/operators/${params.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: editName,
              gra_registry_id: editGraId,
              licence_number: editLicence,
            }),
          },
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveFeatureFlags(e: FormEvent) {
    e.preventDefault();
    if (!admin) return;
    setActionLoading(true);
    setError("");
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/settings`, {
        method: "PATCH",
        body: JSON.stringify({
          feature_flags: { checkout_enabled: checkoutEnabled },
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flags");
    } finally {
      setActionLoading(false);
    }
  }

  async function inviteStaff(e: FormEvent) {
    e.preventDefault();
    if (!admin) return;
    setActionLoading(true);
    setInviteResult("");
    setError("");
    try {
      const result = await platformFetch<{
        email: string;
        temporary_password: string;
      }>(`/v1/platform/operators/${params.id}/invite-staff`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setInviteResult(
        `Invited ${result.email}. Temporary password: ${result.temporary_password}`,
      );
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function hardDestroy() {
    if (!admin || !operator) return;
    if (destroyConfirm !== operator.slug) {
      setError("Type the operator slug to confirm permanent delete");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/destroy`, {
        method: "POST",
        body: JSON.stringify({ confirm_slug: destroyConfirm }),
      });
      router.push("/operators");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveBranding(e: FormEvent) {
    e.preventDefault();
    if (!admin) return;
    setActionLoading(true);
    setError("");
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/settings`, {
        method: "PATCH",
        body: JSON.stringify({
          support_email: supportEmail.trim(),
          primary_color: primaryColor.trim(),
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding");
    } finally {
      setActionLoading(false);
    }
  }

  async function testGraConnection() {
    setActionLoading(true);
    setGraTestResult("");
    setError("");
    try {
      const result = await platformFetch<{ ok: boolean; error?: string }>(
        `/v1/platform/operators/${params.id}/test-gra-connection`,
        { method: "POST" },
      );
      setGraTestResult(
        result.ok
          ? "GRA ingest connection succeeded."
          : result.error ?? "GRA ingest connection failed",
      );
      if (!result.ok) {
        setError(result.error ?? "GRA ingest connection failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "GRA connection test failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveGraCredentials(e: FormEvent) {
    e.preventDefault();
    if (!graApiKey && !graHmacSecret) return;
    setActionLoading(true);
    setError("");
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/settings`, {
        method: "PATCH",
        body: JSON.stringify({
          gra_api_key: graApiKey || undefined,
          gra_hmac_secret: graHmacSecret || undefined,
        }),
      });
      setGraApiKey("");
      setGraHmacSecret("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save GRA keys");
    } finally {
      setActionLoading(false);
    }
  }

  if (!operator && !error) {
    return (
      <PlatformShell title="Operator">
        <p className="muted">Loading…</p>
      </PlatformShell>
    );
  }

  if (!operator) {
    return (
      <PlatformShell title="Operator">
        <p className="error">{error}</p>
      </PlatformShell>
    );
  }

  const primaryDomain = operator.domains.find((d) => d.is_primary);

  return (
    <PlatformShell title={operator.name}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Customer handoff</h2>
        <p className="muted">
          What <strong>we</strong> do vs what the <strong>customer</strong> does
          (Rafflex-style). Send them the admin URL and owner login after provisioning.
        </p>
        <div className="handoff-grid">
          <div className="handoff-box">
            <h3>We (platform team)</h3>
            <ul className="muted">
              <li>Create operator &amp; wait for DB active</li>
              <li>Set GRA API keys (compliance)</li>
              <li>Suspend / support / monitoring</li>
              <li>Optional: invite extra staff from platform console</li>
            </ul>
          </div>
          <div className="handoff-box">
            <h3>Customer (operator admin)</h3>
            <ul className="muted">
              <li>Log in at <code>/admin</code> on staging URL</li>
              <li>Customise site, create raffles, preview public site</li>
              <li>
                <strong>Domains &amp; go live</strong> — add hostname, DNS at
                Cloudflare, verify in their admin
              </li>
            </ul>
          </div>
        </div>
        {primaryDomain && (
          <p className="muted" style={{ marginTop: 12 }}>
            Staging: <code>{primaryDomain.hostname}</code> · Admin:{" "}
            <code>http://{primaryDomain.hostname}:3002/admin</code> · Owner:{" "}
            <code>owner@{operator.slug}.local</code> / ChangeMe123!
          </p>
        )}
      </div>

      <div className="actions" style={{ marginBottom: 16 }}>
        <a href={`/operators/${operator.id}/data`} className="btn btn-secondary">
          Live data drill-down
        </a>
        <a href={`/operators/${operator.id}/domains`} className="btn btn-secondary">
          Domains setup
        </a>
      </div>
      <div className="card detail-grid" style={{ marginBottom: 16 }}>
        <dl>
          <div className="detail-row">
            <dt>Status</dt>
            <dd><StatusBadge status={operator.status} /></dd>
          </div>
          <div className="detail-row">
            <dt>Slug</dt>
            <dd>{operator.slug}</dd>
          </div>
          <div className="detail-row">
            <dt>GRA registry ID</dt>
            <dd>{operator.gra_registry_id}</dd>
          </div>
          <div className="detail-row">
            <dt>Primary hostname</dt>
            <dd>{primaryDomain?.hostname ?? "—"}</dd>
          </div>
          <div className="detail-row">
            <dt>Database</dt>
            <dd>
              {operator.tenant_database ? (
                <>
                  <StatusBadge status={operator.tenant_database.status} />
                  <span className="muted" style={{ marginLeft: 8 }}>
                    {operator.tenant_database.database_name}
                  </span>
                </>
              ) : (
                "Not started"
              )}
            </dd>
          </div>
          {operator.tenant_database?.provision_error && (
            <div className="detail-row">
              <dt>Provision error</dt>
              <dd className="error">{operator.tenant_database.provision_error}</dd>
            </div>
          )}
          <div className="detail-row">
            <dt>Schema version</dt>
            <dd>{operator.tenant_database?.schema_version ?? "—"}</dd>
          </div>
          <div className="detail-row">
            <dt>Support email</dt>
            <dd>{operator.settings?.support_email ?? "—"}</dd>
          </div>
          <div className="detail-row">
            <dt>GRA credentials</dt>
            <dd>
              {operator.settings?.gra_credentials_configured
                ? "Configured"
                : "Not configured"}
            </dd>
          </div>
        </dl>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          {admin && (
            <>
              {(operator.status === "onboarding_failed" ||
                operator.tenant_database?.status === "failed") && (
                <button
                  type="button"
                  className="btn"
                  disabled={actionLoading}
                  onClick={reprovision}
                >
                  Re-provision database
                </button>
              )}
              {operator.tenant_database?.status === "active" && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    onClick={testConnection}
                  >
                    Test DB connection
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    onClick={migrateTenant}
                  >
                    Run tenant migrate
                  </button>
                </>
              )}
              {operator.status === "active" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={actionLoading}
                  onClick={() => updateStatus("suspended")}
                >
                  Suspend
                </button>
              )}
              {operator.status === "suspended" && (
                <button
                  type="button"
                  className="btn"
                  disabled={actionLoading}
                  onClick={() => updateStatus("active")}
                >
                  Reactivate
                </button>
              )}
              {operator.status !== "archived" && (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={actionLoading}
                  onClick={() => updateStatus("archived")}
                >
                  Archive
                </button>
              )}
            </>
          )}
        </div>

        {(operator.status === "onboarding" ||
          operator.tenant_database?.status === "provisioning") && (
          <p className="muted">Provisioning tenant database… auto-refreshing.</p>
        )}
      </div>

      <div className="card-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="stat-label">Sales today</div>
          <div className="stat-value">{salesToday.gross_sales}</div>
          <p className="muted">{salesToday.orders_count} orders</p>
        </div>
        <div className="card">
          <div className="stat-label">Last 7 days</div>
          <div className="stat-value">{sales7d.gross_sales}</div>
          <p className="muted">{sales7d.orders_count} orders</p>
        </div>
        <div className="card">
          <div className="stat-label">Last 30 days</div>
          <div className="stat-value">{sales30d.gross_sales}</div>
          <p className="muted">{sales30d.orders_count} orders</p>
        </div>
      </div>

      {admin && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Edit operator</h2>
          <form className="form" onSubmit={saveMetadata}>
            <label>
              Name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <label>
              GRA registry ID
              <input value={editGraId} onChange={(e) => setEditGraId(e.target.value)} />
            </label>
            <label>
              Licence number
              <input
                value={editLicence}
                onChange={(e) => setEditLicence(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-secondary" disabled={actionLoading}>
              Save metadata
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Drill-down audit</h2>
        <p className="muted">Recent audited live reads for this operator.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {drillDownAudit.map((row, i) => (
              <tr key={`${row.created_at}-${i}`}>
                <td className="muted">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td>{row.action}</td>
                <td>{row.user_email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {drillDownAudit.length === 0 && (
          <p className="muted">No drill-down sessions logged yet.</p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Domains</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Hostname</th>
              <th>Type</th>
              <th>Verification</th>
              <th>SSL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {operator.domains.map((domain) => (
              <tr key={domain.id}>
                <td>{domain.hostname}</td>
                <td>{domain.domain_type}</td>
                <td><StatusBadge status={domain.verification_status} /></td>
                <td><StatusBadge status={domain.ssl_status} /></td>
                <td>
                  {domain.domain_type === "custom" &&
                    domain.verification_status !== "verified" &&
                    admin && (
                      <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={actionLoading}
                        onClick={() => verifyDomain(domain.id)}
                      >
                        Verify DNS
                      </button>{" "}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={actionLoading}
                        onClick={() => queueVerifyDomain(domain.id)}
                      >
                        Queue verify
                      </button>
                      </>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Custom domain DNS</h3>
        <ul className="muted">
          {operator.dns_instructions.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <p className="muted">
          CNAME target: <code>{operator.dns_instructions.cname_target}</code>
        </p>
        <p className="muted">
          TXT: <code>{operator.dns_instructions.txt_record_value}</code>
        </p>

        {admin && (
          <form className="form" onSubmit={addCustomDomain}>
            <label>
              Add custom hostname
              <input
                value={customHostname}
                onChange={(e) => setCustomHostname(e.target.value)}
                placeholder="raffles.example.com"
              />
            </label>
            <button type="submit" className="btn" disabled={actionLoading}>
              Add custom domain
            </button>
          </form>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Rollups (90 days)</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Gross sales</th>
              <th>Tax</th>
              <th>Orders</th>
              <th>Failed GRA</th>
            </tr>
          </thead>
          <tbody>
            {rollupRows.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.gross_sales}</td>
                <td>{row.tax_collected}</td>
                <td>{row.orders_count}</td>
                <td>{row.failed_gra_events}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rollupRows.length === 0 && (
          <p className="muted">No rollup data yet.</p>
        )}
      </div>

      {admin && (
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Operator branding</h2>
        <p className="muted">
          Support email is used on checkout confirmation mail. Primary colour is stored for the tenant site theme.
        </p>
        <form className="form" onSubmit={saveBranding}>
          <label>
            Support email
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@operator.example"
            />
          </label>
          <label>
            Primary colour
            <input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#1d4ed8"
            />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={actionLoading}>
            Save branding
          </button>
        </form>
      </div>
      )}

      {admin && (
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Feature flags</h2>
        <form className="form" onSubmit={saveFeatureFlags}>
          <label>
            <input
              type="checkbox"
              checked={checkoutEnabled}
              onChange={(e) => setCheckoutEnabled(e.target.checked)}
            />
            Checkout enabled
          </label>
          <button type="submit" className="btn btn-secondary" disabled={actionLoading}>
            Save flags
          </button>
        </form>
      </div>
      )}

      {admin && operator.tenant_database?.status === "active" && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Invite operator staff</h2>
          <form className="form" onSubmit={inviteStaff}>
            <label>
              Email
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Role
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(
                    e.target.value as "manager" | "support" | "finance",
                  )
                }
              >
                <option value="manager">Manager</option>
                <option value="support">Support</option>
                <option value="finance">Finance</option>
              </select>
            </label>
            <button type="submit" className="btn" disabled={actionLoading}>
              Invite staff
            </button>
            {inviteResult && <p className="muted">{inviteResult}</p>}
          </form>
        </div>
      )}

      {admin && operator.status === "archived" && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Permanent delete</h2>
          <p className="muted">
            Drops tenant database and removes operator registry. Cannot be undone.
          </p>
          <label>
            Confirm slug <code>{operator.slug}</code>
            <input
              value={destroyConfirm}
              onChange={(e) => setDestroyConfirm(e.target.value)}
              placeholder={operator.slug}
            />
          </label>
          <button
            type="button"
            className="btn btn-danger"
            disabled={actionLoading}
            onClick={hardDestroy}
          >
            Permanently delete operator
          </button>
        </div>
      )}

      {admin && (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>GRA credentials</h2>
        <p className="muted">
          Stored encrypted in the platform database per operator.
        </p>
        <form className="form" onSubmit={saveGraCredentials}>
          <label>
            GRA API key
            <input
              type="password"
              value={graApiKey}
              onChange={(e) => setGraApiKey(e.target.value)}
              placeholder="Leave blank to keep existing"
            />
          </label>
          <label>
            GRA HMAC secret
            <input
              type="password"
              value={graHmacSecret}
              onChange={(e) => setGraHmacSecret(e.target.value)}
              placeholder="Leave blank to keep existing"
            />
          </label>
          <button type="submit" className="btn" disabled={actionLoading}>
            Save GRA credentials
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={actionLoading || !operator.settings?.gra_credentials_configured}
            onClick={testGraConnection}
          >
            Test GRA connection
          </button>
          {graTestResult && <p className="muted">{graTestResult}</p>}
        </form>
      </div>
      )}
    </PlatformShell>
  );
}
