"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminTable } from "@/components/admin/AdminTable";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Winner = {
  id: string;
  raffle_title: string;
  user_email: string;
  ticket_number: number;
  prize_name: string | null;
  announced_at: string;
};

export default function AdminWinnersPage() {
  const router = useRouter();
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Winner[]>("/v1/admin/winners").then(setWinners);
  }, [router]);

  return (
    <OperatorAdminShell title="Winners" description="Draw winners across raffles.">
      <div className="admin-panel">
        <AdminTable
          columns={["Raffle", "Player", "Ticket", "Prize", "Announced"]}
          isEmpty={winners.length === 0}
          emptyTitle="No winners yet"
          emptyDescription="Run a draw from a raffle’s Go live tab."
        >
          {winners.map((w) => (
            <tr key={w.id}>
              <td>{w.raffle_title}</td>
              <td>{w.user_email}</td>
              <td>#{w.ticket_number}</td>
              <td>{w.prize_name ?? "—"}</td>
              <td>{new Date(w.announced_at).toLocaleString()}</td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
