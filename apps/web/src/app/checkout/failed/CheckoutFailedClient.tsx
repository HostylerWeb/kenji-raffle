"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { notifyCartUpdated } from "@/lib/cart-events";

export default function CheckoutFailedClient() {
  const params = useSearchParams();
  const orderId = params.get("order");

  useEffect(() => {
    notifyCartUpdated();
  }, []);

  return (
    <div className="site-container site-container--narrow">
      <div className="site-success-icon" style={{ background: "#fee2e2", color: "var(--site-danger)" }} aria-hidden>
        ✕
      </div>
      <h1 className="site-page-title">Payment failed</h1>
      <p className="site-lead" style={{ marginBottom: 24 }}>
        Your payment could not be completed. Your tickets have been returned to your cart so you can try again.
      </p>
      <div className="site-card">
        {orderId && <p className="site-muted">Order ID: {orderId}</p>}
        <p className="site-muted" style={{ margin: 0 }}>
          Review your cart and return to checkout, or view your order history for details.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link href="/cart" className="site-btn site-btn--primary">
          Back to cart
        </Link>
        <Link href="/account/orders" className="site-btn site-btn--secondary">
          View orders
        </Link>
      </div>
    </div>
  );
}
