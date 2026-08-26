"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ReservationCountdown } from "@/components/ReservationCountdown";
import { SitePageIntro } from "@/components/SitePageIntro";
import { notifyCartUpdated } from "@/lib/cart-events";
import { formatKes } from "@/lib/format";
import { getPlayerToken, playerFetch } from "@/lib/player-api";
import { EmptyState } from "@/components/EmptyState";

import type { Cart, CartItem } from "@/lib/cart-types";

export type { Cart, CartItem };

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setCart(await playerFetch<Cart>("/v1/cart"));
  }, []);

  useEffect(() => {
    load()
      .then(() => notifyCartUpdated())
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load cart"),
      );
  }, [load]);

  async function removeItem(id: string) {
    setUpdating(id);
    try {
      setCart(await playerFetch<Cart>(`/v1/cart/items/${id}`, { method: "DELETE" }));
      notifyCartUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  }

  async function updateQty(id: string, quantity: number) {
    if (quantity < 1) return;
    setUpdating(id);
    try {
      setCart(
        await playerFetch<Cart>(`/v1/cart/items/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ ticket_quantity: quantity }),
        }),
      );
      notifyCartUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  }

  if (!cart && !error) {
    return (
      <>
        <SitePageIntro title="Your cart" lead="Review your tickets before checkout." />
        <div className="site-skeleton site-skeleton--card" />
      </>
    );
  }

  if (!cart) {
    return (
      <>
        <SitePageIntro title="Your cart" />
        <p className="site-error">{error}</p>
        <Link href="/raffles" className="site-btn site-btn--primary site-page-actions">
          Browse raffles
        </Link>
      </>
    );
  }

  return (
    <div className="site-cart-layout site-checkout-grid">
      <div>
        <SitePageIntro title="Your cart" lead="Your ticket reservations are held while you checkout." />
        <ReservationCountdown expiresAt={cart.expires_at} className="site-reservation-countdown" />
        {error && <p className="site-error">{error}</p>}

        {cart.items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse live raffles and add tickets to get started."
            actionHref="/raffles"
            actionLabel="Browse raffles"
          />
        ) : (
          <div className="site-card site-card--v2 site-cart-list">
            {cart.items.map((item) => (
              <div key={item.id} className="site-cart-item">
                <div className="site-cart-item__thumb">
                  {item.featured_image_url ? (
                    <img src={item.featured_image_url} alt="" loading="lazy" />
                  ) : (
                    <span>{item.raffle_title.charAt(0)}</span>
                  )}
                </div>
                <div className="site-cart-item__body">
                  <p className="site-cart-item__title">{item.raffle_title}</p>
                  <p className="site-muted">
                    {formatKes(item.final_amount / item.ticket_quantity)} each
                    {item.discount_amount > 0 && (
                      <> · tier discount −{formatKes(item.discount_amount)}</>
                    )}
                  </p>
                  {item.ticket_numbers.length > 0 && (
                    <p className="site-cart-item__tickets">
                      Reserved: {item.ticket_numbers.slice(0, 8).join(", ")}
                      {item.ticket_numbers.length > 8 ? "…" : ""}
                    </p>
                  )}
                  <div className="site-ticket-stepper site-ticket-stepper--commerce">
                    <button
                      type="button"
                      disabled={updating === item.id || item.ticket_quantity <= 1}
                      onClick={() => updateQty(item.id, item.ticket_quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.ticket_quantity}
                      readOnly
                      aria-label="Quantity"
                    />
                    <button
                      type="button"
                      disabled={updating === item.id}
                      onClick={() => updateQty(item.id, item.ticket_quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="site-cart-item__actions">
                  <p className="site-cart-item__price">{formatKes(item.final_amount)}</p>
                  <button
                    type="button"
                    className="site-btn site-btn--ghost site-btn--sm"
                    disabled={updating === item.id}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="site-page-back">
          <Link href="/raffles">← Continue shopping</Link>
        </p>
      </div>

      {cart.items.length > 0 && (
        <aside className="site-order-summary">
          <div className="site-card site-card--v2 site-order-summary__card">
            <h2 className="site-section-title">Order summary</h2>
            <div className="site-order-summary__row">
              <span className="site-muted">Subtotal</span>
              <strong>{formatKes(cart.subtotal)}</strong>
            </div>
            <div className="site-order-summary__row site-order-summary__total">
              <span>Total</span>
              <strong>{formatKes(cart.subtotal)}</strong>
            </div>
            <Link href="/checkout" className="site-btn site-btn--primary site-btn--block site-order-summary__cta">
              Proceed to checkout
            </Link>
            {!getPlayerToken() && (
              <p className="site-muted site-order-summary__note">
                Sign in or register on checkout to complete your purchase. An account is required to pay.
              </p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
