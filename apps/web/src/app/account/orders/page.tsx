"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { SiteTabs } from "@/components/SiteTabs";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { playerFetch } from "@/lib/player-api";
import { formatDateTime, formatKes } from "@/lib/format";
import { formatOrderStatus, orderStatusClass } from "@/lib/order-status";
import {
  ORDER_TABS,
  type OrderTabId,
  orderTabStatusParam,
} from "@/lib/order-tabs";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

type OrdersResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  counts: {
    all: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
};

const PAGE_SIZE = 50;

export default function AccountOrdersPage() {
  const [tab, setTab] = useState<OrderTabId>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<OrdersResponse["counts"] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const hasMore = orders.length < total;

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      const status = orderTabStatusParam(tab);
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      });
      if (status) params.set("status", status);

      const response = await playerFetch<OrdersResponse>(
        `/v1/account/orders?${params.toString()}`,
      );

      setCounts(response.counts);
      setTotal(response.total);
      setPage(response.page);
      setOrders((prev) =>
        replace ? response.items : [...prev, ...response.items],
      );
    },
    [tab],
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    setOrders([]);
    setPage(1);
    loadPage(1, true)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [tab, loadPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    loadPage(page + 1, false)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load more orders");
      })
      .finally(() => setLoadingMore(false));
  }, [hasMore, loadPage, loading, loadingMore, page]);

  const sentinelRef = useInfiniteScroll(loadMore, {
    enabled: hasMore && !loading,
    loading: loadingMore,
  });

  const tabs = useMemo(
    () =>
      ORDER_TABS.map((t) => ({
        id: t.id,
        label: t.label,
        count: counts
          ? counts[t.id as keyof OrdersResponse["counts"]]
          : undefined,
      })),
    [counts],
  );

  return (
    <>
      <AccountPageHeader
        title="Orders"
        description="Your purchase history and payment status."
      />

      <SiteTabs
        tabs={tabs}
        active={tab}
        onChange={(id) => setTab(id as OrderTabId)}
        ariaLabel="Order status"
      />

      {error && <p className="site-error">{error}</p>}

      {loading ? (
        <div className="site-skeleton" style={{ height: 120 }} />
      ) : orders.length === 0 ? (
        <div className="site-empty site-card">
          <p className="site-empty__title">No orders in this category</p>
          <p className="site-muted">
            {tab === "all"
              ? "When you purchase tickets, your orders will appear here."
              : "Try another tab to see your orders."}
          </p>
          {tab === "all" && (
            <Link href="/raffles" className="site-btn site-btn--primary site-btn--sm" style={{ marginTop: 12 }}>
              Browse raffles
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="site-muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
            Showing {orders.length} of {total} order{total === 1 ? "" : "s"}
          </p>
          <div className="site-card site-table-wrap site-account-section site-account-section--desktop-only">
            <table className="site-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{formatDateTime(o.created_at)}</td>
                    <td>
                      <span className={`site-badge ${orderStatusClass(o.status)}`}>
                        {formatOrderStatus(o.status)}
                      </span>
                    </td>
                    <td>{formatKes(o.total)}</td>
                    <td><Link href={`/account/orders/${o.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="site-order-list site-account-section site-account-section--mobile-only">
            {orders.map((o) => (
              <Link key={o.id} href={`/account/orders/${o.id}`} className="site-order-card">
                <div className="site-order-card__row">
                  <strong>{formatKes(o.total)}</strong>
                  <span className={`site-badge ${orderStatusClass(o.status)}`}>
                    {formatOrderStatus(o.status)}
                  </span>
                </div>
                <p className="site-order-card__meta" style={{ margin: 0 }}>
                  {formatDateTime(o.created_at)}
                </p>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="site-load-more">
              {loadingMore ? "Loading more orders…" : "Scroll for more"}
            </div>
          )}
        </>
      )}
    </>
  );
}
