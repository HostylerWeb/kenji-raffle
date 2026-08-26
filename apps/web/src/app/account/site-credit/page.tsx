"use client";

import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch } from "@/lib/player-api";
import { formatDateTime, formatKes } from "@/lib/format";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  order_id: string | null;
  created_at: string;
};

export default function SiteCreditPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      playerFetch<{ site_credit_balance: number }>("/v1/me"),
      playerFetch<{ items: Transaction[] }>("/v1/account/site-credit/transactions"),
    ])
      .then(([me, tx]) => {
        setBalance(me.site_credit_balance);
        setTransactions(tx.items);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load site credit");
        setTransactions([]);
      });
  }, []);

  return (
    <>
      <AccountPageHeader
        title="Site credit"
        description="Your instant-win credit balance and transaction history."
      />
      {error && <p className="site-error">{error}</p>}
      <div className="site-card site-card--highlight">
        <p className="site-muted" style={{ margin: 0 }}>Current balance</p>
        <p style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 0" }}>{formatKes(balance)}</p>
        <p className="site-muted" style={{ margin: "12px 0 0", fontSize: 13 }}>
          Instant win credits are applied automatically at checkout.
        </p>
      </div>

      <h2 className="site-section-title site-account-section">Transaction history</h2>
      {!transactions ? (
        <div className="site-skeleton" style={{ height: 100 }} />
      ) : transactions.length === 0 && !error ? (
        <div className="site-empty site-card">
          <p className="site-empty__title">No transactions yet</p>
          <p className="site-muted">Credits from instant wins will appear here.</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="site-card site-table-wrap">
          <table className="site-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="site-muted">{formatDateTime(t.created_at)}</td>
                  <td>{t.type}</td>
                  <td style={{ fontWeight: 600 }}>
                    {t.type === "credit" ? "+" : "−"}
                    {formatKes(t.amount)}
                  </td>
                  <td>{t.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
