"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTable } from "@/components/admin/AdminTable";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Winner = {
  id: string;
  raffle_id: string;
  raffle_title: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  ticket_number: number;
  prize_name: string | null;
  announced_at: string;
};

type WinnersResponse = {
  items: Winner[];
  total: number;
  page: number;
  limit: number;
};

export default function AdminWinnersPage() {
  const router = useRouter();
  const [data, setData] = useState<WinnersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    setData(await operatorFetch<WinnersResponse>(`/v1/admin/winners?${params.toString()}`));
  }, [page, search]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, load]);

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell title="Winners" description="Draw winners across raffles.">
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Draw winners</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} winner{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search raffle, player…"
          hasActive={Boolean(search)}
          onClear={() => { setSearch(""); setPage(1); }}
        >
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Raffle", "Player", "Ticket", "Prize", "Announced"]}
          isEmpty={items.length === 0}
          emptyTitle="No winners yet"
          emptyDescription="Run a draw from a raffle’s Go live tab."
        >
          {items.map((w) => (
            <tr key={w.id}>
              <td>
                <Link href={`/admin/raffles/${w.raffle_id}`}>{w.raffle_title}</Link>
              </td>
              <td>
                <Link href={`/admin/players/${w.user_id}`}>
                  {w.user_name ?? w.user_email}
                </Link>
              </td>
              <td>#{w.ticket_number}</td>
              <td>{w.prize_name ?? "—"}</td>
              <td className="muted">{new Date(w.announced_at).toLocaleString()}</td>
            </tr>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>
    </OperatorAdminShell>
  );
}
