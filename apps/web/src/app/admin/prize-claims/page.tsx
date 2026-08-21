"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Claim = {
  id: string;
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

export default function PrizeClaimsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Claim[]>("/v1/admin/prize-claims").then(setClaims);
  }, [router]);

  async function updateStatus(id: string, next: string) {
    await operatorFetch(`/v1/admin/prize-claims/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    setClaims(await operatorFetch<Claim[]>("/v1/admin/prize-claims"));
    toast(`Claim ${next}`);
  }

  const filtered = useMemo(() => {
    return claims.filter((c) => {
      const q = search.toLowerCase();
      const hay = `${c.user_email} ${c.user_name ?? ""} ${c.prize_name ?? ""}`.toLowerCase();
      return (!q || hay.includes(q)) && (!status || c.status === status);
    });
  }, [claims, search, status]);

  return (
    <OperatorAdminShell
      title="Prize claims"
      description="Ship physical prizes and track cash claim payouts."
    >
      <div className="admin-panel">
        <AdminFilters
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search player or prize…"
          hasActive={Boolean(search || status)}
          onClear={() => {
            setSearch("");
            setStatus("");
          }}
        >
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
          </select>
        </AdminFilters>
        <AdminTable
          columns={["Player", "Source", "Prize", "Type", "Details", "Status", ""]}
          isEmpty={filtered.length === 0}
          emptyTitle="No prize claims"
          emptyDescription="Claims appear when players win physical or cash prizes."
        >
          {filtered.map((c) => (
            <tr key={c.id}>
              <td>
                {c.user_name ?? c.user_email}
                <br />
                <span className="muted">{c.user_email}</span>
              </td>
              <td>{c.source}</td>
              <td>
                {c.prize_name ?? "—"}
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
                    {c.postal_code && ` ${c.postal_code}`}
                  </>
                )}
                {c.prize_type === "cash" && c.withdrawal && (
                  <>
                    Withdrawal: {c.withdrawal.method} · {c.withdrawal.status}
                  </>
                )}
                {c.prize_type === "cash" && !c.withdrawal && (
                  <span className="muted">Awaiting payout details</span>
                )}
              </td>
              <td>
                <AdminStatusBadge status={c.status} />
              </td>
              <td>
                {c.prize_type === "physical" && c.status === "pending" && (
                  <button type="button" className="btn btn-secondary" onClick={() => updateStatus(c.id, "shipped")}>
                    Mark shipped
                  </button>
                )}
                {c.prize_type === "physical" && c.status === "shipped" && (
                  <button type="button" className="btn btn-secondary" onClick={() => updateStatus(c.id, "delivered")}>
                    Mark delivered
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
