"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch, signOutPlayer } from "@/lib/player-api";

type Me = {
  email: string;
  full_name: string | null;
  site_credit_balance: number;
  play_safe_active: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account");
      return;
    }
    playerFetch<Me>("/v1/me").then(setMe).catch(() => router.replace("/login"));
  }, [router]);

  if (!me) return <main style={{ padding: 24 }}><p className="muted">Loading…</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
      <h1>My account</h1>
      <div className="card">
        <p><strong>{me.full_name ?? me.email}</strong></p>
        <p className="muted">Site credit: KES {me.site_credit_balance.toLocaleString()}</p>
        {me.play_safe_active && <p>Play Safe is active on your account.</p>}
      </div>
      <ul style={{ marginTop: 24, lineHeight: 2 }}>
        <li><Link href="/account/orders">Orders</Link></li>
        <li><Link href="/account/tickets">Tickets</Link></li>
        <li><Link href="/account/wins">Wins</Link></li>
        <li><Link href="/account/claims">Prize claims</Link></li>
        <li><Link href="/account/site-credit">Site credit</Link></li>
        <li><Link href="/account/settings">Settings</Link></li>
        <li><Link href="/account/play-safe">Play Safe</Link></li>
      </ul>
      <p style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-secondary" onClick={() => signOutPlayer()}>
          Sign out
        </button>
      </p>
    </main>
  );
}
