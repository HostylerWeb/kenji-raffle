"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { notifyCartUpdated } from "@/lib/cart-events";
import { getPublicApiUrl } from "@/lib/api-config";
import { playerFetch, getTenantHost } from "@/lib/player-api";
import { formatKes } from "@/lib/format";
import { trackPurchase } from "@/components/AnalyticsScripts";

type Confirmation = {
  order_id: string;
  total: number;
  tickets: { raffle_title: string; ticket_number: number }[];
  instant_wins?: { name: string; prize_type: string; prize_value: number }[];
};

export default function CheckoutSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("order_id") ?? params.get("order");
  const [data, setData] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    notifyCartUpdated();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let analytics: { ga4_measurement_id?: string; facebook_pixel_id?: string } | null = null;
    fetch(`${getPublicApiUrl()}/v1/tenant/context`, {
      headers: {
        "x-forwarded-host": getTenantHost(),
      },
    })
      .then((r) => r.json())
      .then((ctx) => {
        analytics = ctx.analytics ?? null;
        return playerFetch<Confirmation>(`/v1/account/orders/${orderId}`);
      })
      .then((confirmation) => {
        setData(confirmation);
        trackPurchase(analytics, {
          order_id: confirmation.order_id,
          total: confirmation.total,
        });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load order"),
      );
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="site-container site-container--narrow">
        <h1 className="site-page-title">Order not found</h1>
        <p className="site-lead" style={{ marginBottom: 24 }}>
          We couldn&apos;t find your order confirmation. Check your account orders or try checkout again.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/account/orders" className="site-btn site-btn--primary">
            View my orders
          </Link>
          <Link href="/cart" className="site-btn site-btn--secondary">
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container site-container--narrow">
      <div className="site-success-icon" aria-hidden>✓</div>
      <h1 className="site-page-title">You&apos;re in!</h1>
      <p className="site-lead" style={{ marginBottom: 24 }}>
        Payment successful. Good luck — your tickets are confirmed below.
      </p>

      <div className="site-card">
        <p className="site-muted">Order {orderId}</p>
        {error && <p className="site-error">{error}</p>}
        {data && (
          <>
            <p style={{ fontSize: 18, fontWeight: 700, marginTop: 0 }}>
              Total paid: {formatKes(data.total)}
            </p>
            <h2 className="site-section-title">Your tickets</h2>
            <ul className="site-ticket-list">
              {data.tickets.map((t, i) => (
                <li key={i} className="site-ticket-pill">
                  <span>{t.raffle_title}</span>
                  <strong>#{t.ticket_number}</strong>
                </li>
              ))}
            </ul>
            {data.instant_wins && data.instant_wins.length > 0 && (
              <>
                <h2 className="site-section-title" style={{ marginTop: 24 }}>
                  Instant wins!
                </h2>
                <ul className="site-ticket-list">
                  {data.instant_wins.map((w, i) => (
                    <li key={i} className="site-ticket-pill" style={{ background: "var(--site-accent-soft)" }}>
                      <span>{w.name}</span>
                      <strong>{formatKes(w.prize_value)}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link href="/account/tickets" className="site-btn site-btn--primary">
          View my tickets
        </Link>
        {data?.instant_wins && data.instant_wins.length > 0 && (
          <Link href="/account/wins" className="site-btn site-btn--secondary">
            View my wins
          </Link>
        )}
        <Link href="/raffles" className="site-btn site-btn--secondary">
          Browse more raffles
        </Link>
      </div>
    </div>
  );
}
