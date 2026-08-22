"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminTabs } from "@/components/admin/AdminTabs";
import {
  IconCart,
  IconCreditCard,
  IconGift,
  IconTicket,
  IconTrophy,
  IconWallet,
} from "@/components/admin/AdminIcons";
import { useAdminToast } from "@/components/admin/AdminToast";
import { AdminPagination, formatDate } from "@/components/admin/AdminPagination";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type PlayerStats = {
  completed_orders: number;
  lifetime_spend: number;
  tickets_owned: number;
  prize_claims: number;
  withdrawals: number;
  draw_wins: number;
  instant_wins: number;
};

type ShippingAddress = {
  label: string | null;
  county: string | null;
  town: string | null;
  address_line: string | null;
  postal_code: string | null;
} | null;

type PlayerProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  county: string | null;
  date_of_birth: string | null;
  email_verified_at: string | null;
  registration_ip: string | null;
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
  shipping_address: ShippingAddress;
  stats: PlayerStats;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

type OrderRow = {
  id: string;
  total: number;
  sub_total: number;
  discount: number;
  site_credit_applied: number;
  coupon_code: string | null;
  status: string;
  payment_method: string | null;
  item_count: number;
  ticket_count: number;
  created_at: string;
};

type TicketRow = {
  id: string;
  ticket_number: number;
  status: string;
  raffle_id: string;
  raffle_title: string;
  raffle_slug: string;
  raffle_status: string;
  purchased_at: string | null;
  created_at: string;
};

type ClaimRow = {
  id: string;
  source: string;
  status: string;
  prize_name: string;
  prize_type: string | null;
  prize_value: number | null;
  raffle_title: string | null;
  ticket_number: number | null;
  address: string | null;
  created_at: string;
};

type WithdrawalRow = {
  id: string;
  amount: number;
  method: string;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type PrizesData = {
  claims: Paginated<ClaimRow>;
  withdrawals: WithdrawalRow[];
  withdrawal_total: number;
};

type CreditRow = {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  order_id: string | null;
  created_at: string;
};

type ActivityData = {
  site_credit: Paginated<CreditRow>;
  recent_logins: { id: string; success: boolean; ip_address: string | null; created_at: string }[];
};

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="admin-detail-item__label">{label}</div>
      <div className="admin-detail-item__value">{children}</div>
    </div>
  );
}

