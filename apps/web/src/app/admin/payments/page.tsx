"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { IconCreditCard } from "@/components/admin/AdminIcons";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Payment = {
  id: string;
  order_id: string;
  user_email: string;
  amount: number;
  operator_amount: number;
  operator_net: number;
  gateway_fee_amount: number;
  tax_amount: number;
  status: string;
  payment_method: string | null;
  gateway_mode: string;
  transaction_id: string | null;
  gateway_transaction_id: string | null;
  created_at: string;
  order_status: string;
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Payment[]>("/v1/admin/payments").then(setPayments);
  }, [router]);

  const completed = payments.filter((p) => p.status === "completed");
  const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);
  const operatorNet = completed.reduce((s, p) => s + p.operator_net, 0);
  const gatewayFees = completed.reduce((s, p) => s + p.gateway_fee_amount, 0);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(
      (p) => !q || p.user_email.toLowerCase().includes(q) || (p.transaction_id ?? "").toLowerCase().includes(q),
    );
  }, [payments, search]);

  return (
    <OperatorAdminShell title="Payments" description="Completed collections, tax, and operator share.">
      <div className="admin-stat-grid">
        <AdminStatCard label="Completed payments" value={completed.length} icon={<IconCreditCard />} />
        <AdminStatCard
          label="Gross collected"
          value={`KES ${totalRevenue.toLocaleString()}`}
          icon={<IconCreditCard />}
          tone="accent"
        />
        <AdminStatCard
          label="Operator net"
          value={`KES ${operatorNet.toLocaleString()}`}
          icon={<IconCreditCard />}
          tone="success"
        />
        <AdminStatCard
          label="Gateway fees"
          value={`KES ${gatewayFees.toLocaleString()}`}
          icon={<IconCreditCard />}
        />
      </div>
      <div className="admin-panel">
        <AdminFilters search={search} onSearch={setSearch} searchPlaceholder="Search email or transaction…" />
        <AdminTable
          columns={["Customer", "Gross", "Operator net", "Gateway fee", "Tax", "Status", "Mode", "Order", "Date"]}
          isEmpty={filtered.length === 0}
          emptyTitle="No payments"
        >
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.user_email}</td>
              <td>KES {p.amount.toLocaleString()}</td>
              <td>KES {p.operator_net.toLocaleString()}</td>
              <td>KES {p.gateway_fee_amount.toLocaleString()}</td>
              <td>KES {p.tax_amount.toLocaleString()}</td>
              <td>
                <AdminStatusBadge status={p.status} />
              </td>
              <td>{p.gateway_mode}</td>
              <td>
                <Link href={`/admin/orders#order-${p.order_id}`}>{p.order_status}</Link>
              </td>
              <td className="muted">{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
