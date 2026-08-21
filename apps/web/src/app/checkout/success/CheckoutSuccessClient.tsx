"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { playerFetch } from "@/lib/player-api";
import { trackPurchase } from "@/components/AnalyticsScripts";

type Confirmation = {
  order_id: string;
  total: number;
  tickets: { raffle_title: string; ticket_number: number }[];
  instant_wins?: { name: string; prize_type: string; prize_value: number }[];
};

type TenantContext = {
  analytics?: { ga4_measurement_id?: string; facebook_pixel_id?: string } | null;
};

export default function CheckoutSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("order_id") ?? params.get("order");
  const [data, setData] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const [tenant, setTenant] = useState<TenantContext | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002"}/v1/tenant/context`, {
      headers: {
        "x-forwarded-host":
          typeof window !== "undefined"
            ? window.location.host
            : process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local",
      },
    })
      .then((r) => r.json())
      .then(setTenant)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    playerFetch<Confirmation>(`/v1/account/orders/${orderId}`)
      .then((confirmation) => {
        setData(confirmation);
        trackPurchase(tenant?.analytics ?? null, {
          order_id: confirmation.order_id,
          total: confirmation.total,
        });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load order"),
      );
  }, [orderId, tenant]);

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Payment successful</h1>
      <div className="card">
        <p>Thank you! Your order is confirmed.</p>
        {orderId && <p className="muted">Order ID: {orderId}</p>}
        {error && <p className="error">{error}</p>}
        {data && (
          <>
            <p>Total: KES {data.total.toLocaleString()}</p>
            <h2 style={{ marginTop: 16 }}>Your tickets</h2>
            <ul>
              {data.tickets.map((t, i) => (
                <li key={i}>
                  {t.raffle_title} — #{t.ticket_number}
                </li>
              ))}
            </ul>
            {data.instant_wins && data.instant_wins.length > 0 && (
              <>
                <h2 style={{ marginTop: 16 }}>Instant wins!</h2>
                <ul>
                  {data.instant_wins.map((w, i) => (
                    <li key={i}>
                      {w.name} ({w.prize_type}) — KES {w.prize_value}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
      <p style={{ marginTop: 16 }}>
        <Link href="/account/orders">View all orders</Link>
        {" · "}
        <Link href="/raffles">Browse more raffles</Link>
      </p>
    </main>
  );
}
