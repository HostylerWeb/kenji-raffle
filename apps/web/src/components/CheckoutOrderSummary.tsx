"use client";

import type { Cart } from "@/lib/cart-types";
import { formatKes } from "@/lib/format";

type CheckoutOrderSummaryProps = {
  cart: Cart | null;
  loading?: boolean;
};

export function CheckoutOrderSummary({ cart, loading }: CheckoutOrderSummaryProps) {
  return (
    <div className="site-card site-card--v2 site-order-summary__card">
      <h2 className="site-section-title">Your order</h2>
      {loading || !cart ? (
        <div className="site-checkout-summary-skeleton" aria-hidden>
          <div className="site-skeleton site-skeleton--row" />
          <div className="site-skeleton site-skeleton--row" />
          <div className="site-skeleton site-skeleton--short" />
        </div>
      ) : cart.items.length > 0 ? (
        <>
          <ul className="site-checkout-lines">
            {cart.items.map((item) => (
              <li key={item.id} className="site-checkout-lines__item site-checkout-lines__item--thumb">
                <div className="site-checkout-lines__main">
                  <div className="site-cart-item__thumb site-cart-item__thumb--sm">
                    {item.featured_image_url ? (
                      <img src={item.featured_image_url} alt="" loading="lazy" />
                    ) : (
                      <span>{item.raffle_title.charAt(0)}</span>
                    )}
                  </div>
                  <span>
                    {item.raffle_title}
                    <span className="site-muted"> × {item.ticket_quantity}</span>
                  </span>
                </div>
                <strong>{formatKes(item.final_amount)}</strong>
              </li>
            ))}
          </ul>
          <div className="site-order-summary__row site-order-summary__total">
            <span>Total</span>
            <strong>{formatKes(cart.subtotal)}</strong>
          </div>
        </>
      ) : (
        <p className="site-muted">Your cart is empty.</p>
      )}
      <hr className="site-divider" />
      <h2 className="site-section-title">Secure checkout</h2>
      <p className="site-muted site-order-summary__trust">
        Payments are processed through our licensed Harambe Payment Gateway.
        Your ticket reservations are held while you complete payment.
      </p>
      <ul className="site-order-summary__bullets">
        <li>M-Pesa &amp; card supported (via gateway)</li>
        <li>Instant win prizes credited automatically</li>
        <li>Play Safe controls in your account</li>
      </ul>
    </div>
  );
}
