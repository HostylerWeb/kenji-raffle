"use client";

import { Fragment, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformShell } from "../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../lib/api";

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  operator_slug?: string;
  user_email?: string;
  metadata?: unknown;
  created_at: string;
};

type AuditResponse = {
  items: AuditRow[];
  page: number;
  limit: number;
  total: number;
};

export default function AuditPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  function load(pageNum = page) {
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: "50",
    });
    if (action) params.set("action", action);
    if (operatorId) params.set("operator_id", operatorId);

    platformFetch<AuditResponse>(`/v1/platform/audit-logs?${params}`)
      .then((data) => {
        setRows(data.items);
        setTotal(data.total);
        setPage(data.page);
      })
      .catch(() => router.replace("/"));
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    load(1);
  }, [router]);

  function onFilter(e: FormEvent) {
    e.preventDefault();
    load(1);
  }

  return (
    <PlatformShell title="Audit log">
      <form className="form filter-form" onSubmit={onFilter}>
        <label>
          Action contains
          <input value={action} onChange={(e) => setAction(e.target.value)} />
        </label>
        <label>
          Operator ID
          <input
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Operator</th>
              <th>User</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <tr>
                  <td className="muted">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td>{row.action}</td>
                  <td>{row.entity_type}</td>
                  <td>{row.operator_slug ?? "—"}</td>
                  <td>{row.user_email ?? "—"}</td>
                  <td>
                    {row.metadata != null && (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() =>
                          setExpanded(expanded === row.id ? null : row.id)
                        }
                      >
                        {expanded === row.id ? "Hide" : "Meta"}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr>
                    <td colSpan={6}>
                      <pre className="metadata-pre">
                        {JSON.stringify(row.metadata, null, 2)}
                      </pre>
                      {row.entity_id && (
                        <p className="muted">Entity ID: {row.entity_id}</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        <p className="muted">
          Page {page} — {total} total events
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </PlatformShell>
  );
}
