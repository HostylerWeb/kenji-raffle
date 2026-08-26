"use client";

import { formatKes } from "@/lib/format";

export type CheckoutPaymentData = {
  order_id: string;
  total: number;
  site_credit_applied?: number;
  gateway_display_name: string;
  gateway_mode?: string;
  requires_external_payment?: boolean;
  payment_redirect_url?: string | null;
};

type CheckoutPaymentStepProps = {
  checkout: CheckoutPaymentData;
  loading: boolean;
  error: string;
  onMockPay: (success: boolean) => void;
};

export function CheckoutPaymentStep({
  checkout,
  loading,
  error,
  onMockPay,
}: CheckoutPaymentStepProps) {
  const isLive =
    checkout.gateway_mode === "live" && checkout.requires_external_payment;
  const payUrl = checkout.payment_redirect_url;

  return (
    <div className="site-container--narrow" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 className="site-page-title">{checkout.gateway_display_name}</h1>
      <div className="site-card">
        {checkout.site_credit_applied != null && checkout.site_credit_applied > 0 && (
          <p className="site-muted">
            Site credit applied: {formatKes(checkout.site_credit_applied)}
          </p>
        )}
        <p style={{ fontSize: 20, fontWeight: 700 }}>
          Amount due: {formatKes(checkout.total)}
        </p>
        {isLive ? (
          <>
            <p className="site-muted">
              You will be redirected to our secure payment gateway at{" "}
              <strong>pay.force42.com</strong>. Your order confirms automatically when
              payment succeeds.
            </p>
            {payUrl ? (
              <a
                href={payUrl}
                className="site-btn site-btn--primary site-btn--block"
                style={{ marginTop: 16 }}
              >
                Continue to payment
              </a>
            ) : (
              <p className="site-muted" role="alert">
                Payment gateway is not configured on this server.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="site-muted">
              <strong>Test mode</strong> — mock payment for demos and QA. Choose an outcome:
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button
                type="button"
                className="site-btn site-btn--primary"
                disabled={loading}
                onClick={() => onMockPay(true)}
              >
                Pay successfully
              </button>
              <button
                type="button"
                className="site-btn site-btn--secondary"
                disabled={loading}
                onClick={() => onMockPay(false)}
              >
                Simulate failure
              </button>
            </div>
          </>
        )}
        {error && (
          <p className="site-error" role="alert" style={{ marginTop: 16 }}>
            {error}
          </p>
        )}
        <p className="site-muted" style={{ fontSize: 12, marginTop: 16 }}>
          Order ID: {checkout.order_id}
        </p>
      </div>
    </div>
  );
}
