"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformShell } from "../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../lib/api";

type PlatformUser = {
  id: string;
  email: string;
  role: string;
  last_login_at?: string;
  created_at: string;
};

type SessionInfo = {
  mfa_enabled: boolean;
  user: { email: string };
};

export default function PlatformUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("platform_support");
  const [mfaCode, setMfaCode] = useState("");
  const [actorMfaEnabled, setActorMfaEnabled] = useState(false);
  const [createStep, setCreateStep] = useState<"details" | "confirm">("details");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("platform_support");
  const [editPassword, setEditPassword] = useState("");

  async function loadUsers() {
    setUsers(await platformFetch<PlatformUser[]>("/v1/platform/platform-users"));
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    loadUsers().catch(() => router.replace("/"));
    platformFetch<SessionInfo>("/v1/platform/auth/session")
      .then((s) => setActorMfaEnabled(s.mfa_enabled))
      .catch(() => undefined);
  }, [router]);

  function resetCreateForm() {
    setEmail("");
    setPassword("");
    setRole("platform_support");
    setMfaCode("");
    setCreateStep("details");
    setError("");
  }

  async function createUser(mfa?: string) {
    setLoading(true);
    setError("");
    try {
      await platformFetch("/v1/platform/platform-users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          role,
          mfa_code: mfa || undefined,
        }),
      });
      resetCreateForm();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitDetails(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (actorMfaEnabled) {
      setCreateStep("confirm");
      return;
    }
    await createUser();
  }

  async function onSubmitConfirm(e: FormEvent) {
    e.preventDefault();
    await createUser(mfaCode);
  }

  async function saveEdit(userId: string) {
    setLoading(true);
    setError("");
    try {
      await platformFetch(`/v1/platform/platform-users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: editRole,
          password: editPassword || undefined,
        }),
      });
      setEditId(null);
      setEditPassword("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlatformShell title="Platform users">
      <div className="card" style={{ marginBottom: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Last login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  {editId === user.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      style={{ padding: 8 }}
                    >
                      <option value="platform_support">platform_support</option>
                      <option value="platform_admin">platform_admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="muted">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString()
                    : "—"}
                </td>
                <td>
                  {editId === user.id ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input
                        type="password"
                        placeholder="New password (optional)"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        style={{ padding: 8, minWidth: 160 }}
                      />
                      <button
                        type="button"
                        className="btn"
                        disabled={loading}
                        onClick={() => saveEdit(user.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditId(user.id);
                        setEditRole(user.role);
                        setEditPassword("");
                      }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add platform user</h2>

        {createStep === "details" && (
          <form className="form" onSubmit={onSubmitDetails}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label>
              Role
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ padding: 10, borderRadius: 8 }}
              >
                <option value="platform_support">platform_support</option>
                <option value="platform_admin">platform_admin</option>
              </select>
            </label>
            {actorMfaEnabled && (
              <p className="muted" style={{ fontSize: 13 }}>
                Two-factor authentication is enabled on your account. You will
                confirm with your authenticator app on the next step.
              </p>
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn" disabled={loading}>
              {loading
                ? "Creating…"
                : actorMfaEnabled
                  ? "Continue"
                  : "Create user"}
            </button>
          </form>
        )}

        {createStep === "confirm" && (
          <form className="form" onSubmit={onSubmitConfirm}>
            <p className="muted login-step">
              Step 2 — confirm your identity with Google Authenticator before
              creating this account.
            </p>
            <div className="card" style={{ padding: 14, background: "#f8fafc" }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                <strong>{email}</strong>
                <br />
                <span className="muted">Role: {role}</span>
              </p>
            </div>
            <label>
              Your 2FA code
              <input
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
                required
                minLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </label>
            {error && <p className="error">{error}</p>}
            <div className="actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Creating…" : "Confirm and create user"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={() => {
                  setCreateStep("details");
                  setMfaCode("");
                  setError("");
                }}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </PlatformShell>
  );
}
