"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { IconCreditCard } from "@/components/admin/AdminIcons";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  user_email: string;
  amount: number;
  operator_net: number;
  gateway_fee_amount: number;
  tax_amount: number;
  status: string;
  gateway_mode: string;
  transaction_id: string | null;
  created_at: string;
  order_status: string;
};

type PaymentsResponse = {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  summary: {
    completed_count: number;
    gross: number;
    operator_net: number;
    gateway_fees: number;
    tax_collected: number;
  };
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    setData(await operatorFetch<PaymentsResponse>(`/v1/admin/payments?${params.toString()}`));
  }, [page, search]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, load]);

  const items = data?.items ?? [];
  const summary = data?.summary;

  return (
    <OperatorAdminShell title="Payments" description="Completed collections, tax, and operator share.">
      <div className="admin-stat-grid">
        <AdminStatCard
          label="Completed payments"
          value={summary?.completed_count ?? "—"}
          icon={<IconCreditCard />}
        />
        <AdminStatCard
          label="Gross collected"
          value={summary ? `KES ${summary.gross.toLocaleString()}` : "—"}
          icon={<IconCreditCard />}
          tone="accent"
        />
        <AdminStatCard
          label="Operator net"
          value={summary ? `KES ${summary.operator_net.toLocaleString()}` : "—"}
          icon={<IconCreditCard />}
          tone="success"
        />
        <AdminStatCard
          label="Gateway fees"
          value={summary ? `KES ${summary.gateway_fees.toLocaleString()}` : "—"}
          icon={<IconCreditCard />}
        />
      </div>
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Payment ledger</h3>
            <p className="admin-panel__subtitle">
              {data?.total ?? 0} payment{(data?.total ?? 0) === 1 ? "" : "s"} total
              {search ? " (filtered)" : ""}
              {summary && summary.tax_collected > 0 && (
                <span className="muted"> · Tax KES {summary.tax_collected.toLocaleString()}</span>
              )}
            </p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search email or transaction…"
          hasActive={Boolean(search)}
          onClear={() => { setSearch(""); setPage(1); }}
        >
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Customer", "Gross", "Operator net", "Gateway fee", "Tax", "Status", "Mode", "Order", "Date"]}
          isEmpty={items.length === 0}
          emptyTitle="No payments"
        >
          {items.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/players/${p.user_id}`}>{p.user_email}</Link>
              </td>
              <td>KES {p.amount.toLocaleString()}</td>
              <td>KES {p.operator_net.toLocaleString()}</td>
              <td>KES {p.gateway_fee_amount.toLocaleString()}</td>
              <td>KES {p.tax_amount.toLocaleString()}</td>
              <td><AdminStatusBadge status={p.status} /></td>
              <td>{p.gateway_mode}</td>
              <td>
                <Link href={`/admin/orders/${p.order_id}`}>{p.order_status}</Link>
              </td>
              <td className="muted">{new Date(p.created_at).toLocaleString()}</td>
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
