"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutFailedClient() {
  const params = useSearchParams();
  const orderId = params.get("order");

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Payment failed</h1>
      <div className="card">
        <p>Your payment could not be completed.</p>
        {orderId && <p className="muted">Order ID: {orderId}</p>}
        <p>Your ticket reservations are still in your cart. You can try again.</p>
      </div>
      <p style={{ marginTop: 16 }}>
        <Link href="/checkout" className="btn" style={{ textDecoration: "none" }}>
          Retry checkout
        </Link>
        {" · "}
        <Link href="/cart">View cart</Link>
      </p>
    </main>
  );
}
