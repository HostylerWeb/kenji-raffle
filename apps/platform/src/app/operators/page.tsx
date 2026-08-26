"use client";

import { useEffect, useMemo, useState } from "react";
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

const STATUS_TABS = [
  { id: "", label: "All" },
  { id: "active", label: "Active" },
  { id: "onboarding", label: "Onboarding" },
  { id: "onboarding_failed", label: "Onboarding failed" },
  { id: "suspended", label: "Suspended" },
  { id: "archived", label: "Archived" },
] as const;

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

    platformFetch<OperatorRow[]>("/v1/platform/operators")
      .then(setOperators)
      .catch(() => router.replace("/"));
  }, [router]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { "": operators.length };
    for (const tab of STATUS_TABS) {
      if (tab.id) counts[tab.id] = 0;
    }
    for (const op of operators) {
      counts[op.status] = (counts[op.status] ?? 0) + 1;
    }
    return counts;
  }, [operators]);

  const filteredOperators = useMemo(() => {
    if (!statusFilter) return operators;
    return operators.filter((op) => op.status === statusFilter);
  }, [operators, statusFilter]);

  const activeTab =
    STATUS_TABS.find((tab) => tab.id === statusFilter) ?? STATUS_TABS[0];

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
      <div className="tab-row" role="tablist" aria-label="Filter operators by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id || "all"}
            type="button"
            role="tab"
            aria-selected={statusFilter === tab.id}
            className={statusFilter === tab.id ? "tab active" : "tab"}
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label} ({statusCounts[tab.id] ?? 0})
          </button>
        ))}
      </div>

      {filteredOperators.length === 0 ? (
        <div className="card">
          <p>
            {operators.length === 0
              ? "No operators yet."
              : `No ${activeTab.label.toLowerCase()} operators.`}
          </p>
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
              {filteredOperators.map((op) => (
                <tr key={op.id}>
                  <td>
                    <Link href={`/operators/${op.id}`}>{op.name}</Link>
                  </td>
                  <td>{op.slug}</td>
                  <td>{op.gra_registry_id}</td>
                  <td>
                    <StatusBadge status={op.status} />
                  </td>
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
