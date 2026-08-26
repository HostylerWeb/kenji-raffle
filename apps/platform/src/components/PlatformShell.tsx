"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePlatformSession } from "../lib/use-platform-session";
import { platformFetch, redirectToLogin } from "../lib/api";
import { PLATFORM_NAV } from "./platformNavigation";

export function PlatformShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAdmin: admin, ready } = usePlatformSession();
  const [navOpen, setNavOpen] = useState(false);

  function signOut() {
    platformFetch("/v1/platform/auth/logout", { method: "POST" }).catch(
      () => undefined,
    );
    redirectToLogin();
  }

  const navItems = PLATFORM_NAV.filter((item) => !item.adminOnly || admin);

  return (
    <div className="shell">
      <aside className={`sidebar${navOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark" aria-hidden>
              K
            </span>
            <div className="brand-text">
              <span className="brand-name">Kenji Raffle</span>
              <span className="brand-tag">Platform Console</span>
            </div>
          </div>
          <button
            type="button"
            className="nav-toggle nav-toggle-close"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        {user && (
          <div className="sidebar-user">
            <span className="sidebar-user-avatar" aria-hidden>
              {user.email.charAt(0).toUpperCase()}
            </span>
            <div>
              <span className="sidebar-user-email">{user.email}</span>
              <span className="sidebar-user-role">
                {admin ? "Platform admin" : "Support (read-only)"}
              </span>
            </div>
          </div>
        )}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={active ? "nav active" : "nav"}
                onClick={() => setNavOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button type="button" className="sign-out" onClick={signOut}>
          Sign out
        </button>
      </aside>

      {navOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setNavOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="main">
        <header className="page-header">
          <div className="page-header-titles">
            <button
              type="button"
              className="nav-toggle"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
            >
              <span className="nav-toggle-bars" aria-hidden />
            </button>
            <div>
              <h1>{title}</h1>
              {subtitle && <p className="page-subtitle muted">{subtitle}</p>}
            </div>
          </div>
          {!ready || !admin ? null : (
            <div className="page-header-actions">{actions}</div>
          )}
        </header>
        {ready && !admin && (
          <p className="support-banner muted">
            Support mode — mutating actions are hidden.
          </p>
        )}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
