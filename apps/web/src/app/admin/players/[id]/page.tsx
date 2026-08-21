"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
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
  kyc_document_url: string | null;
  account_disabled: boolean;
  play_safe_active: boolean;
  play_safe_until: string | null;
  spending_limit: number | null;
  spending_limit_period: string | null;
  last_login_at: string | null;
  created_at: string;
  recent_orders: { id: string; total: number; status: string; created_at: string }[];
  recent_claims: { id: string; status: string; created_at: string }[];
  recent_tickets: {
    id: string;
    raffle_title: string;
    raffle_slug: string;
    ticket_number: number;
    status: string;
    created_at: string;
  }[];
};

export default function AdminPlayerDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { toast } = useAdminToast();
  const [player, setPlayer] = useState<Player | null>(null);
  const [spendingLimit, setSpendingLimit] = useState("");
  const [spendingPeriod, setSpendingPeriod] = useState("weekly");

  async function load() {
    setPlayer(await operatorFetch<Player>(`/v1/admin/players/${id}`));
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, id]);

  async function saveLimits() {
    await operatorFetch(`/v1/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        spending_limit: spendingLimit ? Number(spendingLimit) : null,
        spending_limit_period: spendingLimit ? spendingPeriod : null,
      }),
    });
    await load();
    toast("Spending limits saved");
  }

  async function patch(body: Record<string, unknown>) {
    await operatorFetch(`/v1/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    await load();
    toast("Player updated");
  }

  if (!player) {
    return (
      <OperatorAdminShell title="Player">
        <p className="muted">Loading…</p>
      </OperatorAdminShell>
    );
  }

  return (
    <OperatorAdminShell
      title={player.full_name ?? player.email}
      description={player.email}
    >
      <AdminPageHeader crumbs={[{ href: "/admin/players", label: "Players" }, { label: player.email }]} />

      <div className="admin-split">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">Identity</h3>
              <p className="admin-panel__subtitle">KYC, credit, and account controls.</p>
            </div>
          </div>
          <p>
            KYC <AdminStatusBadge status={player.kyc_status} />
            {player.kyc_document_url && (
              <>
                {" "}
                ·{" "}
                <a href={player.kyc_document_url} target="_blank" rel="noreferrer">
                  document
                </a>
              </>
            )}
          </p>
          <p>Site credit: KES {player.site_credit_balance.toLocaleString()}</p>
          <p>
            Play Safe: {player.play_safe_active ? "active" : "off"}
            {player.play_safe_until &&
              ` until ${new Date(player.play_safe_until).toLocaleString()}`}
          </p>
          <div className="admin-form-actions">
            {player.kyc_status === "pending" && (
              <button type="button" className="btn btn-secondary" onClick={() => patch({ kyc_status: "verified" })}>
                Verify KYC
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => patch({ account_disabled: !player.account_disabled })}
            >
              {player.account_disabled ? "Enable account" : "Disable account"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => patch({ play_safe_active: !player.play_safe_active })}
            >
              {player.play_safe_active ? "Clear Play Safe" : "Activate Play Safe"}
            </button>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">Spending limits</h3>
              <p className="admin-panel__subtitle">
                Current:{" "}
                {player.spending_limit != null
                  ? `KES ${player.spending_limit.toLocaleString()} / ${player.spending_limit_period}`
                  : "none"}
              </p>
            </div>
          </div>
          <div className="admin-form-grid">
            <label>
              Limit (KES)
              <input
                type="number"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(e.target.value)}
                placeholder={player.spending_limit != null ? String(player.spending_limit) : ""}
              />
            </label>
            <label>
              Period
              <select value={spendingPeriod} onChange={(e) => setSpendingPeriod(e.target.value)}>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
              </select>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="btn" onClick={saveLimits}>
              Save limits
            </button>
          </div>
        </div>
      </div>

      <div className="admin-split">
        <div className="admin-panel">
          <h3 className="admin-panel__title">Recent orders</h3>
          {player.recent_orders.length === 0 && <p className="muted">No orders.</p>}
          <ul>
            {player.recent_orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders#order-${o.id}`}>
                  {new Date(o.created_at).toLocaleString()} — KES {o.total.toLocaleString()} ({o.status})
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-panel">
          <h3 className="admin-panel__title">Recent tickets</h3>
          {player.recent_tickets.length === 0 && <p className="muted">No tickets.</p>}
          <ul>
            {player.recent_tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/raffles/${t.raffle_slug}`}>{t.raffle_title}</Link> #{t.ticket_number} ({t.status})
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin-panel">
        <h3 className="admin-panel__title">Recent claims</h3>
        {player.recent_claims.length === 0 && <p className="muted">No claims.</p>}
        <ul>
          {player.recent_claims.map((c) => (
            <li key={c.id}>
              {new Date(c.created_at).toLocaleString()} — {c.status}
            </li>
          ))}
        </ul>
      </div>
    </OperatorAdminShell>
  );
}
