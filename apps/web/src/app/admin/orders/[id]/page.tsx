"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { IconCart, IconCreditCard, IconTicket } from "@/components/admin/AdminIcons";
import { AdminPagination, formatDate } from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type OrderDetail = {
  id: string;
  status: string;
  sub_total: number;
  discount: number;
  total: number;
  site_credit_applied: number;
  coupon_code: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    county: string | null;
  };
  items: {
    id: string;
    raffle_id: string;
    raffle_title: string;
    raffle_slug: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount: number;
    total: number;
  }[];
  tickets: {
    id: string;
    ticket_number: number;
    status: string;
    raffle_id: string;
    raffle_title: string;
    raffle_slug: string;
  }[];
  payments: {
    id: string;
    amount: number;
    operator_amount: number;
    tax_amount: number;
    gateway_fee_amount: number;
    status: string;
    payment_method: string | null;
    transaction_id: string | null;
    gateway_transaction_id: string | null;
    gateway_mode: string;
    created_at: string;
  }[];
};

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="admin-detail-item__label">{label}</div>
      <div className="admin-detail-item__value">{children}</div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { toast } = useAdminToast();
  const [tab, setTab] = useState("overview");
  const [order, setOrder] = useState<OrderDetail | null>(null);

  const load = useCallback(async () => {
    setOrder(await operatorFetch<OrderDetail>(`/v1/admin/orders/${id}`));
  }, [id]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/orders"));
  }, [router, load]);

  async function refund() {
    await operatorFetch(`/v1/admin/orders/${id}/refund`, { method: "POST" });
    await load();
    toast("Order refunded");
  }

  if (!order) {
    return (
      <OperatorAdminShell title="Order">
        <div className="admin-loading">
          <div className="admin-loading__spinner" />
          Loading order…
        </div>
      </OperatorAdminShell>
    );
  }

  const payment = order.payments[0];

  return (
    <OperatorAdminShell
      title={`Order ${order.id.slice(0, 8)}…`}
      description={formatDate(order.created_at)}
      actions={<AdminStatusBadge status={order.status} />}
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin/orders", label: "Orders" },
          { label: order.id.slice(0, 8) + "…" },
        ]}
      />

      <div className="admin-stat-grid">
        <AdminStatCard label="Order total" value={`KES ${order.total.toLocaleString()}`} icon={<IconCart />} tone="accent" />
        <AdminStatCard label="Line items" value={order.items.length} icon={<IconTicket />} />
        <AdminStatCard label="Tickets" value={order.tickets.length} icon={<IconTicket />} tone="success" />
        <AdminStatCard
          label="Payment"
          value={payment ? payment.status : "—"}
          icon={<IconCreditCard />}
          tone={payment?.status === "completed" ? "success" : "default"}
        />
      </div>

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "items", label: "Line items", badge: String(order.items.length) },
          { id: "tickets", label: "Tickets", badge: String(order.tickets.length) },
          { id: "payment", label: "Payment" },
        ]}
      />

      {tab === "overview" && (
        <div className="admin-tab-panel">
          <div className="admin-split">
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h3 className="admin-panel__title">Customer</h3>
              </div>
              <div className="admin-panel__body">
                <div className="admin-detail-grid">
                  <DetailItem label="Name">
                    <Link href={`/admin/players/${order.customer.id}`}>
                      {order.customer.full_name ?? order.customer.email}
                    </Link>
                  </DetailItem>
                  <DetailItem label="Email">{order.customer.email}</DetailItem>
                  <DetailItem label="Phone">{order.customer.phone ?? "—"}</DetailItem>
                  <DetailItem label="County">{order.customer.county ?? "—"}</DetailItem>
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel__header">
                <h3 className="admin-panel__title">Totals</h3>
              </div>
              <div className="admin-panel__body">
                <div className="admin-detail-grid">
                  <DetailItem label="Subtotal">KES {order.sub_total.toLocaleString()}</DetailItem>
                  <DetailItem label="Discount">KES {order.discount.toLocaleString()}</DetailItem>
                  <DetailItem label="Site credit used">
                    {order.site_credit_applied > 0 ? `KES ${order.site_credit_applied.toLocaleString()}` : "—"}
                  </DetailItem>
                  <DetailItem label="Coupon">{order.coupon_code ?? "—"}</DetailItem>
                  <DetailItem label="Total">
                    <strong>KES {order.total.toLocaleString()}</strong>
                  </DetailItem>
                  <DetailItem label="Payment method">{order.payment_method ?? "—"}</DetailItem>
                </div>
                {order.status === "completed" && (
                  <div className="admin-form-actions">
                    <AdminConfirm
                      title="Refund this order?"
                      body="Tickets will be released back to the pool and site credit restored if applicable."
                      confirmLabel="Refund"
                      danger
                      onConfirm={refund}
                    >
                      {(open) => (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
                          Refund order
                        </button>
                      )}
                    </AdminConfirm>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "items" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <AdminTable
              columns={["Raffle", "Qty", "Unit price", "Discount", "Total"]}
              isEmpty={order.items.length === 0}
              emptyTitle="No line items"
            >
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/admin/raffles/${item.raffle_id}`}>
                      <strong>{item.raffle_title}</strong>
                    </Link>
                  </td>
                  <td>{item.quantity}</td>
                  <td>KES {item.unit_price.toLocaleString()}</td>
                  <td>{item.discount > 0 ? `KES ${item.discount.toLocaleString()}` : "—"}</td>
                  <td>KES {item.total.toLocaleString()}</td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </div>
      )}

      {tab === "tickets" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <AdminTable
              columns={["Raffle", "Ticket #", "Status"]}
              isEmpty={order.tickets.length === 0}
              emptyTitle="No tickets on this order"
            >
              {order.tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/admin/raffles/${t.raffle_id}`}>{t.raffle_title}</Link>
                  </td>
                  <td>#{t.ticket_number}</td>
                  <td><AdminStatusBadge status={t.status} /></td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </div>
      )}

      {tab === "payment" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            {order.payments.length === 0 ? (
              <p className="muted admin-panel__body">No payment record.</p>
            ) : (
              <AdminTable columns={["Date", "Amount", "Operator share", "Tax", "Gateway fee", "Status", "Mode", "Transaction"]} isEmpty={false}>
                {order.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="muted">{formatDate(p.created_at)}</td>
                    <td>KES {p.amount.toLocaleString()}</td>
                    <td>KES {p.operator_amount.toLocaleString()}</td>
                    <td>KES {p.tax_amount.toLocaleString()}</td>
                    <td>KES {p.gateway_fee_amount.toLocaleString()}</td>
                    <td><AdminStatusBadge status={p.status} /></td>
                    <td>{p.gateway_mode}</td>
                    <td className="muted">{p.gateway_transaction_id ?? p.transaction_id ?? "—"}</td>
                  </tr>
                ))}
              </AdminTable>
            )}
          </div>
        </div>
      )}
    </OperatorAdminShell>
  );
}
