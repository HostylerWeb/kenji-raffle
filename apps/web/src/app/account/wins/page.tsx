"use client";

import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { EmptyState } from "@/components/EmptyState";
import { playerFetch } from "@/lib/player-api";
import { formatKes } from "@/lib/format";

type Wins = {
  main_prizes: Array<{ raffle_title: string; ticket_number: number; prize_name: string }>;
  instant_wins: Array<{ raffle_title: string; prize_name: string; prize_value: number }>;
};

export default function AccountWinsPage() {
  const [wins, setWins] = useState<Wins | null>(null);

  useEffect(() => {
    playerFetch<Wins>("/v1/account/wins").then(setWins);
  }, []);

  if (!wins) {
    return (
      <>
        <AccountPageHeader title="My wins" description="Main draw prizes and instant wins." />
        <div className="site-skeleton" style={{ height: 120 }} />
      </>
    );
  }

  return (
    <>
      <AccountPageHeader
        title="My wins"
        description="Main draw prizes and instant wins from your ticket purchases."
      />
      <div className="site-card site-account-section">
        <h2 className="site-section-title" style={{ marginTop: 0 }}>Main prizes</h2>
        {wins.main_prizes.length === 0 ? (
          <EmptyState
            title="No main prize wins yet"
            description="When you win a main draw, it will appear here."
            actionHref="/raffles"
            actionLabel="Browse raffles"
          />
        ) : (
          <ul className="site-ticket-list">
            {wins.main_prizes.map((w, i) => (
              <li key={i} className="site-ticket-pill">
                <span>{w.raffle_title} — {w.prize_name}</span>
                <strong>#{w.ticket_number}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="site-card site-account-section">
        <h2 className="site-section-title" style={{ marginTop: 0 }}>Instant wins</h2>
        {wins.instant_wins.length === 0 ? (
          <EmptyState
            title="No instant wins yet"
            description="Instant win prizes are revealed when you purchase tickets."
            actionHref="/raffles"
            actionLabel="Enter a raffle"
          />
        ) : (
          <ul className="site-ticket-list">
            {wins.instant_wins.map((w, i) => (
              <li key={i} className="site-ticket-pill">
                <span>{w.raffle_title} — {w.prize_name}</span>
                <strong>{formatKes(w.prize_value)}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
