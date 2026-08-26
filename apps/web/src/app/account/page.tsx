"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch, signOutPlayer } from "@/lib/player-api";
import { formatKes } from "@/lib/format";

type Me = {
  email: string;
  full_name: string | null;
  site_credit_balance: number;
  play_safe_active: boolean;
  active_ticket_count: number;
};

const QUICK_LINKS = [
  { href: "/account/orders", label: "Orders", desc: "Purchase history" },
  { href: "/account/tickets", label: "My tickets", desc: "Your entry numbers" },
  { href: "/account/wins", label: "Wins", desc: "Prizes & instant wins" },
  { href: "/account/claims", label: "Prize claims", desc: "Ship or withdraw" },
  { href: "/account/site-credit", label: "Site credit", desc: "Balance & usage" },
  { href: "/account/settings", label: "Settings", desc: "Profile & addresses" },
];

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    playerFetch<Me>("/v1/me")
      .then(setMe)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load account");
      });
  }, []);

  if (!me) {
    return (
      <>
        <AccountPageHeader title="Overview" description="Your account at a glance." />
        <div className="site-skeleton" style={{ height: 180 }} />
      </>
    );
  }

  return (
    <>
      <AccountPageHeader
        title="Overview"
        description="Manage your tickets, orders, wins, and account settings."
      />
      {error && <p className="site-error">{error}</p>}
      <div className="site-card site-card--highlight">
        <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>
          {me.full_name ?? me.email}
        </p>
        <p className="site-muted" style={{ margin: 0 }}>{me.email}</p>
        <div className="site-stat-grid">
          <div className="site-card site-card--flat">
            <p className="site-muted" style={{ margin: 0, fontSize: 13 }}>Site credit</p>
            <p className="site-stat-grid__value">{formatKes(me.site_credit_balance)}</p>
          </div>
          <Link href="/account/tickets" className="site-card site-card--flat" style={{ textDecoration: "none", color: "inherit" }}>
            <p className="site-muted" style={{ margin: 0, fontSize: 13 }}>Active tickets</p>
            <p className="site-stat-grid__value">{me.active_ticket_count.toLocaleString()}</p>
          </Link>
          {me.play_safe_active && (
            <div className="site-card site-card--flat">
              <p className="site-muted" style={{ margin: 0, fontSize: 13 }}>Play Safe</p>
              <p style={{ margin: "4px 0 0", fontWeight: 600, color: "var(--site-warning)" }}>Active</p>
            </div>
          )}
        </div>
      </div>

      <div className="site-quick-links site-account-section">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="site-quick-link">
            <span className="site-quick-link__label">{link.label}</span>
            <span className="site-quick-link__desc">{link.desc}</span>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/raffles" className="site-btn site-btn--primary site-btn--sm">
          Browse raffles
        </Link>
        <button type="button" className="site-btn site-btn--ghost site-btn--sm" onClick={() => signOutPlayer()}>
          Sign out
        </button>
      </div>
    </>
  );
}
