"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Raffle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  ticket_price: number;
  is_featured: boolean;
  max_entries: number;
  tickets_sold: number;
  tickets_total: number;
  percent_sold: number;
  ticket_counts?: { total: number } | null;
};

type RafflesResponse = {
  items: Raffle[];
  total: number;
  page: number;
  limit: number;
};

function formatPercentSold(raffle: Raffle) {
  if (!raffle.ticket_counts?.total) {
    return <span className="muted">Pool not generated</span>;
  }
  return (
    <span>
      <strong>{raffle.percent_sold}%</strong>
      <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>
        ({raffle.tickets_sold.toLocaleString()} sold)
      </span>
    </span>
  );
}

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AdminRafflesPage() {
  const router = useRouter();
  const [data, setData] = useState<RafflesResponse | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setData(await operatorFetch<RafflesResponse>(`/v1/admin/raffles?${params.toString()}`));
  }, [page, search, status]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/login"));
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router, load]);

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell
      title="Raffles"
      description="Create raffles, configure instant wins, and go live from one editor."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
      actions={
        <Link href="/admin/raffles/new" className="btn">
          New raffle
        </Link>
      }
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">All raffles</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} raffle{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search title or slug…"
          hasActive={Boolean(search || status)}
          onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
        >
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="draft">draft</option>
            <option value="listed">listed</option>
            <option value="active">active</option>
            <option value="drawn">drawn</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Title", "Status", "Tickets", "% sold", "Price", "Featured", ""]}
          isEmpty={items.length === 0}
          emptyTitle="No raffles yet"
          emptyDescription="Create your first raffle with optional instant wins."
          emptyAction={
            <Link href="/admin/raffles/new" className="btn">
              New raffle
            </Link>
          }
        >
          {items.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/raffles/${r.id}`}>
                  <strong>{r.title}</strong>
                </Link>
              </td>
              <td><AdminStatusBadge status={r.status} /></td>
              <td>{r.max_entries.toLocaleString()}</td>
              <td>{formatPercentSold(r)}</td>
              <td>KES {r.ticket_price.toLocaleString()}</td>
              <td>{r.is_featured ? "Yes" : "—"}</td>
              <td>
                <Link href={`/admin/raffles/${r.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>
    </OperatorAdminShell>
  );
}
