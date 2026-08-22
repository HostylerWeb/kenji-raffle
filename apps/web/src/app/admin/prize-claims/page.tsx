"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Claim = {
  id: string;
  user_id: string;
  status: string;
  prize_type: string;
  prize_value: number | null;
  user_email: string;
  user_name: string | null;
  county: string | null;
  town: string | null;
  address_line: string | null;
  postal_code: string | null;
  source: string;
  prize_name: string | null;
  withdrawal: { id: string; status: string; method: string; amount: number } | null;
};

type ClaimsResponse = {
  items: Claim[];
  total: number;
  page: number;
  limit: number;
};

export default function PrizeClaimsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<ClaimsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setData(await operatorFetch<ClaimsResponse>(`/v1/admin/prize-claims?${params.toString()}`));
  }, [page, search, status]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, load]);

  async function updateStatus(id: string, next: string) {
    await operatorFetch(`/v1/admin/prize-claims/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    await load();
    toast(`Claim ${next}`);
  }

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell
      title="Prize claims"
      description="Ship physical prizes and track cash claim payouts."
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Claims queue</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} claim{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search player or prize…"
          hasActive={Boolean(search || status)}
          onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
        >
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Player", "Source", "Prize", "Type", "Details", "Status", ""]}
          isEmpty={items.length === 0}
          emptyTitle="No prize claims"
          emptyDescription="Claims appear when players win physical or cash prizes."
        >
          {items.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/admin/players/${c.user_id}`}>
                  <strong>{c.user_name ?? c.user_email}</strong>
                </Link>
                <br />
                <span className="muted">{c.user_email}</span>
              </td>
              <td>{c.source}</td>
              <td>
                <Link href={`/admin/prize-claims/${c.id}`}>
                  <strong>{c.prize_name ?? "—"}</strong>
                </Link>
                {c.prize_value != null && (
                  <span className="muted"> · KES {c.prize_value.toLocaleString()}</span>
                )}
              </td>
              <td>{c.prize_type}</td>
              <td>
                {c.prize_type === "physical" && (
                  <>
                    {c.address_line ?? "No address yet"}
                    {c.town && <br />}
                    {c.town}
                    {c.county && `, ${c.county}`}
                  </>
                )}
                {c.prize_type === "cash" && c.withdrawal && (
                  <>
                    <Link href={`/admin/withdrawals/${c.withdrawal.id}`}>
                      Withdrawal
                    </Link>
                    {" · "}{c.withdrawal.method} · {c.withdrawal.status}
                  </>
                )}
                {c.prize_type === "cash" && !c.withdrawal && (
                  <span className="muted">Awaiting payout details</span>
                )}
              </td>
              <td><AdminStatusBadge status={c.status} /></td>
              <td>
                <div className="admin-row-actions">
                  <Link href={`/admin/prize-claims/${c.id}`}>View</Link>
                  {c.prize_type === "physical" && c.status === "pending" && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateStatus(c.id, "shipped")}>
                      Ship
                    </button>
                  )}
                  {c.prize_type === "physical" && c.status === "shipped" && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateStatus(c.id, "delivered")}>
                      Deliver
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && (
          <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />
        )}
      </div>
    </OperatorAdminShell>
  );
}
