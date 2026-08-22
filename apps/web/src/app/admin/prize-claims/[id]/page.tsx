"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatDate } from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type ClaimDetail = {
  id: string;
  user_id: string;
  status: string;
  prize_type: string;
  prize_value: number | null;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  county: string | null;
  town: string | null;
  address_line: string | null;
  postal_code: string | null;
  source: string;
  prize_name: string | null;
  raffle_id: string | null;
  raffle_title: string | null;
  raffle_slug: string | null;
  ticket_number: number | null;
  withdrawal: {
    id: string;
    status: string;
    method: string;
    amount: number;
    account_name: string | null;
    account_number: string | null;
    bank_name: string | null;
    admin_note: string | null;
    created_at?: string;
  } | null;
  withdrawals?: {
    id: string;
    status: string;
    method: string;
    amount: number;
    account_name: string | null;
    account_number: string | null;
    bank_name: string | null;
    admin_note: string | null;
    created_at?: string;
    processed_at?: string | null;
  }[];
  created_at: string;
  updated_at: string;
};

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="admin-detail-item__label">{label}</div>
      <div className="admin-detail-item__value">{children}</div>
    </div>
  );
}

export default function AdminPrizeClaimDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { toast } = useAdminToast();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);

  const load = useCallback(async () => {
    setClaim(await operatorFetch<ClaimDetail>(`/v1/admin/prize-claims/${id}`));
  }, [id]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/prize-claims"));
  }, [router, load]);

  async function updateStatus(next: string) {
    await operatorFetch(`/v1/admin/prize-claims/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    await load();
    toast(`Claim marked ${next}`);
  }

  if (!claim) {
    return (
      <OperatorAdminShell title="Prize claim">
        <div className="admin-loading">
          <div className="admin-loading__spinner" />
          Loading claim…
        </div>
      </OperatorAdminShell>
    );
  }

  const address = [claim.address_line, claim.town, claim.county, claim.postal_code].filter(Boolean).join(", ");

  return (
    <OperatorAdminShell
      title={claim.prize_name ?? "Prize claim"}
      description={claim.source}
      actions={<AdminStatusBadge status={claim.status} />}
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin/prize-claims", label: "Prize claims" },
          { label: claim.prize_name ?? "Claim" },
        ]}
      />

      <div className="admin-split">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Prize details</h3>
          </div>
          <div className="admin-panel__body">
            <div className="admin-detail-grid">
              <DetailItem label="Prize">{claim.prize_name ?? "—"}</DetailItem>
              <DetailItem label="Type">{claim.prize_type}</DetailItem>
              <DetailItem label="Value">
                {claim.prize_value != null ? `KES ${claim.prize_value.toLocaleString()}` : "—"}
              </DetailItem>
              <DetailItem label="Source">{claim.source}</DetailItem>
              <DetailItem label="Ticket">
                {claim.ticket_number != null ? `#${claim.ticket_number}` : "—"}
              </DetailItem>
              <DetailItem label="Raffle">
                {claim.raffle_title && claim.raffle_id ? (
                  <Link href={`/admin/raffles/${claim.raffle_id}`}>{claim.raffle_title}</Link>
                ) : (
                  "—"
                )}
              </DetailItem>
              <DetailItem label="Claimed">{formatDate(claim.created_at)}</DetailItem>
              <DetailItem label="Last updated">{formatDate(claim.updated_at)}</DetailItem>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Player</h3>
          </div>
          <div className="admin-panel__body">
            <div className="admin-detail-grid">
              <DetailItem label="Name">
                <Link href={`/admin/players/${claim.user_id}`}>
                  {claim.user_name ?? claim.user_email}
                </Link>
              </DetailItem>
              <DetailItem label="Email">{claim.user_email}</DetailItem>
              <DetailItem label="Phone">{claim.user_phone ?? "—"}</DetailItem>
            </div>
            {claim.prize_type === "physical" && (
              <>
                <h4 className="admin-panel__title" style={{ marginTop: 20, marginBottom: 8 }}>
                  Shipping address
                </h4>
                <p style={{ margin: 0, fontSize: 14 }}>{address || "No address provided"}</p>
                <div className="admin-row-actions" style={{ marginTop: 16 }}>
                  {claim.status === "pending" && (
                    <button type="button" className="btn btn-sm" onClick={() => updateStatus("shipped")}>
                      Mark shipped
                    </button>
                  )}
                  {claim.status === "shipped" && (
                    <button type="button" className="btn btn-sm" onClick={() => updateStatus("delivered")}>
                      Mark delivered
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {(claim.withdrawals?.length ?? (claim.withdrawal ? 1 : 0)) > 0 && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Withdrawal / payout</h3>
          </div>
          <AdminTable columns={["Amount", "Method", "Account", "Status", "Note", "Date"]} isEmpty={false}>
            {(claim.withdrawals ?? (claim.withdrawal ? [claim.withdrawal] : [])).map((w) => (
              <tr key={w.id}>
                <td>
                  <Link href={`/admin/withdrawals/${w.id}`}>
                    KES {w.amount.toLocaleString()}
                  </Link>
                </td>
                <td>{w.method}</td>
                <td>
                  {w.account_name && <>{w.account_name}<br /></>}
                  {w.account_number}
                  {w.bank_name && <><br />{w.bank_name}</>}
                </td>
                <td><AdminStatusBadge status={w.status} /></td>
                <td className="muted">{w.admin_note ?? "—"}</td>
                <td className="muted">{formatDate(w.created_at ?? claim.created_at)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}
    </OperatorAdminShell>
  );
}
