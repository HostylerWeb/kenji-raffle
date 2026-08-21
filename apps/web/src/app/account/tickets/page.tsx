"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

type Ticket = {
  raffle_title: string;
  raffle_slug: string;
  ticket_number: number;
  raffle_status: string;
};

export default function AccountTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/tickets");
      return;
    }
    playerFetch<Ticket[]>("/v1/account/tickets").then(setTickets).catch(() => router.replace("/login"));
  }, [router]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>My tickets</h1>
      <p><Link href="/account">← Account</Link></p>
      {tickets.length === 0 ? (
        <p className="muted">No tickets yet.</p>
      ) : (
        <ul>
          {tickets.map((t, i) => (
            <li key={i}>
              <Link href={`/raffles/${t.raffle_slug}`}>{t.raffle_title}</Link>
              — #{t.ticket_number} ({t.raffle_status})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