export default function AdminPlayerDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { toast } = useAdminToast();
  const [tab, setTab] = useState("overview");
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [spendingLimit, setSpendingLimit] = useState("");
  const [spendingPeriod, setSpendingPeriod] = useState("weekly");

  const [orders, setOrders] = useState<Paginated<OrderRow> | null>(null);
  const [tickets, setTickets] = useState<Paginated<TicketRow> | null>(null);
  const [prizes, setPrizes] = useState<PrizesData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [tabLoading, setTabLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    const data = await operatorFetch<PlayerProfile>(`/v1/admin/players/${id}`);
    setPlayer(data);
    setSpendingPeriod(data.spending_limit_period ?? "weekly");
    setSpendingLimit(data.spending_limit != null ? String(data.spending_limit) : "");
    return data;
  }, [id]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    loadProfile().catch(() => router.replace("/admin/players"));
  }, [router, loadProfile]);

  const loadTab = useCallback(
    async (activeTab: string, page = 1) => {
      setTabLoading(true);
      try {
        if (activeTab === "orders") {
          setOrders(await operatorFetch<Paginated<OrderRow>>(`/v1/admin/players/${id}/orders?page=${page}`));
        } else if (activeTab === "tickets") {
          setTickets(await operatorFetch<Paginated<TicketRow>>(`/v1/admin/players/${id}/tickets?page=${page}`));
        } else if (activeTab === "prizes") {
          setPrizes(await operatorFetch<PrizesData>(`/v1/admin/players/${id}/prizes?page=${page}`));
        } else if (activeTab === "activity") {
          setActivity(await operatorFetch<ActivityData>(`/v1/admin/players/${id}/activity?page=${page}`));
        }
      } finally {
        setTabLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (tab !== "overview" && player) {
      void loadTab(tab, 1);
    }
  }, [tab, player, loadTab]);

  async function patch(body: Record<string, unknown>) {
    await operatorFetch(`/v1/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    await loadProfile();
    toast("Player updated");
  }

  async function saveLimits() {
    await operatorFetch(`/v1/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        spending_limit: spendingLimit ? Number(spendingLimit) : null,
        spending_limit_period: spendingLimit ? spendingPeriod : null,
      }),
    });
    await loadProfile();
    toast("Spending limits saved");
  }

  if (!player) {
    return (
      <OperatorAdminShell title="Player">
        <div className="admin-loading">
          <div className="admin-loading__spinner" />
          Loading player…
        </div>
      </OperatorAdminShell>
    );
  }

  const s = player.stats;

  return (
    <OperatorAdminShell
      title={player.full_name ?? player.email}
      description={player.email}
      actions={
        <AdminStatusBadge status={player.account_disabled ? "cancelled" : "active"} />
      }
    >
      <AdminPageHeader crumbs={[{ href: "/admin/players", label: "Players" }, { label: player.email }]} />

      <div className="admin-stat-grid">
        <AdminStatCard label="Lifetime spend" value={`KES ${s.lifetime_spend.toLocaleString()}`} icon={<IconCreditCard />} tone="accent" />
        <AdminStatCard label="Completed orders" value={s.completed_orders} icon={<IconCart />} />
        <AdminStatCard label="Tickets owned" value={s.tickets_owned} icon={<IconTicket />} tone="success" />
        <AdminStatCard label="Site credit" value={`KES ${player.site_credit_balance.toLocaleString()}`} icon={<IconWallet />} />
        <AdminStatCard label="Prize claims" value={s.prize_claims} icon={<IconGift />} href="/admin/prize-claims" />
        <AdminStatCard label="Draw wins" value={s.draw_wins} icon={<IconTrophy />} />
        <AdminStatCard label="Instant wins" value={s.instant_wins} icon={<IconGift />} tone="success" />
        <AdminStatCard label="Withdrawals" value={s.withdrawals} icon={<IconWallet />} href="/admin/withdrawals" />
      </div>

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "orders", label: "Orders", badge: s.completed_orders ? String(s.completed_orders) : undefined },
          { id: "tickets", label: "Tickets", badge: s.tickets_owned ? String(s.tickets_owned) : undefined },
          { id: "prizes", label: "Prizes", badge: s.prize_claims ? String(s.prize_claims) : undefined },
          { id: "activity", label: "Activity" },
        ]}
      />

      {tab === "overview" && (
        <div className="admin-tab-panel">
          <div className="admin-split">
            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3 className="admin-panel__title">Profile</h3>
                  <p className="admin-panel__subtitle">Contact details and verification.</p>
                </div>
              </div>
              <div className="admin-panel__body">
                <div className="admin-detail-grid">
                  <DetailItem label="Full name">{player.full_name ?? "—"}</DetailItem>
                  <DetailItem label="Email">{player.email}</DetailItem>
                  <DetailItem label="Phone">{player.phone ?? "—"}</DetailItem>
                  <DetailItem label="County">{player.county ?? "—"}</DetailItem>
                  <DetailItem label="Date of birth">{player.date_of_birth ?? "—"}</DetailItem>
                  <DetailItem label="Email verified">
                    {player.email_verified_at ? formatDate(player.email_verified_at) : "Not verified"}
                  </DetailItem>
                  <DetailItem label="Member since">{formatDate(player.created_at)}</DetailItem>
                  <DetailItem label="Last login">{formatDate(player.last_login_at)}</DetailItem>
                  <DetailItem label="Registration IP">{player.registration_ip ?? "—"}</DetailItem>
                  <DetailItem label="KYC">
                    <AdminStatusBadge status={player.kyc_status} />
                    {player.kyc_document_url && (
                      <>
                        {" · "}
                        <a href={player.kyc_document_url} target="_blank" rel="noreferrer">
                          View document
                        </a>
                      </>
                    )}
                  </DetailItem>
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3 className="admin-panel__title">Account controls</h3>
                  <p className="admin-panel__subtitle">Support actions for this player.</p>
                </div>
              </div>
              <div className="admin-panel__body">
                <p style={{ margin: "0 0 12px", fontSize: 14 }}>
                  Play Safe: <strong>{player.play_safe_active ? "Active" : "Off"}</strong>
                  {player.play_safe_until && (
                    <span className="muted"> until {formatDate(player.play_safe_until)}</span>
                  )}
                </p>
                <div className="admin-row-actions">
                  {player.kyc_status === "pending" && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => patch({ kyc_status: "verified" })}>
                      Verify KYC
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => patch({ account_disabled: !player.account_disabled })}>
                    {player.account_disabled ? "Enable account" : "Disable account"}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => patch({ play_safe_active: !player.play_safe_active })}>
                    {player.play_safe_active ? "Clear Play Safe" : "Activate Play Safe"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-split">
            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3 className="admin-panel__title">Spending limits</h3>
                  <p className="admin-panel__subtitle">
                    Current:{" "}
                    {player.spending_limit != null
                      ? `KES ${player.spending_limit.toLocaleString()} / ${player.spending_limit_period}`
                      : "None set"}
                  </p>
                </div>
              </div>
              <div className="admin-panel__body">
                <div className="admin-form-grid">
                  <label>
                    Limit (KES)
                    <input type="number" value={spendingLimit} onChange={(e) => setSpendingLimit(e.target.value)} placeholder="Leave empty to clear" />
                  </label>
                  <label>
                    Period
                    <select value={spendingPeriod} onChange={(e) => setSpendingPeriod(e.target.value)}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
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

            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3 className="admin-panel__title">Default shipping address</h3>
                  <p className="admin-panel__subtitle">Used for physical prize claims.</p>
                </div>
              </div>
              <div className="admin-panel__body">
                {player.shipping_address ? (
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                    {player.shipping_address.label && <strong>{player.shipping_address.label}<br /></strong>}
                    {player.shipping_address.address_line}
                    <br />
                    {[player.shipping_address.town, player.shipping_address.county, player.shipping_address.postal_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : (
                  <p className="muted" style={{ margin: 0 }}>No default address on file.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            {tabLoading && !orders ? (
              <p className="muted admin-panel__body">Loading orders…</p>
            ) : (
              <>
                <AdminTable
                  columns={["Date", "Total", "Items", "Tickets", "Coupon", "Credit used", "Status", ""]}
                  isEmpty={!orders?.items.length}
                  emptyTitle="No orders"
                  emptyDescription="This player has not placed any orders yet."
                >
                  {orders?.items.map((o) => (
                    <tr key={o.id}>
                      <td className="muted">{formatDate(o.created_at)}</td>
                      <td>
                        <strong>KES {o.total.toLocaleString()}</strong>
                        {o.discount > 0 && (
                          <span className="muted" style={{ display: "block", fontSize: 12 }}>
                            −KES {o.discount.toLocaleString()} discount
                          </span>
                        )}
                      </td>
                      <td>{o.item_count}</td>
                      <td>{o.ticket_count}</td>
                      <td>{o.coupon_code ?? "—"}</td>
                      <td>{o.site_credit_applied > 0 ? `KES ${o.site_credit_applied.toLocaleString()}` : "—"}</td>
                      <td><AdminStatusBadge status={o.status} /></td>
                      <td>
                        <Link href={`/admin/orders/${o.id}`} className="btn btn-secondary btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
                {orders && (
                  <AdminPagination page={orders.page} total={orders.total} limit={orders.limit} onPage={(p) => void loadTab("orders", p)} />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "tickets" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            {tabLoading && !tickets ? (
              <p className="muted admin-panel__body">Loading tickets…</p>
            ) : (
              <>
                <AdminTable
                  columns={["Raffle", "Ticket #", "Status", "Purchased", ""]}
                  isEmpty={!tickets?.items.length}
                  emptyTitle="No tickets"
                  emptyDescription="Tickets appear here after purchase."
                >
                  {tickets?.items.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link href={`/admin/raffles/${t.raffle_id}`}>
                          <strong>{t.raffle_title}</strong>
                        </Link>
                        <span className="muted" style={{ display: "block", fontSize: 12 }}>
                          {t.raffle_status}
                        </span>
                      </td>
                      <td>#{t.ticket_number}</td>
                      <td><AdminStatusBadge status={t.status} /></td>
                      <td className="muted">{formatDate(t.purchased_at ?? t.created_at)}</td>
                      <td>
                        <Link href={`/raffles/${t.raffle_slug}`} target="_blank">Public page</Link>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
                {tickets && (
                  <AdminPagination page={tickets.page} total={tickets.total} limit={tickets.limit} onPage={(p) => void loadTab("tickets", p)} />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "prizes" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Prize claims</h3>
                <p className="admin-panel__subtitle">Draw and instant-win fulfilment.</p>
              </div>
            </div>
            {tabLoading && !prizes ? (
              <p className="muted admin-panel__body">Loading prizes…</p>
            ) : (
              <>
                <AdminTable
                  columns={["Prize", "Source", "Value", "Ticket", "Status", "Date"]}
                  isEmpty={!prizes?.claims.items.length}
                  emptyTitle="No prize claims"
                >
                  {prizes?.claims.items.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/admin/prize-claims/${c.id}`}>
                          <strong>{c.prize_name}</strong>
                        </Link>
                        {c.raffle_title && (
                          <span className="muted" style={{ display: "block", fontSize: 12 }}>{c.raffle_title}</span>
                        )}
                      </td>
                      <td>{c.source === "instant_win" ? "Instant win" : "Draw"}</td>
                      <td>{c.prize_value != null ? `KES ${c.prize_value.toLocaleString()}` : "—"}</td>
                      <td>{c.ticket_number != null ? `#${c.ticket_number}` : "—"}</td>
                      <td><AdminStatusBadge status={c.status} /></td>
                      <td className="muted">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </AdminTable>
                {prizes && (
                  <AdminPagination page={prizes.claims.page} total={prizes.claims.total} limit={prizes.claims.limit} onPage={(p) => void loadTab("prizes", p)} />
                )}
              </>
            )}
          </div>

          {(prizes?.withdrawals.length ?? 0) > 0 && (
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h3 className="admin-panel__title">Withdrawals</h3>
              </div>
              <AdminTable columns={["Amount", "Method", "Status", "Date", "Note"]} isEmpty={false}>
                {prizes!.withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <Link href={`/admin/withdrawals/${w.id}`}>
                        KES {w.amount.toLocaleString()}
                      </Link>
                    </td>
                    <td>{w.method}</td>
                    <td><AdminStatusBadge status={w.status} /></td>
                    <td className="muted">{formatDate(w.created_at)}</td>
                    <td className="muted">{w.admin_note ?? "—"}</td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          )}
        </div>
      )}

      {tab === "activity" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Site credit ledger</h3>
                <p className="admin-panel__subtitle">Credits and debits on this account.</p>
              </div>
            </div>
            {tabLoading && !activity ? (
              <p className="muted admin-panel__body">Loading activity…</p>
            ) : (
              <>
                <AdminTable
                  columns={["Date", "Type", "Amount", "Note", "Order"]}
                  isEmpty={!activity?.site_credit.items.length}
                  emptyTitle="No credit transactions"
                >
                  {activity?.site_credit.items.map((r) => (
                    <tr key={r.id}>
                      <td className="muted">{formatDate(r.created_at)}</td>
                      <td>{r.type}</td>
                      <td>
                        <strong style={{ color: r.type === "credit" ? "var(--admin-success)" : undefined }}>
                          {r.type === "credit" ? "+" : "−"}KES {r.amount.toLocaleString()}
                        </strong>
                      </td>
                      <td className="muted">{r.note ?? "—"}</td>
                      <td>
                        {r.order_id ? <Link href={`/admin/orders/${r.order_id}`} className="btn btn-secondary btn-sm">View</Link> : "—"}
                      </td>
                    </tr>
                  ))}
                </AdminTable>
                {activity && (
                  <AdminPagination page={activity.site_credit.page} total={activity.site_credit.total} limit={activity.site_credit.limit} onPage={(p) => void loadTab("activity", p)} />
                )}
              </>
            )}
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <h3 className="admin-panel__title">Recent logins</h3>
            </div>
            <AdminTable
              columns={["Date", "Result", "IP"]}
              isEmpty={!activity?.recent_logins.length}
              emptyTitle="No login history"
            >
              {activity?.recent_logins.map((l) => (
                <tr key={l.id}>
                  <td className="muted">{formatDate(l.created_at)}</td>
                  <td>
                    <AdminStatusBadge status={l.success ? "completed" : "failed"} />
                  </td>
                  <td>{l.ip_address ?? "—"}</td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </div>
      )}
    </OperatorAdminShell>
  );
}
