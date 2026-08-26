"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Cart } from "@/lib/cart-types";
import {
  CheckoutBillingDetails,
  isBillingComplete,
  joinFullName,
  splitFullName,
  type BillingDetails,
} from "@/components/CheckoutBillingDetails";
import { CheckoutGuestGate } from "@/components/CheckoutGuestGate";
import { CheckoutOrderSummary } from "@/components/CheckoutOrderSummary";
import { CheckoutPaymentStep } from "@/components/CheckoutPaymentStep";
import { ReservationCountdown } from "@/components/ReservationCountdown";
import { trackInitiateCheckout } from "@/components/AnalyticsScripts";
import { notifyCartUpdated } from "@/lib/cart-events";
import { getPublicApiUrl } from "@/lib/api-config";
import { formatKes } from "@/lib/format";
import { friendlyPlayerError } from "@/lib/player-errors";
import {
  clearPlayerSession,
  getPlayerToken,
  getTenantHost,
  playerFetch,
} from "@/lib/player-api";

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

type PlayerProfile = {
  email: string;
  phone: string | null;
  full_name: string | null;
  county: string | null;
  site_credit_balance: number;
};

type ShippingAddress = {
  address_line: string | null;
  town: string | null;
  county: string | null;
  postal_code: string | null;
  is_default: boolean;
};

type PendingOrderSummary = {
  order_id: string;
  total: number;
};

type OrderListItem = {
  id: string;
  status: string;
  total: number;
};

