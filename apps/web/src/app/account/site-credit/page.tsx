"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  order_id: string | null;
  created_at: string;
};

type ListResponse = {
  items: Transaction[];
  total: number;
};

type Me = {
  site_credit_balance: number;
};

export default function SiteCreditPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/site-credit");
      return;
    }
    Promise.all([
      playerFetch<Me>("/v1/me"),
      playerFetch<ListResponse>("/v1/account/site-credit/transactions"),
    ]).then(([me, tx]) => {
      setBalance(me.site_credit_balance);
      setTransactions(tx.items);
    });
  }, [router]);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
      <p><Link href="/account">← Account</Link></p>
      <h1>Site credit</h1>
      <div className="card">
        <p className="muted">Current balance</p>
        <p style={{ fontSize: 28, fontWeight: 700 }}>
          KES {balance.toLocaleString()}
        </p>
      </div>

      <h2 style={{ marginTop: 24 }}>Transaction history</h2>
      {transactions.length === 0 && (
        <p className="muted">No transactions yet.</p>
      )}
      <table className="table" style={{ width: "100%" }}>
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
              <td className="muted">
                {new Date(t.created_at).toLocaleString()}
              </td>
              <td>{t.type}</td>
              <td>
                {t.type === "credit" ? "+" : "−"}KES{" "}
                {t.amount.toLocaleString()}
              </td>
              <td>{t.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
