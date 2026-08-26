"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch } from "@/lib/player-api";
import { formatDateTime, formatKes } from "@/lib/format";
import { formatOrderStatus, orderStatusClass } from "@/lib/order-status";

type OrderDetail = {
  order_id: string;
  status: string;
  total: number;
  created_at?: string;
  payment?: { status: string } | null;
  tickets: { raffle_title: string; ticket_number: number }[];
  instant_wins?: { name: string; prize_type: string; prize_value: number }[];
};

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    playerFetch<OrderDetail>(`/v1/account/orders/${id}`)
      .then(setOrder)
      .catch(() => router.replace("/account/orders"));
  }, [id, router]);

  if (!order) {
    return (
      <>
        <Link href="/account/orders" className="site-breadcrumb">← Orders</Link>
        <div className="site-skeleton" style={{ height: 160, marginTop: 16 }} />
      </>
    );
  }

  return (
    <>
      <Link href="/account/orders" className="site-breadcrumb">← Orders</Link>
      <AccountPageHeader
        title="Order details"
        description={order.created_at ? `Placed ${formatDateTime(order.created_at)}` : undefined}
      />
      <div className="site-card">
        <div className="site-order-card__row" style={{ marginBottom: 12 }}>
          <span className={`site-badge ${orderStatusClass(order.status)}`}>
            {formatOrderStatus(order.status)}
          </span>
          <strong style={{ fontSize: 20 }}>{formatKes(order.total)}</strong>
        </div>
        <p className="site-muted" style={{ marginTop: 0 }}>Order ID: {order.order_id}</p>

        {order.status === "pending" && order.payment?.status === "pending" && (
          <div className="site-banner site-banner--warning" style={{ marginBottom: 16 }}>
            Payment is still outstanding. Complete checkout to confirm your tickets.
            <div style={{ marginTop: 12 }}>
              <Link href="/checkout" className="site-btn site-btn--primary site-btn--sm">
                Complete payment
              </Link>
            </div>
          </div>
        )}

        <h2 className="site-section-title">Tickets</h2>
        {order.tickets.length === 0 ? (
          <p className="site-muted">No tickets on this order yet.</p>
        ) : (
          <ul className="site-ticket-list">
            {order.tickets.map((t, i) => (
              <li key={i} className="site-ticket-pill">
                <span>{t.raffle_title}</span>
                <strong>#{t.ticket_number}</strong>
              </li>
            ))}
          </ul>
        )}

        {order.instant_wins && order.instant_wins.length > 0 && (
          <>
            <h2 className="site-section-title">Instant wins</h2>
            <ul className="site-ticket-list">
              {order.instant_wins.map((w, i) => (
                <li key={i} className="site-ticket-pill" style={{ background: "var(--site-accent-soft)" }}>
                  <span>{w.name}</span>
                  <strong>{formatKes(w.prize_value)}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
