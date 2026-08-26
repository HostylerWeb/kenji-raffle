"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch } from "@/lib/player-api";

type Ticket = {
  raffle_title: string;
  raffle_slug: string;
  ticket_number: number;
  raffle_status: string;
};

export default function AccountTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    playerFetch<Ticket[]>("/v1/account/tickets")
      .then(setTickets)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load tickets");
        setTickets([]);
      });
  }, []);

  return (
    <>
      <AccountPageHeader
        title="My tickets"
        description="All your active raffle entry numbers in one place."
      />
      {error && <p className="site-error">{error}</p>}
      {!tickets ? (
        <div className="site-skeleton" style={{ height: 120 }} />
      ) : tickets.length === 0 && !error ? (
        <div className="site-empty site-card">
          <p className="site-empty__title">No tickets yet</p>
          <p className="site-muted">Purchase tickets from any live raffle to see them here.</p>
          <Link href="/raffles" className="site-btn site-btn--primary site-btn--sm" style={{ marginTop: 12 }}>
            Browse raffles
          </Link>
        </div>
      ) : tickets.length > 0 ? (
        <div className="site-card">
          <ul className="site-ticket-list">
            {tickets.map((t, i) => (
              <li key={i} className="site-ticket-pill">
                <span>
                  <Link href={`/raffles/${t.raffle_slug}`}>{t.raffle_title}</Link>
                  <span className="site-muted"> · {t.raffle_status}</span>
                </span>
                <strong>#{t.ticket_number}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
