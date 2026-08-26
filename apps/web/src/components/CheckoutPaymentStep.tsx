"use client";

import { formatKes } from "@/lib/format";
import { SitePageIntro } from "@/components/SitePageIntro";

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
    <div className="site-page--narrow">
      <SitePageIntro
        title={checkout.gateway_display_name}
        lead="Complete your payment to confirm your tickets."
      />
      <div className="site-card site-card--v2 site-card--highlight">
        {checkout.site_credit_applied != null && checkout.site_credit_applied > 0 && (
          <p className="site-muted">
            Site credit applied: {formatKes(checkout.site_credit_applied)}
          </p>
        )}
        <p className="site-checkout-payment__amount">
          Amount due: <strong>{formatKes(checkout.total)}</strong>
        </p>
        {isLive ? (
          <>
            <p className="site-muted">
              You will be redirected to our secure payment gateway at{" "}
              <strong>pay.force42.com</strong>. Your order confirms automatically when
              payment succeeds.
            </p>
            {payUrl ? (
              <a href={payUrl} className="site-btn site-btn--primary site-btn--block site-checkout-payment__cta">
                Continue to payment
              </a>
            ) : (
              <p className="site-error" role="alert">
                Payment gateway is not configured on this server.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="site-muted">
              <strong>Test mode</strong> — mock payment for demos and QA. Choose an outcome:
            </p>
            <div className="site-page-actions site-page-actions--inline">
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
          <p className="site-error" role="alert">
            {error}
          </p>
        )}
        <p className="site-muted site-checkout-payment__meta">
          Order ID: {checkout.order_id}
        </p>
      </div>
    </div>
  );
}
