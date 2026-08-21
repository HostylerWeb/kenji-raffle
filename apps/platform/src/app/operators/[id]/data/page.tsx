"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformShell } from "../../../../components/PlatformShell";
import { isAuthenticated, platformFetch } from "../../../../lib/api";
import { usePlatformSession } from "../../../../lib/use-platform-session";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  user_email: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  tax_amount: number;
  payment_method: string;
  user_email: string;
  created_at: string;
};

type Summary = {
  players_count: number;
  orders_count: number;
  completed_orders_count: number;
  active_raffles_count: number;
  failed_gra_events_count: number;
  schema_version: string | null;
  expected_schema_version: string;
  schema_drift: boolean;
};

type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

type GraEventRow = {
  id: string;
  event_type: string;
  status: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
};

type GraEventsResponse = Paginated<GraEventRow> & {
  last_successful_at: string | null;
  last_successful_type: string | null;
};

export default function OperatorDataPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<"summary" | "orders" | "payments" | "gra">(
    "summary",
  );
  const [operatorName, setOperatorName] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [graEvents, setGraEvents] = useState<GraEventRow[]>([]);
  const [graMeta, setGraMeta] = useState<{
    last_successful_at: string | null;
    last_successful_type: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const { isAdmin: admin } = usePlatformSession();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    platformFetch<{ name: string }>(`/v1/platform/operators/${params.id}`)
      .then((op) => setOperatorName(op.name))
      .catch(() => router.replace("/operators"));
  }, [params.id, router]);

  useEffect(() => {
    setError("");
    if (tab === "summary") {
      platformFetch<Summary>(
        `/v1/platform/operators/${params.id}/drill-down/summary`,
      )
        .then(setSummary)
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load"),
        );
    } else if (tab === "orders") {
      platformFetch<Paginated<OrderRow>>(
        `/v1/platform/operators/${params.id}/drill-down/orders?page=${page}`,
      )
        .then((data) => setOrders(data.items))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load orders"),
        );
    } else if (tab === "payments") {
      platformFetch<Paginated<PaymentRow>>(
        `/v1/platform/operators/${params.id}/drill-down/payments?page=${page}`,
      )
        .then((data) => setPayments(data.items))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load payments"),
        );
    } else if (tab === "gra") {
      platformFetch<GraEventsResponse>(
        `/v1/platform/operators/${params.id}/drill-down/gra-events?page=${page}`,
      )
        .then((data) => {
          setGraEvents(data.items);
          setGraMeta({
            last_successful_at: data.last_successful_at,
            last_successful_type: data.last_successful_type,
          });
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load GRA events"),
        );
    }
  }, [params.id, tab, page]);

  async function retryGraEvent(eventId: string) {
    setError("");
    try {
      await platformFetch(
        `/v1/platform/operators/${params.id}/drill-down/gra-events/${eventId}/retry`,
        { method: "POST" },
      );
      setPage(1);
      const data = await platformFetch<GraEventsResponse>(
        `/v1/platform/operators/${params.id}/drill-down/gra-events?page=1`,
      );
      setGraEvents(data.items);
      setGraMeta({
        last_successful_at: data.last_successful_at,
        last_successful_type: data.last_successful_type,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    }
  }

  return (
    <PlatformShell
      title={operatorName ? `${operatorName} — live data` : "Tenant drill-down"}
      actions={
        <Link href={`/operators/${params.id}`} className="btn btn-secondary">
          Back to operator
        </Link>
      }
    >
      <div className="tab-row">
        {(["summary", "orders", "payments", "gra"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "tab active" : "tab"}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="muted">
        Audited live reads from tenant database. Each view is logged in audit.
      </p>
      {error && <p className="error">{error}</p>}

      {tab === "summary" && summary && (
        <div className="card detail-grid">
          <dl>
            <div className="detail-row">
              <dt>Players</dt>
              <dd>{summary.players_count}</dd>
            </div>
            <div className="detail-row">
              <dt>Orders</dt>
              <dd>{summary.orders_count}</dd>
            </div>
            <div className="detail-row">
              <dt>Completed orders</dt>
              <dd>{summary.completed_orders_count}</dd>
            </div>
            <div className="detail-row">
              <dt>Active raffles</dt>
              <dd>{summary.active_raffles_count}</dd>
            </div>
            <div className="detail-row">
              <dt>Failed GRA events</dt>
              <dd>{summary.failed_gra_events_count}</dd>
            </div>
            <div className="detail-row">
              <dt>Schema version</dt>
              <dd>
                {summary.schema_version ?? "—"}
                {summary.schema_drift && (
                  <span className="error"> (drift — migrate required)</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {tab === "orders" && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>User</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="muted">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td>{order.user_email}</td>
                  <td>{order.status}</td>
                  <td>{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>User</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Tax</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="muted">
                    {new Date(payment.created_at).toLocaleString()}
                  </td>
                  <td>{payment.user_email}</td>
                  <td>{payment.status}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.tax_amount}</td>
                  <td>{payment.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {tab === "gra" && (
        <div className="card">
          {graMeta && (
            <p className="muted">
              Last successful outbound:{" "}
              {graMeta.last_successful_at
                ? `${graMeta.last_successful_type} at ${new Date(
                    graMeta.last_successful_at,
                  ).toLocaleString()}`
                : "none recorded"}
            </p>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Type</th>
                <th>Status</th>
                <th>Retries</th>
                <th>Error</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {graEvents.map((event) => (
                <tr key={event.id}>
                  <td className="muted">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                  <td>{event.event_type}</td>
                  <td>{event.status}</td>
                  <td>{event.retry_count}</td>
                  <td className="muted">{event.last_error ?? "—"}</td>
                  <td>
                    {admin && event.status === "failed" && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => retryGraEvent(event.id)}
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
