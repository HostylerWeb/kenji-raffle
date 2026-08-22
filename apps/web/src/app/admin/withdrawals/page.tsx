"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Withdrawal = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  amount: number;
  method: string;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  status: string;
  admin_note: string | null;
  source: string | null;
  prize_name: string | null;
  created_at: string;
};

type WithdrawalsResponse = {
  items: Withdrawal[];
  total: number;
  page: number;
  limit: number;
};

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<WithdrawalsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setData(await operatorFetch<WithdrawalsResponse>(`/v1/admin/withdrawals?${params.toString()}`));
  }, [page, search, status]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, load]);

  async function update(id: string, newStatus: "approved" | "paid" | "rejected", admin_note?: string) {
    await operatorFetch(`/v1/admin/withdrawals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus, admin_note }),
    });
    await load();
    toast(`Withdrawal ${newStatus}`);
  }

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell title="Withdrawals" description="Approve and mark cash prize payouts.">
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Payout requests</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} request{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search player or account…"
          hasActive={Boolean(search || status)}
          onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
        >
          <select
            className="admin-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Player", "Prize", "Amount", "Method", "Account", "Status", ""]}
          isEmpty={items.length === 0}
          emptyTitle="No withdrawals"
        >
          {items.map((w) => (
            <tr key={w.id}>
              <td>
                <Link href={`/admin/players/${w.user_id}`}>
                  <strong>{w.user_name ?? w.user_email}</strong>
                </Link>
                <br />
                <span className="muted">{w.source}</span>
              </td>
              <td>{w.prize_name ?? "—"}</td>
              <td>
                <Link href={`/admin/withdrawals/${w.id}`}>
                  <strong>KES {w.amount.toLocaleString()}</strong>
                </Link>
              </td>
              <td>{w.method}</td>
              <td>
                {w.account_name && (
                  <>
                    {w.account_name}
                    <br />
                  </>
                )}
                {w.account_number}
                {w.bank_name && <br />}
                {w.bank_name}
              </td>
              <td>
                <AdminStatusBadge status={w.status} />
              </td>
              <td>
                <div className="admin-row-actions">
                {w.status === "pending" && (
                  <>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => update(w.id, "approved")}>
                      Approve
                    </button>
                    <AdminConfirm
                      title="Reject withdrawal?"
                      body="The player will be notified that this payout was rejected."
                      confirmLabel="Reject"
                      danger
                      onConfirm={() => update(w.id, "rejected")}
                    >
                      {(open) => (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
                          Reject
                        </button>
                      )}
                    </AdminConfirm>
                  </>
                )}
                {w.status === "approved" && (
                  <AdminConfirm
                    title="Mark as paid?"
                    body="Optionally add a payment reference."
                    confirmLabel="Mark paid"
                    promptLabel="Payment reference"
                    onConfirm={(ref) => update(w.id, "paid", ref || undefined)}
                  >
                    {(open) => (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
                        Mark paid
                      </button>
                    )}
                  </AdminConfirm>
                )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>
    </OperatorAdminShell>
  );
}
