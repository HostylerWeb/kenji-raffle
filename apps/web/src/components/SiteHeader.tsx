"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiteCartDropdown } from "@/components/SiteCartDropdown";
import { CART_UPDATED_EVENT } from "@/lib/cart-events";
import { playerFetch, useIsClient, usePlayerLoggedIn } from "@/lib/player-api";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function useCartCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    playerFetch<{ count: number }>("/v1/cart/count")
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh);
  }, [refresh]);

  return count;
}

export function SiteHeader({
  tenantName,
  logoUrl,
}: {
  tenantName: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname() ?? "";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isClient = useIsClient();
  const loggedIn = usePlayerLoggedIn();
  const cartCount = useCartCount();

  const navLinks = [
    { href: "/raffles", label: "Raffles" },
    { href: "/winners", label: "Winners" },
    { href: "/play-safe", label: "Play Safe" },
  ];

  const initial = tenantName.charAt(0).toUpperCase();

  return (
    <>
      <header className="site-header site-header--v2 site-header--commerce">
        <div className="site-container site-header__inner">
          <Link href="/" className="site-brand">
            {logoUrl ? (
              <img src={logoUrl} alt={tenantName} className="site-brand__logo" />
            ) : (
              <span className="site-brand__mark">{initial}</span>
            )}
            <span className="site-brand__text">
              <span className="site-brand__name">{tenantName}</span>
              <span className="site-brand__tag">Licensed raffles</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link${pathname === link.href || pathname.startsWith(`${link.href}/`) ? " site-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <div className="site-header__cart-desktop">
              <SiteCartDropdown />
            </div>
            <Link
              href="/cart"
              className="site-cart-btn site-header__cart-mobile"
              aria-label={`Cart, ${cartCount} items`}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="site-cart-btn__badge">{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </Link>

            <div className="site-header__auth-bar">
              {!isClient ? (
                <div className="site-header__auth-slot" aria-hidden />
              ) : loggedIn ? (
                <Link href="/account" className="site-btn site-btn--secondary site-btn--sm">
                  Account
                </Link>
              ) : (
                <>
                  <Link href="/login" className="site-btn site-btn--ghost site-btn--sm">
                    Log in
                  </Link>
                  <Link href="/register" className="site-btn site-btn--primary site-btn--sm">
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="site-menu-btn"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <span className="site-menu-btn__bars" />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="site-drawer-backdrop site-drawer-backdrop--open"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="site-drawer site-drawer--commerce site-drawer--open" aria-label="Mobile menu">
            <div className="site-drawer__header">
              <span className="site-drawer__title">Menu</span>
              <button
                type="button"
                className="site-btn site-btn--ghost site-btn--sm"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </button>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="site-drawer__link"
                onClick={() => setDrawerOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="site-drawer__link" onClick={() => setDrawerOpen(false)}>
              Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>

            <div className="site-drawer__auth">
              {!isClient ? null : loggedIn ? (
                <Link
                  href="/account"
                  className="site-btn site-btn--primary site-btn--block"
                  onClick={() => setDrawerOpen(false)}
                >
                  My account
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="site-btn site-btn--secondary site-btn--block"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="site-btn site-btn--primary site-btn--block"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
