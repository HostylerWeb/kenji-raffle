"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPlayerToken,
  getTenantHost,
  playerFetch,
} from "@/lib/player-api";
import { trackInitiateCheckout } from "@/components/AnalyticsScripts";

type CheckoutResult = {
  order_id: string;
  payment_id: string;
  total: number;
  site_credit_applied?: number;
  gateway_display_name: string;
  gateway_mode?: string;
  requires_external_payment?: boolean;
  payment_redirect_url?: string | null;
  status?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [applySiteCredit, setApplySiteCredit] = useState(true);
  const [siteCreditBalance, setSiteCreditBalance] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [analytics, setAnalytics] = useState<{
    ga4_measurement_id?: string;
    facebook_pixel_id?: string;
  } | null>(null);

  useEffect(() => {
    setLoggedIn(Boolean(getPlayerToken()));
    if (getPlayerToken()) {
      playerFetch<{ site_credit_balance: number }>("/v1/me")
        .then((me) => setSiteCreditBalance(me.site_credit_balance))
        .catch(() => undefined);
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002"}/v1/tenant/context`, {
      headers: { "x-forwarded-host": getTenantHost() },
    })
      .then((r) => r.json())
      .then((ctx) => setAnalytics(ctx.analytics ?? null))
      .catch(() => undefined);
  }, []);

  async function startCheckout(e: FormEvent) {
    e.preventDefault();
    if (!getPlayerToken()) {
      router.push("/login?next=/checkout");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await playerFetch<CheckoutResult>("/v1/checkout", {
        method: "POST",
        body: JSON.stringify({
          coupon_code: coupon || undefined,
          apply_site_credit: applySiteCredit,
        }),
      });
      if (result.status === "completed" || result.total === 0) {
        router.push(`/checkout/success?order_id=${result.order_id}`);
        return;
      }
      setCheckout(result);
      trackInitiateCheckout(analytics, result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function payMock(success: boolean) {
    if (!checkout) return;
    setLoading(true);
    setError("");
    try {
      if (success) {
        const confirmation = await playerFetch<{
          order_id: string;
          tickets: { raffle_title: string; ticket_number: number }[];
        }>("/v1/payments/harambe/complete", {
          method: "POST",
          body: JSON.stringify({ order_id: checkout.order_id }),
        });
        router.push(`/checkout/success?order_id=${confirmation.order_id}`);
      } else {
        await playerFetch("/v1/payments/harambe/fail", {
          method: "POST",
          body: JSON.stringify({ order_id: checkout.order_id }),
        });
        router.push(`/checkout/failed?order=${checkout.order_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  if (checkout) {
    const isLive = checkout.gateway_mode === "live" && checkout.requires_external_payment;
    const payUrl = checkout.payment_redirect_url;
    return (
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        <h1>{checkout.gateway_display_name}</h1>
        <div className="card">
          {checkout.site_credit_applied != null && checkout.site_credit_applied > 0 && (
            <p className="muted">
              Site credit applied: KES {checkout.site_credit_applied.toLocaleString()}
            </p>
          )}
          <p>Amount due: <strong>KES {checkout.total.toLocaleString()}</strong></p>
          {isLive ? (
            <>
              <p className="muted">
                You will be redirected to the card gateway. Your order confirms automatically when payment succeeds.
              </p>
              {payUrl ? (
                <a href={payUrl} className="btn" style={{ display: "inline-block", marginTop: 12 }}>
                  Continue to payment
                </a>
              ) : (
                <p className="muted" style={{ fontSize: 12 }}>
                  Configure HARAMBE_GATEWAY_URL on the server to enable redirect.
                </p>
              )}
              <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                Order ID: {checkout.order_id}
              </p>
            </>
          ) : (
            <>
              <p className="muted">Mock payment — choose outcome:</p>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  className="btn"
                  disabled={loading}
                  onClick={() => payMock(true)}
                >
                  Pay successfully
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading}
                  onClick={() => payMock(false)}
                >
                  Simulate failure
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Checkout</h1>
      {!loggedIn && (
        <p className="card">
          <Link href="/login?next=/checkout">Log in</Link> or{" "}
          <Link href="/register?next=/checkout">register</Link> to continue.
        </p>
      )}
      <form className="form card" onSubmit={startCheckout}>
        <label>
          Coupon code (optional)
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} />
        </label>
        {siteCreditBalance > 0 && (
          <label>
            <input
              type="checkbox"
              checked={applySiteCredit}
              onChange={(e) => setApplySiteCredit(e.target.checked)}
            />
            Apply site credit (KES {siteCreditBalance.toLocaleString()} available)
          </label>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" disabled={loading || !loggedIn}>
          Continue to payment
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href="/cart">← Back to cart</Link>
      </p>
    </main>
  );
}
