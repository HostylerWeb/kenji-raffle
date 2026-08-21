"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/orders");
      return;
    }
    playerFetch<{ items: Order[] }>("/v1/account/orders")
      .then((r) => setOrders(r.items))
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Orders</h1>
      <p><Link href="/account">← Account</Link></p>
      {orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <table className="table" style={{ width: "100%", marginTop: 16 }}>
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
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>{o.status}</td>
                <td>KES {o.total.toLocaleString()}</td>
                <td><Link href={`/account/orders/${o.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
