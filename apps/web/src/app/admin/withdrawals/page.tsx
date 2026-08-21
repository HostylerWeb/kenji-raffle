"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Withdrawal = {
  id: string;
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

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [rows, setRows] = useState<Withdrawal[]>([]);

  async function load() {
    setRows(await operatorFetch<Withdrawal[]>("/v1/admin/withdrawals"));
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router]);

  async function update(id: string, status: "approved" | "paid" | "rejected", admin_note?: string) {
    await operatorFetch(`/v1/admin/withdrawals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_note }),
    });
    await load();
    toast(`Withdrawal ${status}`);
  }

  return (
    <OperatorAdminShell title="Withdrawals" description="Approve and mark cash prize payouts.">
      <div className="admin-panel">
        <AdminTable
          columns={["Player", "Prize", "Amount", "Method", "Account", "Status", ""]}
          isEmpty={rows.length === 0}
          emptyTitle="No withdrawals"
        >
          {rows.map((w) => (
            <tr key={w.id}>
              <td>
                {w.user_name ?? w.user_email}
                <br />
                <span className="muted">{w.source}</span>
              </td>
              <td>{w.prize_name ?? "—"}</td>
              <td>KES {w.amount.toLocaleString()}</td>
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
                {w.status === "pending" && (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => update(w.id, "approved")}>
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
                        <button type="button" className="btn btn-secondary" onClick={open}>
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
                      <button type="button" className="btn btn-secondary" onClick={open}>
                        Mark paid
                      </button>
                    )}
                  </AdminConfirm>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
