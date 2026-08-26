import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { SitePageIntro } from "@/components/SitePageIntro";
import { headers } from "next/headers";
import { formatDate } from "@/lib/format";
import { getRequestHost, publicFetch } from "@/lib/tenant";

type Winner = {
  raffle_title: string;
  winner_name: string;
  ticket_number: number;
  prize_name: string;
  announced_at: string;
};

export default async function WinnersPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  let winners: Winner[] = [];
  try {
    winners = await publicFetch<Winner[]>("/v1/winners", host);
  } catch {
    winners = [];
  }

  return (
    <>
      <SitePageIntro
        breadcrumb="← Home"
        title="Winners"
        lead="Congratulations to our recent winners. Could you be next?"
      />

      {winners.length === 0 ? (
        <EmptyState
          title="No winners yet"
          description="Be the first — enter a live raffle today."
          actionHref="/raffles"
          actionLabel="Browse raffles"
        />
      ) : (
        <>
          <div className="site-card site-card--v2 site-table-wrap site-winners-table">
            <table className="site-table site-table--commerce">
              <thead>
                <tr>
                  <th>Raffle</th>
                  <th>Winner</th>
                  <th>Ticket</th>
                  <th>Prize</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={`${w.raffle_title}-${w.ticket_number}-${w.announced_at}`}>
                    <td>{w.raffle_title}</td>
                    <td>{w.winner_name}</td>
                    <td>#{w.ticket_number}</td>
                    <td>{w.prize_name}</td>
                    <td>{formatDate(w.announced_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="site-winner-cards">
            {winners.map((w) => (
              <div key={`card-${w.raffle_title}-${w.ticket_number}`} className="site-winner-card">
                <p className="site-winner-card__title">{w.raffle_title}</p>
                <p className="site-winner-card__name">{w.winner_name}</p>
                <p className="site-muted site-winner-card__meta">
                  #{w.ticket_number} · {w.prize_name}
                </p>
                <p className="site-muted site-winner-card__date">{formatDate(w.announced_at)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
