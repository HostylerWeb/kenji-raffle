"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminQuickAction } from "@/components/admin/AdminQuickAction";
import {
  IconCart,
  IconCreditCard,
  IconGift,
  IconTicket,
  IconTrophy,
  IconUsers,
  IconWallet,
} from "@/components/admin/AdminIcons";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Dashboard = {
  operator_name: string;
  slug: string;
  staff_count: number;
  raffle_count: number;
  active_raffles: number;
  almost_sold_out_raffles: number;
  almost_sold_out_threshold: number;
  orders_today: number;
  pending_claims: number;
  pending_withdrawals: number;
  revenue_today: number;
  tickets_sold_today: number;
  staging_hostname: string | null;
  custom_domain_verified: boolean;
};

type Settings = {
  branding: { primary_color?: string };
};

export default function OperatorAdminPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }

    Promise.all([
      operatorFetch<Dashboard>("/v1/admin/dashboard"),
      operatorFetch<Settings>("/v1/admin/settings"),
    ])
      .then(([dash, sett]) => {
        setDashboard(dash);
        setSettings(sett);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!dashboard) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        Loading dashboard…
      </div>
    );
  }

  const stagingUrl = dashboard.staging_hostname
    ? `http://${dashboard.staging_hostname}:3002`
    : null;

  return (
    <OperatorAdminShell
      title="Dashboard"
      description={`Here's what's happening with ${dashboard.operator_name} today.`}
      branding={{
        name: dashboard.operator_name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      {dashboard.almost_sold_out_raffles > 0 && (
        <div className="admin-alert admin-alert--success">
          <svg className="admin-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
          <div>
            <div className="admin-alert__title">Selling well</div>
            <div className="admin-alert__body">
              {dashboard.almost_sold_out_raffles} active raffle
              {dashboard.almost_sold_out_raffles === 1 ? " is" : "s are"} almost sold out (≤{" "}
              {dashboard.almost_sold_out_threshold} tickets left).{" "}
              <Link href="/admin/raffles">View raffles →</Link>
            </div>
          </div>
        </div>
      )}

      {dashboard.custom_domain_verified && (
        <div className="admin-alert admin-alert--success">
          <svg className="admin-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
          <div>
            <div className="admin-alert__title">You&apos;re live</div>
            <div className="admin-alert__body">
              Custom domain verified — your public site is ready for players.
            </div>
          </div>
        </div>
      )}

      <div className="admin-stat-grid">
        <AdminStatCard
          label="Revenue today"
          value={`KES ${Number(dashboard.revenue_today ?? 0).toLocaleString()}`}
          icon={<IconCreditCard />}
          tone="accent"
        />
        <AdminStatCard
          label="Orders today"
          value={dashboard.orders_today}
          href="/admin/orders"
          icon={<IconCart />}
        />
        <AdminStatCard
          label="Tickets sold today"
          value={dashboard.tickets_sold_today}
          icon={<IconTicket />}
          tone="success"
        />
        <AdminStatCard
          label="Active raffles"
          value={dashboard.active_raffles}
          href="/admin/raffles"
          icon={<IconTicket />}
        />
        <AdminStatCard
          label="Pending claims"
          value={dashboard.pending_claims}
          href="/admin/prize-claims"
          icon={<IconGift />}
          tone={dashboard.pending_claims > 0 ? "warning" : "default"}
        />
        <AdminStatCard
          label="Pending withdrawals"
          value={dashboard.pending_withdrawals}
          href="/admin/withdrawals"
          icon={<IconWallet />}
          tone={dashboard.pending_withdrawals > 0 ? "warning" : "default"}
        />
        <AdminStatCard
          label="Total raffles"
          value={dashboard.raffle_count}
          href="/admin/raffles"
          icon={<IconTrophy />}
        />
        <AdminStatCard
          label="Staff members"
          value={dashboard.staff_count}
          href="/admin/staff"
          icon={<IconUsers />}
        />
      </div>

      <div className="admin-dashboard-grid">
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Quick actions</h3>
            <p className="admin-panel__subtitle">Common tasks for your raffle site</p>
          </div>
        </div>
        <div className="admin-quick-actions-v2">
          <AdminQuickAction
            href="/admin/raffles/new"
            icon={<IconTicket />}
            label="New raffle"
            description="Create a raffle with optional instant wins"
          />
          <AdminQuickAction
            href="/admin/orders"
            icon={<IconCart />}
            label="View orders"
            description="Track purchases and payments"
          />
          <AdminQuickAction
            href="/admin/players"
            icon={<IconUsers />}
            label="Manage players"
            description="Accounts, limits, and activity"
          />
          <AdminQuickAction
            href="/admin/reports"
            icon={<IconCreditCard />}
            label="Reports"
            description="Revenue, GGR, and exports"
          />
          {stagingUrl && (
            <AdminQuickAction
              href={stagingUrl}
              icon={<IconTrophy />}
              label="Open staging site"
              description="Preview the public player experience"
              external
            />
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Go live checklist</h3>
            <p className="admin-panel__subtitle">
              Build on staging first, then connect your own domain via Cloudflare DNS.
            </p>
          </div>
        </div>
        <ol className="admin-checklist">
          <li>
            <span className="admin-checklist__step">1</span>
            <span>
              <strong>Customise</strong> — colours and content in{" "}
              <Link href="/admin/settings">Settings</Link>, raffles in{" "}
              <Link href="/admin/raffles">Raffles</Link>.
            </span>
          </li>
          <li>
            <span className="admin-checklist__step">2</span>
            <span>
              <strong>Preview</strong> —{" "}
              {stagingUrl ? (
                <a href={stagingUrl} target="_blank" rel="noreferrer">
                  open staging site
                </a>
              ) : (
                "use your staging URL"
              )}
              .
            </span>
          </li>
          <li>
            <span className="admin-checklist__step">3</span>
            <span>
              <strong>Connect domain</strong> — add hostname and DNS in{" "}
              <Link href="/admin/domains">Domains</Link>.
            </span>
          </li>
          <li>
            <span className="admin-checklist__step">4</span>
            <span>
              <strong>Verify DNS</strong> — click Verify after records propagate (15–30 min).
            </span>
          </li>
        </ol>
      </div>
      </div>
    </OperatorAdminShell>
  );
}
