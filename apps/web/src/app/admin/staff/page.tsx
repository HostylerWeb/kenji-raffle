"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type StaffRow = {
  id: string;
  email: string;
  role: string;
  last_login_at?: string;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("support");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    Promise.all([
      operatorFetch<StaffRow[]>("/v1/admin/staff"),
      operatorFetch<Settings>("/v1/admin/settings"),
    ])
      .then(([rows, sett]) => {
        setStaff(rows);
        setSettings(sett);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function onInvite(e: FormEvent) {
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
      setStaff(await operatorFetch<StaffRow[]>("/v1/admin/staff"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

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
        <table className="table">
          <thead>
            <tr>
              <th align="left">Email</th>
              <th align="left">Role</th>
              <th align="left">Last login</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>
                  <select
                    value={row.role}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      setLoading(true);
                      setError("");
                      try {
                        await operatorFetch(`/v1/admin/staff/${row.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ role: newRole }),
                        });
                        setStaff(
                          await operatorFetch<StaffRow[]>("/v1/admin/staff"),
                        );
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Update failed",
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    style={{ padding: 8 }}
                    disabled={loading}
                  >
                    <option value="owner">owner</option>
                    <option value="manager">manager</option>
                    <option value="support">support</option>
                    <option value="finance">finance</option>
                  </select>
                </td>
                <td className="muted">
                  {row.last_login_at
                    ? new Date(row.last_login_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <h2 style={{ marginTop: 0 }}>Invite staff</h2>
        <p className="muted">Owners and managers can invite new staff accounts.</p>
        <form className="form" onSubmit={onInvite}>
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
              <option value="manager">manager</option>
              <option value="support">support</option>
              <option value="finance">finance</option>
              <option value="owner">owner</option>
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Inviting…" : "Invite staff"}
          </button>
        </form>
      </div>
    </OperatorAdminShell>
  );
}
