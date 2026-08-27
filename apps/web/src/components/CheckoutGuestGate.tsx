"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Cart } from "@/lib/cart-types";
import { formatKes } from "@/lib/format";
import { PlayerLoginForm } from "@/components/PlayerLoginForm";
import { PlayerRegisterForm } from "@/components/PlayerRegisterForm";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";
import { useSiteCopyText } from "@/components/site-copy/SiteCopyEditorProvider";

type Tab = "login" | "register";

type CheckoutGuestGateProps = {
  cart: Cart;
  onAuthenticated: () => void | Promise<void>;
};

export function CheckoutGuestGate({ cart, onAuthenticated }: CheckoutGuestGateProps) {
  const guestTitle = useSiteCopyText("checkout.guest.title");
  const [tab, setTab] = useState<Tab>("login");
  const tabsId = useId();
  const loginTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusTarget = panelRef.current?.querySelector<HTMLElement>(
      "input:not([type=checkbox]), select",
    );
    focusTarget?.focus();
  }, [tab]);

  function selectTab(next: Tab) {
    setTab(next);
  }

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, current: Tab) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = current === "login" ? "register" : "login";
    setTab(next);
    (next === "login" ? loginTabRef : registerTabRef).current?.focus();
  }

  return (
    <div className="site-checkout-guest site-card site-card--v2 site-page-block">
      <h2 className="site-section-title">
        <SiteCopySlot copyKey="checkout.guest.title">{guestTitle}</SiteCopySlot>
      </h2>
      <p className="site-muted site-checkout-guest__lead">
        Sign in or create an account to continue with checkout. An account is required to pay.
      </p>

      <div className="site-checkout-guest__recap" aria-label="Cart summary">
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
      </div>

      <div
        className="site-checkout-tabs"
        role="tablist"
        aria-label="Sign in or register"
        id={tabsId}
      >
        <button
          ref={loginTabRef}
          type="button"
          role="tab"
          id={`${tabsId}-login-tab`}
          aria-selected={tab === "login"}
          aria-controls={`${tabsId}-login-panel`}
          className={`site-checkout-tabs__tab${tab === "login" ? " site-checkout-tabs__tab--active" : ""}`}
          onClick={() => selectTab("login")}
          onKeyDown={(e) => handleTabKeyDown(e, "login")}
        >
          Login
        </button>
        <button
          ref={registerTabRef}
          type="button"
          role="tab"
          id={`${tabsId}-register-tab`}
          aria-selected={tab === "register"}
          aria-controls={`${tabsId}-register-panel`}
          className={`site-checkout-tabs__tab${tab === "register" ? " site-checkout-tabs__tab--active" : ""}`}
          onClick={() => selectTab("register")}
          onKeyDown={(e) => handleTabKeyDown(e, "register")}
        >
          Register
        </button>
      </div>

      <div
        ref={panelRef}
        role="tabpanel"
        id={`${tabsId}-login-panel`}
        aria-labelledby={`${tabsId}-login-tab`}
        hidden={tab !== "login"}
        className="site-checkout-tabs__panel"
      >
        {tab === "login" && (
          <PlayerLoginForm
            compact
            next="/checkout"
            submitLabel="Login & continue"
            idPrefix="checkout-login"
            onAuthenticated={onAuthenticated}
          />
        )}
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-register-panel`}
        aria-labelledby={`${tabsId}-register-tab`}
        hidden={tab !== "register"}
        className="site-checkout-tabs__panel"
      >
        {tab === "register" && (
          <PlayerRegisterForm
            next="/checkout"
            submitLabel="Register & continue"
            idPrefix="checkout-register"
            onAuthenticated={onAuthenticated}
          />
        )}
      </div>
    </div>
  );
}
