"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

type CartItem = {
  id: string;
  raffle_title: string;
  ticket_quantity: number;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
  ticket_numbers: number[];
};

type Cart = {
  items: CartItem[];
  subtotal: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setCart(await playerFetch<Cart>("/v1/cart"));
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load cart"),
    );
  }, []);

  async function removeItem(id: string) {
    setCart(await playerFetch<Cart>(`/v1/cart/items/${id}`, { method: "DELETE" }));
  }

  if (!cart && !error) {
    return <main style={{ padding: 40 }}>Loading cart…</main>;
  }

  if (!cart) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <h1>Your cart</h1>
        <p className="error">{error}</p>
        <p style={{ marginTop: 16 }}>
          <Link href="/raffles">Browse raffles</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Your cart</h1>
      {error && <p className="error">{error}</p>}

      {cart.items.length === 0 ? (
        <p className="muted">Your cart is empty.</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Raffle</th>
                <th>Qty</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.raffle_title}</td>
                  <td>{item.ticket_quantity}</td>
                  <td>
                    KES {item.final_amount.toLocaleString()}
                    {item.discount_amount > 0 && (
                      <span className="muted">
                        {" "}
                        (tier −{item.discount_amount.toLocaleString()})
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16 }}>
            <strong>Subtotal: KES {cart.subtotal.toLocaleString()}</strong>
          </p>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        {cart.items.length > 0 && (
          <Link href="/checkout" className="btn" style={{ textDecoration: "none" }}>
            Checkout
          </Link>
        )}
        {" "}
        <Link href="/raffles">Browse raffles</Link>
      </p>
      {!getPlayerToken() && cart.items.length > 0 && (
        <p className="muted">
          You will need to <Link href="/login?next=/checkout">log in</Link> or{" "}
          <Link href="/register?next=/checkout">register</Link> at checkout.
        </p>
      )}
    </main>
  );
}
