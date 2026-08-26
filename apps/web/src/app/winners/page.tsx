import Link from "next/link";
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
      <Link href="/" className="site-breadcrumb">← Home</Link>
      <h1 className="site-page-title">Winners</h1>
      <p className="site-lead" style={{ marginBottom: 24 }}>
        Congratulations to our recent winners. Could you be next?
      </p>

      {winners.length === 0 ? (
        <div className="site-empty">
          <h3 className="site-empty__title">No winners yet</h3>
          <p className="site-muted">Be the first — enter a live raffle today.</p>
          <Link href="/raffles" className="site-btn site-btn--primary" style={{ marginTop: 16 }}>
            Browse raffles
          </Link>
        </div>
      ) : (
        <>
          <div className="site-card site-table-wrap site-winners-table">
            <table className="site-table">
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
                <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{w.winner_name}</p>
                <p className="site-muted" style={{ margin: 0 }}>
                  #{w.ticket_number} · {w.prize_name}
                </p>
                <p className="site-muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
                  {formatDate(w.announced_at)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
