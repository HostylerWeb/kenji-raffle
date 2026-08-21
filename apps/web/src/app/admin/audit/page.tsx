"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  staff_email?: string;
  created_at: string;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AuditPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    Promise.all([
      operatorFetch<AuditRow[]>("/v1/admin/audit-logs"),
      operatorFetch<Settings>("/v1/admin/settings"),
    ])
      .then(([audit, sett]) => {
        setRows(audit);
        setSettings(sett);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <OperatorAdminShell
      title="Audit log"
      description="Staff actions on this operator account."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <div className="admin-panel">
        <table className="table">
          <thead>
            <tr>
              <th align="left">Time</th>
              <th align="left">Action</th>
              <th align="left">Staff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="muted">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td>{row.action}</td>
                <td>{row.staff_email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="muted">No audit events yet.</p>
        )}
      </div>
    </OperatorAdminShell>
  );
}
