"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlatformShell } from "../../components/PlatformShell";
import { StatusBadge } from "../../components/StatusBadge";
import { isAuthenticated, platformFetch } from "../../lib/api";
import { usePlatformSession } from "../../lib/use-platform-session";

type OperatorRow = {
  id: string;
  slug: string;
  name: string;
  gra_registry_id: string;
  status: string;
  database_status?: string;
  primary_hostname?: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  "",
  "active",
  "onboarding",
  "onboarding_failed",
  "suspended",
  "archived",
];

export default function OperatorsPage() {
  const router = useRouter();
  const { isAdmin } = usePlatformSession();
  const [operators, setOperators] = useState<OperatorRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    const qs = statusFilter ? `?status=${statusFilter}` : "";
    platformFetch<OperatorRow[]>(`/v1/platform/operators${qs}`)
      .then(setOperators)
      .catch(() => router.replace("/"));
  }, [router, statusFilter]);

  return (
    <PlatformShell
      title="Operators"
      actions={
        isAdmin ? (
          <Link href="/operators/new" className="btn">
            New operator
          </Link>
        ) : undefined
      }
    >
      <div className="filter-form">
        <label>
          Filter by status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s || "All"}
              </option>
            ))}
          </select>
        </label>
      </div>
      {operators.length === 0 ? (
        <div className="card">
          <p>No operators match this filter.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>GRA ID</th>
                <th>Status</th>
                <th>Database</th>
                <th>Hostname</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr key={op.id}>
                  <td>
                    <Link href={`/operators/${op.id}`}>{op.name}</Link>
                  </td>
                  <td>{op.slug}</td>
                  <td>{op.gra_registry_id}</td>
                  <td><StatusBadge status={op.status} /></td>
                  <td>
                    {op.database_status ? (
                      <StatusBadge status={op.database_status} />
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="muted">{op.primary_hostname ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlatformShell>
  );
}
