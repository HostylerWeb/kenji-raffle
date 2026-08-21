import Link from "next/link";
import { headers } from "next/headers";
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
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Winners</h1>
      <p><Link href="/">Home</Link></p>
      {winners.length === 0 ? (
        <p className="muted">No winners announced yet.</p>
      ) : (
        <table className="table" style={{ width: "100%", marginTop: 16 }}>
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
                <td>{new Date(w.announced_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
