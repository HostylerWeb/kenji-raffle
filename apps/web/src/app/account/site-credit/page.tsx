"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
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

type TransactionsResponse = {
  items: Transaction[];
  page: number;
  limit: number;
  total: number;
};

const PAGE_SIZE = 50;

function formatTransactionType(type: string): string {
  if (type === "credit") return "Credit";
  if (type === "debit") return "Used at checkout";
  return type;
}

export default function SiteCreditPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const hasMore = transactions.length < total;

  const loadTransactions = useCallback(async (nextPage: number, replace: boolean) => {
    const response = await playerFetch<TransactionsResponse>(
      `/v1/account/site-credit/transactions?page=${nextPage}&limit=${PAGE_SIZE}`,
    );
    setTotal(response.total);
    setPage(response.page);
    setTransactions((prev) =>
      replace ? response.items : [...prev, ...response.items],
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      playerFetch<{ site_credit_balance: number }>("/v1/me"),
      loadTransactions(1, true),
    ])
      .then(([me]) => {
        setBalance(me.site_credit_balance);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load site credit");
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, [loadTransactions]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    loadTransactions(page + 1, false)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load more transactions");
      })
      .finally(() => setLoadingMore(false));
  }, [hasMore, loading, loadingMore, page, loadTransactions]);

  const sentinelRef = useInfiniteScroll(loadMore, {
    enabled: hasMore && !loading,
    loading: loadingMore,
  });

  return (
    <>
      <AccountPageHeader
        title="Site credit"
        description="Promotional credit from instant wins — not a cash wallet."
      />
      {error && <p className="site-error">{error}</p>}

      <div className="site-card site-card--highlight">
        <p className="site-muted" style={{ margin: 0 }}>Site credit balance</p>
        <p style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 0" }}>{formatKes(balance)}</p>
        <div className="site-credit-explainer" style={{ marginTop: 16 }}>
          <p className="site-muted" style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.6 }}>
            <strong>What this is:</strong> Site credit is promotional balance earned from instant-win
            prizes. It can only be used toward ticket purchases at checkout — it is not withdrawable cash.
          </p>
          <p className="site-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            <strong>What this is not:</strong> Cash prizes and withdrawals are handled separately under{" "}
            <Link href="/account/claims">Prize claims</Link>. There is no separate cash wallet on your account.
          </p>
        </div>
      </div>

      <h2 className="site-section-title site-account-section">Transaction history</h2>
      {loading ? (
        <div className="site-skeleton" style={{ height: 100 }} />
      ) : transactions.length === 0 && !error ? (
        <div className="site-empty site-card">
          <p className="site-empty__title">No transactions yet</p>
          <p className="site-muted">Credits from instant wins will appear here when awarded or used.</p>
        </div>
      ) : (
        <>
          {transactions.length > 0 && (
            <p className="site-muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
              Showing {transactions.length} of {total} transaction{total === 1 ? "" : "s"}
            </p>
          )}
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
                    <td>{formatTransactionType(t.type)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {t.type === "credit" ? "+" : "−"}
                      {formatKes(t.amount)}
                    </td>
                    <td>
                      {t.order_id ? (
                        <>
                          {t.note ?? "Order"}{" "}
                          <Link href={`/account/orders/${t.order_id}`}>View order</Link>
                        </>
                      ) : (
                        t.note ?? "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="site-load-more">
              {loadingMore ? "Loading more transactions…" : "Scroll for more"}
            </div>
          )}
        </>
      )}
    </>
  );
}
