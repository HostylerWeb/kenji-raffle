"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { notifyCartUpdated } from "@/lib/cart-events";
import { SitePageIntro } from "@/components/SitePageIntro";

export default function CheckoutFailedClient() {
  const params = useSearchParams();
  const orderId = params.get("order");

  useEffect(() => {
    notifyCartUpdated();
  }, []);

  return (
    <div className="site-page--narrow">
      <div className="site-success-icon site-success-icon--error" aria-hidden>
        ✕
      </div>
      <SitePageIntro
        title="Payment failed"
        lead="Your payment could not be completed. Your tickets have been returned to your cart so you can try again."
      />
      <div className="site-card site-card--v2">
        {orderId && <p className="site-muted">Order ID: {orderId}</p>}
        <p className="site-muted">
          Review your cart and return to checkout, or view your order history for details.
        </p>
      </div>
      <div className="site-page-actions">
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
