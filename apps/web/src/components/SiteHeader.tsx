"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { SiteCartDropdown } from "@/components/SiteCartDropdown";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";
import { useSiteCopyEditor } from "@/components/site-copy/SiteCopyEditorProvider";
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

const NAV_LINKS: { href: string; copyKey: SiteCopyKey }[] = [
  { href: "/raffles", copyKey: "nav.raffles" },
  { href: "/winners", copyKey: "nav.winners" },
  { href: "/play-safe", copyKey: "nav.play_safe" },
];

export function SiteHeader({
  tenantName,
  logoUrl,
  siteCopy,
}: {
  tenantName: string;
  logoUrl?: string | null;
  siteCopy: Record<SiteCopyKey, string>;
}) {
  const pathname = usePathname() ?? "";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isClient = useIsClient();
  const loggedIn = usePlayerLoggedIn();
  const cartCount = useCartCount();
  const copyEditor = useSiteCopyEditor();
  const copyEditActive = copyEditor?.active ?? false;

  const initial = tenantName.charAt(0).toUpperCase();

  function navLinkClass(href: string, extra = "") {
    const active =
      pathname === href || pathname.startsWith(`${href}/`) ? " site-nav-link--active" : "";
    return `site-nav-link${active}${extra}`.trim();
  }

  function drawerLinkClass(href: string) {
    return "site-drawer__link";
  }

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
            {NAV_LINKS.map((link) =>
              copyEditActive ? (
                <span
                  key={link.href}
                  className={navLinkClass(link.href, " site-nav-link--copy-edit")}
                >
                  <SiteCopySlot copyKey={link.copyKey}>{siteCopy[link.copyKey]}</SiteCopySlot>
                </span>
              ) : (
                <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                  <SiteCopySlot copyKey={link.copyKey}>{siteCopy[link.copyKey]}</SiteCopySlot>
                </Link>
              ),
            )}
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
              ) : copyEditActive ? (
                <>
                  <span className="site-btn site-btn--ghost site-btn--sm site-btn--copy-edit">
                    <SiteCopySlot copyKey="nav.login">{siteCopy["nav.login"]}</SiteCopySlot>
                  </span>
                  <span className="site-btn site-btn--primary site-btn--sm site-btn--copy-edit">
                    <SiteCopySlot copyKey="nav.register">{siteCopy["nav.register"]}</SiteCopySlot>
                  </span>
                </>
              ) : (
                <>
                  <Link href="/login" className="site-btn site-btn--ghost site-btn--sm">
                    <SiteCopySlot copyKey="nav.login">{siteCopy["nav.login"]}</SiteCopySlot>
                  </Link>
                  <Link href="/register" className="site-btn site-btn--primary site-btn--sm">
                    <SiteCopySlot copyKey="nav.register">{siteCopy["nav.register"]}</SiteCopySlot>
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

            {NAV_LINKS.map((link) =>
              copyEditActive ? (
                <span key={link.href} className={drawerLinkClass(link.href)}>
                  <SiteCopySlot copyKey={link.copyKey}>{siteCopy[link.copyKey]}</SiteCopySlot>
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={drawerLinkClass(link.href)}
                  onClick={() => setDrawerOpen(false)}
                >
                  <SiteCopySlot copyKey={link.copyKey}>{siteCopy[link.copyKey]}</SiteCopySlot>
                </Link>
              ),
            )}
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
              ) : copyEditActive ? (
                <>
                  <span className="site-btn site-btn--secondary site-btn--block site-btn--copy-edit">
                    <SiteCopySlot copyKey="nav.login">{siteCopy["nav.login"]}</SiteCopySlot>
                  </span>
                  <span className="site-btn site-btn--primary site-btn--block site-btn--copy-edit">
                    <SiteCopySlot copyKey="nav.register">{siteCopy["nav.register"]}</SiteCopySlot>
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="site-btn site-btn--secondary site-btn--block"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <SiteCopySlot copyKey="nav.login">{siteCopy["nav.login"]}</SiteCopySlot>
                  </Link>
                  <Link
                    href="/register"
                    className="site-btn site-btn--primary site-btn--block"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <SiteCopySlot copyKey="nav.register">{siteCopy["nav.register"]}</SiteCopySlot>
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