function buildBillingFromProfile(
  profile: PlayerProfile,
  addresses: ShippingAddress[],
): BillingDetails {
  const { firstName, lastName } = splitFullName(profile.full_name);
  const defaultAddr =
    addresses.find((a) => a.is_default) ?? addresses[0] ?? null;

  return {
    firstName,
    lastName,
    email: profile.email,
    phone: profile.phone ?? "",
    addressLine: defaultAddr?.address_line ?? "",
    town: defaultAddr?.town ?? "",
    county: defaultAddr?.county ?? profile.county ?? "",
    postalCode: defaultAddr?.postal_code ?? "",
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [applySiteCredit, setApplySiteCredit] = useState(true);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [billing, setBilling] = useState<BillingDetails | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrderSummary | null>(null);
  const [analytics, setAnalytics] = useState<{
    ga4_measurement_id?: string;
    facebook_pixel_id?: string;
  } | null>(null);

  const billingReady = useMemo(
    () => (billing ? isBillingComplete(billing) : false),
    [billing],
  );

  const loadAuthenticatedData = useCallback(async () => {
    const [c, me, orders, addresses] = await Promise.all([
      playerFetch<Cart>("/v1/cart"),
      playerFetch<PlayerProfile>("/v1/me"),
      playerFetch<{ items: OrderListItem[] }>("/v1/account/orders"),
      playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses"),
    ]);
    setCart(c);
    setProfile(me);
    setBilling(buildBillingFromProfile(me, addresses));
    const pending = orders.items.find((o) => o.status === "pending") ?? null;
    setPendingOrder(
      pending ? { order_id: pending.id, total: pending.total } : null,
    );
    if (c.items.length === 0 && !pending) {
      router.replace("/cart");
    }
  }, [router]);

  useEffect(() => {
    const token = Boolean(getPlayerToken());
    setLoggedIn(token);
    setCartLoading(true);
    if (token) setProfileLoading(true);

    playerFetch<Cart>("/v1/cart")
      .then((c) => {
        setCart(c);
        if (c.items.length === 0 && !token) {
          router.replace("/cart");
          return;
        }
        if (token) {
          return loadAuthenticatedData().catch(() => {
            clearPlayerSession();
            setLoggedIn(false);
          });
        }
      })
      .catch(() => setCart({ items: [], subtotal: 0, expires_at: null }))
      .finally(() => {
        setCartLoading(false);
        setProfileLoading(false);
      });

    fetch(`${getPublicApiUrl()}/v1/tenant/context`, {
      headers: { "x-forwarded-host": getTenantHost() },
    })
      .then((r) => r.json())
      .then((ctx) => setAnalytics(ctx.analytics ?? null))
      .catch(() => undefined);
  }, [router, loadAuthenticatedData]);

  const handleAuthSuccess = useCallback(async () => {
    setLoggedIn(true);
    setProfileLoading(true);
    setError("");
    notifyCartUpdated();
    try {
      await loadAuthenticatedData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load checkout");
      setLoggedIn(false);
      clearPlayerSession();
    } finally {
      setProfileLoading(false);
    }
  }, [loadAuthenticatedData]);

  async function resumePendingPayment() {
    if (!pendingOrder) return;
    setLoading(true);
    setError("");
    try {
      const paymentStep = await playerFetch<CheckoutResult>("/v1/checkout/resume", {
        method: "POST",
        body: JSON.stringify({ order_id: pendingOrder.order_id }),
      });
      setCheckout(paymentStep);
      notifyCartUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pending order");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(e: FormEvent) {
    e.preventDefault();
    if (!getPlayerToken() || !billing || !billingReady) {
      return;
    }
    if (pendingOrder) {
      setError("Complete your pending payment before starting a new checkout.");
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
          full_name: joinFullName(billing.firstName, billing.lastName),
          phone: billing.phone.trim(),
          county: billing.county,
          address_line: billing.addressLine.trim(),
          town: billing.town.trim(),
          postal_code: billing.postalCode.trim() || undefined,
        }),
      });
      notifyCartUpdated();
      setCart({ items: [], subtotal: 0, expires_at: null });
      if (result.status === "completed" || result.total === 0) {
        router.push(`/checkout/success?order_id=${result.order_id}`);
        return;
      }
      setCheckout(result);
      trackInitiateCheckout(analytics, result.total);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Checkout failed";
      setError(friendlyPlayerError(raw));
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
        const confirmation = await playerFetch<{ order_id: string }>(
          "/v1/payments/harambe/complete",
          {
            method: "POST",
            body: JSON.stringify({ order_id: checkout.order_id }),
          },
        );
        notifyCartUpdated();
        router.push(`/checkout/success?order_id=${confirmation.order_id}`);
      } else {
        await playerFetch("/v1/payments/harambe/fail", {
          method: "POST",
          body: JSON.stringify({ order_id: checkout.order_id }),
        });
        notifyCartUpdated();
        router.push(`/checkout/failed?order=${checkout.order_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  if (checkout) {
    return (
      <CheckoutPaymentStep
        checkout={checkout}
        loading={loading}
        error={error}
        onMockPay={payMock}
      />
    );
  }

  return (
    <div className="site-checkout-grid">
      <div>
        <h1 className="site-page-title">Checkout</h1>
        {cart?.expires_at && !pendingOrder && (
          <ReservationCountdown expiresAt={cart.expires_at} className="site-reservation-countdown" />
        )}

        {loggedIn && pendingOrder && (
          <div className="site-card site-card--highlight" style={{ marginBottom: 20 }}>
            <h2 className="site-section-title">Pending payment</h2>
            <p className="site-muted" style={{ marginTop: 0 }}>
              You have an unpaid order for {formatKes(pendingOrder.total)}. Complete payment below, or wait for it to expire (about 60 minutes) before starting a new checkout.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="site-btn site-btn--primary"
                disabled={loading}
                onClick={resumePendingPayment}
              >
                Complete pending payment
              </button>
              <Link href={`/account/orders/${pendingOrder.order_id}`} className="site-btn site-btn--secondary">
                View order
              </Link>
            </div>
          </div>
        )}

        {!loggedIn ? (
          cart && cart.items.length > 0 ? (
            <CheckoutGuestGate cart={cart} onAuthenticated={handleAuthSuccess} />
          ) : cartLoading ? (
            <div className="site-card">
              <div className="site-skeleton" style={{ height: 280 }} />
            </div>
          ) : null
        ) : profileLoading && !pendingOrder ? (
          <div className="site-card" style={{ marginBottom: 20 }}>
            <div className="site-skeleton" style={{ height: 520 }} />
          </div>
        ) : (
          <>
            {!pendingOrder && billing && (
              <CheckoutBillingDetails
                billing={billing}
                onChange={setBilling}
                loading={false}
              />
            )}
            {!pendingOrder && billing && (
              <form className="site-form site-card" onSubmit={startCheckout}>
                <h2 className="site-section-title" style={{ marginTop: 0 }}>
                  Payment options
                </h2>
                <label>
                  Coupon code (optional)
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    autoComplete="off"
                  />
                </label>
                {(profile?.site_credit_balance ?? 0) > 0 && (
                  <label className="site-checkbox">
                    <input
                      type="checkbox"
                      checked={applySiteCredit}
                      onChange={(e) => setApplySiteCredit(e.target.checked)}
                    />
                    <span>
                      Apply site credit ({formatKes(profile?.site_credit_balance ?? 0)} available)
                    </span>
                  </label>
                )}
                {error && (
                  <p className="site-error" role="alert">
                    {error}
                    {error.includes("verify your email") && (
                      <>
                        {" "}
                        <Link href="/verify-email">Resend verification</Link>
                      </>
                    )}
                  </p>
                )}
                {!billingReady && (
                  <p className="site-muted" style={{ marginBottom: 0, fontSize: 13 }}>
                    Complete all required billing fields above to continue.
                  </p>
                )}
                <button
                  type="submit"
                  className="site-btn site-btn--primary site-btn--lg"
                  disabled={loading || !loggedIn || !billingReady}
                >
                  {loading ? "Processing…" : "Continue to payment"}
                </button>
              </form>
            )}
            {pendingOrder && error && (
              <p className="site-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
        <p style={{ marginTop: 16 }}>
          <Link href="/cart">← Back to cart</Link>
        </p>
      </div>

      <aside className="site-order-summary">
        <CheckoutOrderSummary cart={cart} loading={cartLoading} />
      </aside>
    </div>
  );
}
