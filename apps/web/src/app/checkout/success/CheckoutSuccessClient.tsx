"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { notifyCartUpdated } from "@/lib/cart-events";
import { getPublicApiUrl } from "@/lib/api-config";
import { playerFetch, getTenantHost } from "@/lib/player-api";
import { formatKes } from "@/lib/format";
import { trackPurchase } from "@/components/AnalyticsScripts";
import { SitePageIntro } from "@/components/SitePageIntro";

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
      <div className="site-page--narrow">
        <SitePageIntro
          title="Order not found"
          lead="We couldn't find your order confirmation. Check your account orders or try checkout again."
        />
        <div className="site-page-actions">
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
    <div className="site-page--narrow">
      <div className="site-success-icon" aria-hidden>
        ✓
      </div>
      <SitePageIntro
        title="You're in!"
        lead="Payment successful. Good luck — your tickets are confirmed below."
      />

      <div className="site-card site-card--v2">
        <p className="site-muted">Order {orderId}</p>
        {error && <p className="site-error">{error}</p>}
        {data && (
          <>
            <p className="site-checkout-success__total">
              Total paid: <strong>{formatKes(data.total)}</strong>
            </p>
            <h2 className="site-section-title">Your tickets</h2>
            <ul className="site-ticket-list site-ticket-list--commerce">
              {data.tickets.map((t, i) => (
                <li key={i} className="site-ticket-pill">
                  <span>{t.raffle_title}</span>
                  <strong>#{t.ticket_number}</strong>
                </li>
              ))}
            </ul>
            {data.instant_wins && data.instant_wins.length > 0 && (
              <>
                <h2 className="site-section-title site-section-title--spaced">Instant wins!</h2>
                <ul className="site-ticket-list site-ticket-list--commerce">
                  {data.instant_wins.map((w, i) => (
                    <li key={i} className="site-ticket-pill site-ticket-pill--win">
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

      <div className="site-page-actions">
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
