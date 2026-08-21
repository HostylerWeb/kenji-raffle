"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

type OrderDetail = {
  order_id: string;
  status: string;
  total: number;
  tickets: { raffle_title: string; ticket_number: number }[];
  instant_wins?: { name: string; prize_type: string; prize_value: number }[];
};

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login");
      return;
    }
    playerFetch<OrderDetail>(`/v1/account/orders/${id}`)
      .then(setOrder)
      .catch(() => router.replace("/account/orders"));
  }, [id, router]);

  if (!order) return <main style={{ padding: 24 }}><p className="muted">Loading…</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Order {order.order_id}</h1>
      <p><Link href="/account/orders">← Orders</Link></p>
      <div className="card">
        <p>Status: {order.status}</p>
        <p>Total: KES {order.total.toLocaleString()}</p>
        <h2>Tickets</h2>
        <ul>
          {order.tickets.map((t, i) => (
            <li key={i}>{t.raffle_title} — #{t.ticket_number}</li>
          ))}
        </ul>
        {order.instant_wins && order.instant_wins.length > 0 && (
          <>
            <h2>Instant wins</h2>
            <ul>
              {order.instant_wins.map((w, i) => (
                <li key={i}>{w.name} — KES {w.prize_value}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
