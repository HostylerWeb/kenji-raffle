"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminAuditEntity } from "@/components/admin/AdminAuditEntity";
import { AdminDrawer } from "@/components/admin/AdminDrawer";
import { AdminMfaPanel } from "@/components/admin/AdminMfaPanel";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatDate } from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type StaffRow = {
  id: string;
  email: string;
  role: string;
  last_login_at?: string;
  created_at?: string;
};

type StaffDetail = {
  id: string;
  email: string;
  role: string;
  mfa_enabled: boolean;
  mfa_pending: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  recent_activity: {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    entity_href?: string | null;
    created_at: string;
  }[];
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner — full access",
  manager: "Manager — raffles, site, staff",
  support: "Support — players & claims",
  finance: "Finance — orders, payments, reports",
};

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="admin-detail-item__label">{label}</div>
      <div className="admin-detail-item__value">{children}</div>
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-loading">
          <div className="admin-loading__spinner" />
          Loading staff…
        </div>
      }
    >
      <StaffPageContent />
    </Suspense>
  );
}

function StaffPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useAdminToast();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StaffDetail | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("support");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStaff = useCallback(async () => {
    setStaff(await operatorFetch<StaffRow[]>("/v1/admin/staff"));
  }, []);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    Promise.all([
      loadStaff(),
      operatorFetch<Settings>("/v1/admin/settings"),
      operatorFetch<{ user: { id: string }; mfa_enabled: boolean }>("/v1/admin/auth/session"),
    ])
      .then(([, sett, session]) => {
        setSettings(sett);
        setSessionUserId(session.user.id);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router, loadStaff]);

  useEffect(() => {
    const member = searchParams.get("member");
    if (member) setSelectedId(member);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    operatorFetch<StaffDetail>(`/v1/admin/staff/${selectedId}`)
      .then(setDetail)
      .catch(() => {
        setSelectedId(null);
        toast("Could not load staff details", "error");
      });
  }, [selectedId, toast]);

  function closeDrawer() {
    setSelectedId(null);
    if (searchParams.get("member")) {
      router.replace("/admin/staff");
    }
  }

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await operatorFetch("/v1/admin/staff", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });
      setEmail("");
      setPassword("");
      await loadStaff();
      toast("Staff member invited");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(staffId: string, newRole: string) {
    setLoading(true);
    setError("");
    try {
      await operatorFetch(`/v1/admin/staff/${staffId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      await loadStaff();
      if (selectedId === staffId) {
        setDetail(await operatorFetch<StaffDetail>(`/v1/admin/staff/${staffId}`));
      }
      toast("Role updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  const selectedRow = staff.find((s) => s.id === selectedId);
  const isSelf = selectedId === sessionUserId;

  return (
    <OperatorAdminShell
      title="Staff"
      description="Invite operators and assign roles."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Team members</h3>
            <p className="admin-panel__subtitle">{staff.length} staff account{staff.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <AdminTable
          columns={["Email", "Role", "Last login", ""]}
          isEmpty={staff.length === 0}
          emptyTitle="No staff yet"
          emptyDescription="Invite your first team member below."
        >
          {staff.map((row) => (
            <tr key={row.id}>
              <td>
                <button type="button" className="admin-link-btn" onClick={() => setSelectedId(row.id)}>
                  <strong>{row.email}</strong>
                </button>
                {row.id === sessionUserId && (
                  <span className="muted" style={{ display: "block", fontSize: 12 }}>You</span>
                )}
              </td>
              <td>
                <select
                  value={row.role}
                  onChange={(e) => updateRole(row.id, e.target.value)}
                  disabled={loading}
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                  <option value="finance">Finance</option>
                </select>
              </td>
              <td className="muted">
                {row.last_login_at ? new Date(row.last_login_at).toLocaleString() : "Never"}
              </td>
              <td>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedId(row.id)}>
                  Details
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Invite staff</h3>
            <p className="admin-panel__subtitle">Owners and managers can create new staff accounts.</p>
          </div>
        </div>
        <form className="admin-form-grid" onSubmit={onInvite} style={{ paddingBottom: 22 }}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="staff@yourbrand.co.ke" />
          </label>
          <label>
            Temporary password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <span className="field-hint">Minimum 8 characters — ask them to change it after first login.</span>
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="manager">Manager — full raffle & site access</option>
              <option value="support">Support — players & claims</option>
              <option value="finance">Finance — orders, payments, reports</option>
              <option value="owner">Owner — full access</option>
            </select>
          </label>
          {error && <p className="error admin-form-grid__full">{error}</p>}
          <div className="admin-form-grid__full admin-form-actions" style={{ padding: 0 }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Inviting…" : "Invite staff"}
            </button>
          </div>
        </form>
      </div>

      <AdminDrawer
        open={Boolean(selectedId)}
        title={selectedRow?.email ?? "Staff member"}
        onClose={closeDrawer}
      >
        {!detail ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <div className="admin-detail-grid" style={{ marginBottom: 24 }}>
              <DetailItem label="Role">{ROLE_LABELS[detail.role] ?? detail.role}</DetailItem>
              <DetailItem label="Joined">{formatDate(detail.created_at)}</DetailItem>
              <DetailItem label="Last login">{formatDate(detail.last_login_at)}</DetailItem>
            </div>

            {isSelf ? (
              <>
                <h4 className="admin-panel__title" style={{ marginBottom: 8 }}>Two-factor authentication</h4>
                <AdminMfaPanel
                  compact
                  mfaEnabled={detail.mfa_enabled}
                  mfaPending={detail.mfa_pending}
                  onStatusChange={async (enabled) => {
                    setDetail({ ...detail, mfa_enabled: enabled, mfa_pending: false });
                    await loadStaff();
                  }}
                />
              </>
            ) : (
              <div className="admin-detail-grid" style={{ marginBottom: 24 }}>
                <DetailItem label="MFA">
                  <AdminStatusBadge status={detail.mfa_enabled ? "active" : detail.mfa_pending ? "pending" : "cancelled"} />
                  {" "}
                  {detail.mfa_enabled
                    ? "Enabled"
                    : detail.mfa_pending
                      ? "Setup in progress"
                      : "Not enabled"}
                </DetailItem>
              </div>
            )}

            <h4 className="admin-panel__title" style={{ marginBottom: 8 }}>Recent activity</h4>
            {detail.recent_activity.length === 0 ? (
              <p className="muted">No audit events for this staff member yet.</p>
            ) : (
              <AdminTable columns={["Time", "Action", "Entity"]} isEmpty={false}>
                {detail.recent_activity.map((row) => (
                  <tr key={row.id}>
                    <td className="muted" style={{ fontSize: 12 }}>{formatDate(row.created_at)}</td>
                    <td>{row.action}</td>
                    <td>
                      <AdminAuditEntity
                        entityType={row.entity_type}
                        entityId={row.entity_id}
                        entityHref={row.entity_href}
                      />
                    </td>
                  </tr>
                ))}
              </AdminTable>
            )}

            {!isSelf && (
              <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
                Staff can enable MFA from their own account via{" "}
                <Link href="/admin/settings">Settings → Security</Link>.
              </p>
            )}
          </>
        )}
      </AdminDrawer>
    </OperatorAdminShell>
  );
}
