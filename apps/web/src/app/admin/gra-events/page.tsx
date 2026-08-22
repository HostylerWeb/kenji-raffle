"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Event = {
  id: string;
  event_type: string;
  status: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
  payload: unknown;
};

type EventsResponse = {
  items: Event[];
  total: number;
  page: number;
  limit: number;
};

export default function GraEventsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<EventsResponse | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (status) params.set("status", status);
    setData(await operatorFetch<EventsResponse>(`/v1/admin/gra-events?${params.toString()}`));
  }, [page, status]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, load]);

  async function retry(id: string) {
    await operatorFetch(`/v1/admin/gra-events/${id}/retry`, { method: "POST" });
    await load();
    toast("Retry queued");
  }

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell title="GRA events" description="Outbound compliance events and retries.">
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Outbound events</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} event{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          hasActive={Boolean(status)}
          onClear={() => { setStatus(""); setPage(1); }}
        >
          <select
            className="admin-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </AdminFilters>
        <AdminTable
          columns={["Type", "Status", "Retries", "Created", "Error", ""]}
          isEmpty={items.length === 0}
          emptyTitle="No GRA events"
        >
          {items.map((e) => (
            <Fragment key={e.id}>
              <tr>
                <td>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                  >
                    {e.event_type}
                  </button>
                </td>
                <td><AdminStatusBadge status={e.status} /></td>
                <td>{e.retry_count}</td>
                <td className="muted">{new Date(e.created_at).toLocaleString()}</td>
                <td className="muted">{e.last_error ?? "—"}</td>
                <td>
                  {e.status !== "sent" && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => retry(e.id)}>
                      Retry
                    </button>
                  )}
                </td>
              </tr>
              {expandedId === e.id && (
                <tr>
                  <td colSpan={6}>
                    <pre className="admin-code-block">{JSON.stringify(e.payload, null, 2)}</pre>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>
    </OperatorAdminShell>
  );
}
