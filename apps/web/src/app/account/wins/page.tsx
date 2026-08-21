"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

type Wins = {
  main_prizes: Array<{ raffle_title: string; ticket_number: number; prize_name: string }>;
  instant_wins: Array<{ raffle_title: string; prize_name: string; prize_value: number }>;
};

export default function AccountWinsPage() {
  const router = useRouter();
  const [wins, setWins] = useState<Wins | null>(null);

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/wins");
      return;
    }
    playerFetch<Wins>("/v1/account/wins").then(setWins).catch(() => router.replace("/login"));
  }, [router]);

  if (!wins) return <main style={{ padding: 24 }}><p className="muted">Loading…</p></main>;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>My wins</h1>
      <p><Link href="/account">← Account</Link></p>
      <h2>Main prizes</h2>
      {wins.main_prizes.length === 0 ? (
        <p className="muted">No main prize wins yet.</p>
      ) : (
        <ul>
          {wins.main_prizes.map((w, i) => (
            <li key={i}>{w.raffle_title} — {w.prize_name} (#{w.ticket_number})</li>
          ))}
        </ul>
      )}
      <h2 style={{ marginTop: 24 }}>Instant wins</h2>
      {wins.instant_wins.length === 0 ? (
        <p className="muted">No instant wins yet.</p>
      ) : (
        <ul>
          {wins.instant_wins.map((w, i) => (
            <li key={i}>{w.raffle_title} — {w.prize_name} (KES {w.prize_value})</li>
          ))}
        </ul>
      )}
    </main>
  );
}
