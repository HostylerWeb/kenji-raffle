"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch } from "@/lib/player-api";
import { formatDateTime, formatKes } from "@/lib/format";
import { formatOrderStatus, orderStatusClass } from "@/lib/order-status";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    playerFetch<{ items: Order[] }>("/v1/account/orders")
      .then((r) => setOrders(r.items))
      .catch(() => setOrders([]));
  }, []);

  return (
    <>
      <AccountPageHeader
        title="Orders"
        description="Your purchase history and payment status."
      />
      {!orders ? (
        <div className="site-skeleton" style={{ height: 120 }} />
      ) : orders.length === 0 ? (
        <div className="site-empty site-card">
          <p className="site-empty__title">No orders yet</p>
          <p className="site-muted">When you purchase tickets, your orders will appear here.</p>
          <Link href="/raffles" className="site-btn site-btn--primary site-btn--sm" style={{ marginTop: 12 }}>
            Browse raffles
          </Link>
        </div>
      ) : (
        <>
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
        </>
      )}
    </>
  );
}
