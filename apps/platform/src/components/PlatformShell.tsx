"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePlatformSession } from "../lib/use-platform-session";
import { platformFetch, redirectToLogin } from "../lib/api";

const NAV = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/operators", label: "Operators", adminOnly: false },
  { href: "/reports", label: "Reports", adminOnly: false },
  { href: "/platform-users", label: "Platform users", adminOnly: true },
  { href: "/settings", label: "Settings", adminOnly: false },
  { href: "/audit", label: "Audit log", adminOnly: false },
  { href: "/system", label: "System", adminOnly: false },
];

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

  const navItems = NAV.filter((item) => !item.adminOnly || admin);

  return (
    <div className="shell">
      <aside className={`sidebar${navOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">Kenji Raffle</div>
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
            <span className="sidebar-user-email">{user.email}</span>
            <span className="sidebar-user-role">
              {admin ? "Platform admin" : "Support (read-only)"}
            </span>
          </div>
        )}
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "nav active"
                  : "nav"
              }
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </Link>
          ))}
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
              ☰
            </button>
            <div>
              <h1>{title}</h1>
              {subtitle && <p className="page-subtitle muted">{subtitle}</p>}
            </div>
          </div>
          {!ready || !admin ? null : actions}
        </header>
        {ready && !admin && (
          <p className="support-banner muted">
            Support mode — mutating actions are hidden.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
