"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { IconChart, IconCreditCard, IconTicket } from "@/components/admin/AdminIcons";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Ggr = {
  gross_revenue: number;
  operator_share: number;
  operator_net: number;
  gateway_fee_total: number;
  tax_collected: number;
  completed_orders: number;
  tickets_sold: number;
};

type TaxSummary = {
  total_tax_collected: number;
  total_gross: number;
  by_rate: { tax_rate: number; tax_amount: number; gross: number; payment_count: number }[];
};

type RaffleSales = {
  raffle_id: string;
  title: string;
  slug: string;
  tickets: number;
  revenue: number;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [ggr, setGgr] = useState<Ggr | null>(null);
  const [tax, setTax] = useState<TaxSummary | null>(null);
  const [sales, setSales] = useState<RaffleSales[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadReports = useCallback(() => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const q = params.toString() ? `?${params.toString()}` : "";
    Promise.all([
      operatorFetch<Ggr>(`/v1/admin/reports/ggr${q}`),
      operatorFetch<TaxSummary>(`/v1/admin/reports/tax${q}`),
      operatorFetch<RaffleSales[]>(`/v1/admin/reports/sales-by-raffle${q}`),
    ]).then(([g, t, s]) => {
      setGgr(g);
      setTax(t);
      setSales(s);
    });
  }, [from, to]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    loadReports();
  }, [router, loadReports]);

  function applyRange(e: FormEvent) {
    e.preventDefault();
    loadReports();
  }

  function exportCsv() {
    if (!ggr) return;
    const lines = [
      "Report,KES",
      `Gross revenue,${ggr.gross_revenue}`,
      `Operator share,${ggr.operator_share}`,
      `Operator net,${ggr.operator_net}`,
      `Gateway fees,${ggr.gateway_fee_total}`,
      `Tax collected,${ggr.tax_collected}`,
      `Tickets sold,${ggr.tickets_sold}`,
      "",
      "Raffle,Tickets,Revenue",
      ...sales.map((r) => `"${r.title.replace(/"/g, '""')}",${r.tickets},${r.revenue}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OperatorAdminShell
      title="Reports"
      description="GGR, tax, and sales by raffle."
      actions={
        ggr ? (
          <button type="button" className="btn btn-secondary" onClick={exportCsv}>
            Export CSV
          </button>
        ) : undefined
      }
    >
      <form className="admin-panel" onSubmit={applyRange}>
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Date range</h3>
            <p className="admin-panel__subtitle">Filter reports by period.</p>
          </div>
        </div>
        <AdminFilters hasActive={Boolean(from || to)} onClear={() => { setFrom(""); setTo(""); }}>
          <label>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-secondary">
            Apply range
          </button>
        </AdminFilters>
      </form>
      {ggr && (
        <div className="admin-stat-grid">
          <AdminStatCard label="Gross revenue" value={`KES ${ggr.gross_revenue.toLocaleString()}`} icon={<IconCreditCard />} tone="accent" />
          <AdminStatCard label="Operator net" value={`KES ${ggr.operator_net.toLocaleString()}`} icon={<IconChart />} tone="success" />
          <AdminStatCard label="Gateway fees" value={`KES ${ggr.gateway_fee_total.toLocaleString()}`} icon={<IconCreditCard />} />
          <AdminStatCard label="Tax collected" value={`KES ${ggr.tax_collected.toLocaleString()}`} icon={<IconCreditCard />} />
          <AdminStatCard label="Tickets sold" value={ggr.tickets_sold} icon={<IconTicket />} />
        </div>
      )}
      {tax && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">Tax summary</h3>
              <p className="admin-panel__subtitle">
                Total tax: KES {tax.total_tax_collected.toLocaleString()}
              </p>
            </div>
          </div>
          <AdminTable
            columns={["Rate", "Tax", "Gross", "Payments"]}
            isEmpty={tax.by_rate.length === 0}
            emptyTitle="No tax rows"
          >
            {tax.by_rate.map((row) => (
              <tr key={row.tax_rate}>
                <td>{row.tax_rate}%</td>
                <td>KES {row.tax_amount.toLocaleString()}</td>
                <td>KES {row.gross.toLocaleString()}</td>
                <td>{row.payment_count}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}
      <div className="admin-panel">
        <div className="admin-panel__header">
          <h3 className="admin-panel__title">Sales by raffle</h3>
        </div>
        <AdminTable
          columns={["Raffle", "Tickets", "Revenue"]}
          isEmpty={sales.length === 0}
          emptyTitle="No raffle sales in this range"
        >
          {sales.map((r) => (
            <tr key={r.raffle_id}>
              <td>
                <Link href={`/admin/raffles/${r.raffle_id}`}>
                  <strong>{r.title}</strong>
                </Link>
              </td>
              <td>{r.tickets}</td>
              <td>KES {r.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
