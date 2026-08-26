"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CART_UPDATED_EVENT } from "@/lib/cart-events";
import { formatKes } from "@/lib/format";
import { playerFetch } from "@/lib/player-api";
import type { Cart } from "@/lib/cart-types";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

export function SiteCartDropdown() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    playerFetch<Cart>("/v1/cart")
      .then(setCart)
      .catch(() => setCart({ items: [], subtotal: 0, expires_at: null }));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const count = cart?.items.reduce((s, i) => s + i.ticket_quantity, 0) ?? 0;

  return (
    <div className="site-cart-dropdown" ref={rootRef}>
      <button
        type="button"
        className="site-cart-btn"
        aria-label={`Cart, ${count} items`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <CartIcon />
        {count > 0 && (
          <span className="site-cart-btn__badge">{count > 99 ? "99+" : count}</span>
        )}
      </button>
      {open && (
        <div className="site-cart-dropdown__panel" role="dialog" aria-label="Cart preview">
          <p className="site-cart-dropdown__heading">Your cart</p>
          {cart && cart.items.length > 0 ? (
            <>
              <ul className="site-cart-dropdown__lines">
                {cart.items.map((item) => (
                  <li key={item.id} className="site-cart-dropdown__line">
                    <span>
                      {item.raffle_title}
                      <span className="site-muted"> × {item.ticket_quantity}</span>
                    </span>
                    <strong>{formatKes(item.final_amount)}</strong>
                  </li>
                ))}
              </ul>
              <div className="site-order-summary__row site-order-summary__total" style={{ paddingTop: 0 }}>
                <span>Total</span>
                <strong>{formatKes(cart.subtotal)}</strong>
              </div>
            </>
          ) : (
            <p className="site-cart-dropdown__empty">Your cart is empty.</p>
          )}
          <Link
            href="/cart"
            className="site-btn site-btn--primary site-btn--block site-btn--sm site-cart-dropdown__cta"
            onClick={() => setOpen(false)}
          >
            View cart
          </Link>
        </div>
      )}
    </div>
  );
}
