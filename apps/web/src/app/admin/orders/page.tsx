"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Order = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  total: number;
  status: string;
  created_at: string;
  payment_status?: string;
};

type OrdersResponse = {
  items: Order[];
  total: number;
  page: number;
  limit: number;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setData(await operatorFetch<OrdersResponse>(`/v1/admin/orders?${params.toString()}`));
  }, [page, search, status]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router]);

  useEffect(() => {
    if (!getOperatorToken()) return;
    load();
  }, [load]);

  async function refund(id: string) {
    await operatorFetch(`/v1/admin/orders/${id}/refund`, { method: "POST" });
    await load();
    toast("Order refunded");
  }

  async function exportCsv() {
    const token = getOperatorToken();
    const host =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? window.location.host
        : process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002";
    const res = await fetch(`${api}/v1/admin/orders/export`, {
      headers: { Authorization: `Bearer ${token}`, "x-forwarded-host": host },
    });
    if (!res.ok) {
      toast("Export failed", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV downloaded");
  }

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell
      title="Orders"
      description="Purchases, refunds, and payment status."
      branding={{ name: settings?.name, primary_color: settings?.branding?.primary_color }}
      actions={
        <button type="button" className="btn btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      }
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">All orders</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} order{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search email, order id, transaction…"
          hasActive={Boolean(search || status)}
          onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
        >
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="refunded">refunded</option>
            <option value="failed">failed</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Customer", "Total", "Status", "Payment", "Date", ""]}
          isEmpty={items.length === 0}
          emptyTitle="No orders"
          emptyDescription="Orders will appear here after checkout."
        >
          {items.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`/admin/players/${o.user_id}`}>
                  <strong>{o.user_name ?? o.user_email}</strong>
                </Link>
                <br />
                <span className="muted">{o.user_email}</span>
              </td>
              <td>KES {o.total.toLocaleString()}</td>
              <td><AdminStatusBadge status={o.status} /></td>
              <td><AdminStatusBadge status={o.payment_status ?? "pending"} /></td>
              <td className="muted">{new Date(o.created_at).toLocaleString()}</td>
              <td>
                <div className="admin-row-actions">
                  <Link href={`/admin/orders/${o.id}`}>View</Link>
                  {o.status === "completed" && (
                    <AdminConfirm
                      title="Refund this order?"
                      body="Tickets will be released back to the pool."
                      confirmLabel="Refund"
                      danger
                      onConfirm={() => refund(o.id)}
                    >
                      {(open) => (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
                          Refund
                        </button>
                      )}
                    </AdminConfirm>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && (
          <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />
        )}
      </div>
    </OperatorAdminShell>
  );
}
