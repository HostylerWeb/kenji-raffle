"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Order = {
  id: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
  payment_status?: string;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Order[]>("/v1/admin/orders").then(setOrders);
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || o.user_email.toLowerCase().includes(q) || o.id.includes(q);
      const matchesStatus = !status || o.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  async function refund(id: string) {
    await operatorFetch(`/v1/admin/orders/${id}/refund`, { method: "POST" });
    setOrders(await operatorFetch<Order[]>("/v1/admin/orders"));
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
      headers: {
        Authorization: `Bearer ${token}`,
        "x-forwarded-host": host,
      },
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

  return (
    <OperatorAdminShell
      title="Orders"
      description="Purchases, refunds, and payment status."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
      actions={
        <button type="button" className="btn btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      }
    >
      <div className="admin-panel">
        <AdminFilters
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search email or order id…"
          hasActive={Boolean(search || status)}
          onClear={() => {
            setSearch("");
            setStatus("");
          }}
        >
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="refunded">refunded</option>
            <option value="failed">failed</option>
          </select>
        </AdminFilters>
        <AdminTable
          columns={["Customer", "Total", "Status", "Payment", "Date", ""]}
          isEmpty={filtered.length === 0}
          emptyTitle="No orders"
          emptyDescription="Orders will appear here after checkout."
        >
          {filtered.map((o) => (
            <tr key={o.id} id={`order-${o.id}`}>
              <td>{o.user_email}</td>
              <td>KES {o.total.toLocaleString()}</td>
              <td>
                <AdminStatusBadge status={o.status} />
              </td>
              <td>
                <AdminStatusBadge status={o.payment_status ?? "pending"} />
              </td>
              <td className="muted">{new Date(o.created_at).toLocaleString()}</td>
              <td>
                {o.status === "completed" && (
                  <AdminConfirm
                    title="Refund this order?"
                    body="Tickets will be released back to the pool."
                    confirmLabel="Refund"
                    danger
                    onConfirm={() => refund(o.id)}
                  >
                    {(open) => (
                      <button type="button" className="btn btn-secondary" onClick={open}>
                        Refund
                      </button>
                    )}
                  </AdminConfirm>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
