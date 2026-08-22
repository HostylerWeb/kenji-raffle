"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { IconCreditCard, IconUsers } from "@/components/admin/AdminIcons";
import { formatDate } from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type WithdrawalDetail = {
  id: string;
  user_id: string;
  prize_claim_id: string | null;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  user_county: string | null;
  site_credit_balance: number;
  amount: number;
  method: string;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  status: string;
  admin_note: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  prize_name: string | null;
  prize_type: string | null;
  prize_value: number | null;
  source: string;
  raffle_id: string | null;
  raffle_title: string | null;
  raffle_slug: string | null;
  ticket_number: number | null;
  claim_status: string | null;
};

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="admin-detail-item__label">{label}</div>
      <div className="admin-detail-item__value">{children}</div>
    </div>
  );
}

export default function AdminWithdrawalDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { toast } = useAdminToast();
  const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);

  const load = useCallback(async () => {
    setWithdrawal(await operatorFetch<WithdrawalDetail>(`/v1/admin/withdrawals/${id}`));
  }, [id]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/withdrawals"));
  }, [router, load]);

  async function update(status: "approved" | "paid" | "rejected", admin_note?: string) {
    await operatorFetch(`/v1/admin/withdrawals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_note }),
    });
    await load();
    toast(`Withdrawal ${status}`);
  }

  if (!withdrawal) {
    return (
      <OperatorAdminShell title="Withdrawal">
        <div className="admin-loading">
          <div className="admin-loading__spinner" />
          Loading withdrawal…
        </div>
      </OperatorAdminShell>
    );
  }

  const isSiteCredit = !withdrawal.prize_claim_id;

  return (
    <OperatorAdminShell
      title={`KES ${withdrawal.amount.toLocaleString()} payout`}
      description={withdrawal.source}
      actions={<AdminStatusBadge status={withdrawal.status} />}
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin/withdrawals", label: "Withdrawals" },
          { label: `KES ${withdrawal.amount.toLocaleString()}` },
        ]}
      />

      <div className="admin-stat-grid">
        <AdminStatCard
          label="Amount"
          value={`KES ${withdrawal.amount.toLocaleString()}`}
          icon={<IconCreditCard />}
          tone="accent"
        />
        <AdminStatCard label="Method" value={withdrawal.method} icon={<IconCreditCard />} />
        <AdminStatCard
          label="Player"
          value={withdrawal.user_name ?? withdrawal.user_email}
          icon={<IconUsers />}
        />
        <AdminStatCard label="Status" value={withdrawal.status} icon={<IconCreditCard />} />
      </div>

      <div className="admin-split">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Payout details</h3>
          </div>
          <div className="admin-panel__body">
            <div className="admin-detail-grid">
              <DetailItem label="Source">{withdrawal.source}</DetailItem>
              <DetailItem label="Prize">{withdrawal.prize_name ?? (isSiteCredit ? "Site credit" : "—")}</DetailItem>
              <DetailItem label="Prize value">
                {withdrawal.prize_value != null ? `KES ${withdrawal.prize_value.toLocaleString()}` : "—"}
              </DetailItem>
              <DetailItem label="Ticket">
                {withdrawal.ticket_number != null ? `#${withdrawal.ticket_number}` : "—"}
              </DetailItem>
              <DetailItem label="Raffle">
                {withdrawal.raffle_title && withdrawal.raffle_id ? (
                  <Link href={`/admin/raffles/${withdrawal.raffle_id}`}>{withdrawal.raffle_title}</Link>
                ) : (
                  "—"
                )}
              </DetailItem>
              <DetailItem label="Prize claim">
                {withdrawal.prize_claim_id ? (
                  <Link href={`/admin/prize-claims/${withdrawal.prize_claim_id}`}>
                    View claim
                    {withdrawal.claim_status ? ` (${withdrawal.claim_status})` : ""}
                  </Link>
                ) : (
                  "—"
                )}
              </DetailItem>
              <DetailItem label="Requested">{formatDate(withdrawal.created_at)}</DetailItem>
              <DetailItem label="Processed">
                {withdrawal.processed_at ? formatDate(withdrawal.processed_at) : "—"}
              </DetailItem>
              <DetailItem label="Admin note">{withdrawal.admin_note ?? "—"}</DetailItem>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Player & account</h3>
          </div>
          <div className="admin-panel__body">
            <div className="admin-detail-grid">
              <DetailItem label="Name">
                <Link href={`/admin/players/${withdrawal.user_id}`}>
                  {withdrawal.user_name ?? withdrawal.user_email}
                </Link>
              </DetailItem>
              <DetailItem label="Email">{withdrawal.user_email}</DetailItem>
              <DetailItem label="Phone">{withdrawal.user_phone ?? "—"}</DetailItem>
              <DetailItem label="County">{withdrawal.user_county ?? "—"}</DetailItem>
              {isSiteCredit && (
                <DetailItem label="Site credit balance">
                  KES {withdrawal.site_credit_balance.toLocaleString()}
                </DetailItem>
              )}
              <DetailItem label="Account name">{withdrawal.account_name ?? "—"}</DetailItem>
              <DetailItem label="Account number">{withdrawal.account_number ?? "—"}</DetailItem>
              <DetailItem label="Bank">{withdrawal.bank_name ?? "—"}</DetailItem>
            </div>

            <div className="admin-row-actions" style={{ marginTop: 20 }}>
              {withdrawal.status === "pending" && (
                <>
                  <button type="button" className="btn btn-sm" onClick={() => update("approved")}>
                    Approve
                  </button>
                  <AdminConfirm
                    title="Reject withdrawal?"
                    body="The player will be notified that this payout was rejected."
                    confirmLabel="Reject"
                    danger
                    onConfirm={() => update("rejected")}
                  >
                    {(open) => (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
                        Reject
                      </button>
                    )}
                  </AdminConfirm>
                </>
              )}
              {withdrawal.status === "approved" && (
                <AdminConfirm
                  title="Mark as paid?"
                  body="Optionally add a payment reference."
                  confirmLabel="Mark paid"
                  promptLabel="Payment reference"
                  onConfirm={(ref) => update("paid", ref || undefined)}
                >
                  {(open) => (
                    <button type="button" className="btn btn-sm" onClick={open}>
                      Mark paid
                    </button>
                  )}
                </AdminConfirm>
              )}
            </div>
          </div>
        </div>
      </div>
    </OperatorAdminShell>
  );
}
