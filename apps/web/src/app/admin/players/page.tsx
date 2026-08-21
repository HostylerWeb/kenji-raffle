"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Player = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  county: string | null;
  site_credit_balance: number;
  kyc_status: string;
  account_disabled: boolean;
  last_login_at: string | null;
  created_at: string;
};

type ListResponse = {
  items: Player[];
  total: number;
};

export default function AdminPlayersPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;

  async function load(q?: string, pageNum = page) {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    params.set("page", String(pageNum));
    params.set("limit", String(limit));
    const data = await operatorFetch<ListResponse>(`/v1/admin/players?${params.toString()}`);
    setPlayers(data.items);
    setTotal(data.total);
    setPage(pageNum);
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router]);

  async function updatePlayer(
    id: string,
    patch: { account_disabled?: boolean; kyc_status?: string },
  ) {
    await operatorFetch(`/v1/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    await load(search);
    toast("Player updated");
  }

  return (
    <OperatorAdminShell
      title="Players"
      description={`${total} registered player${total === 1 ? "" : "s"}.`}
    >
      <div className="admin-panel">
        <AdminFilters
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search email, name, phone…"
          hasActive={Boolean(search)}
          onClear={() => {
            setSearch("");
            load("", 1);
          }}
        >
          <button type="button" className="btn" onClick={() => load(search, 1)}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Player", "Credit", "KYC", "Status", "Last login", ""]}
          isEmpty={players.length === 0}
          emptyTitle="No players"
          emptyDescription="Players appear after they register."
        >
          {players.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/players/${p.id}`}>
                  <strong>{p.full_name ?? p.email}</strong>
                </Link>
                <br />
                <span className="muted">{p.email}</span>
              </td>
              <td>KES {p.site_credit_balance.toLocaleString()}</td>
              <td>
                <AdminStatusBadge status={p.kyc_status} />
              </td>
              <td>
                <AdminStatusBadge status={p.account_disabled ? "cancelled" : "active"} />
              </td>
              <td className="muted">
                {p.last_login_at ? new Date(p.last_login_at).toLocaleString() : "—"}
              </td>
              <td>
                {p.kyc_status === "pending" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => updatePlayer(p.id, { kyc_status: "verified" })}
                  >
                    Verify KYC
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    updatePlayer(p.id, { account_disabled: !p.account_disabled })
                  }
                >
                  {p.account_disabled ? "Enable" : "Disable"}
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
        {total > limit && (
          <div className="admin-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => load(search, page - 1)}
            >
              Previous
            </button>
            <span className="muted">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => load(search, page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </OperatorAdminShell>
  );
}
