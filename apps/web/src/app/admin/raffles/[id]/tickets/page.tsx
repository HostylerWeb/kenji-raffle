"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type TicketRow = {
  id: string;
  ticket_number: number;
  status: string;
  user_id: string | null;
  reserved_until: string | null;
};

type TicketList = {
  items: TicketRow[];
  total: number;
  page: number;
  limit: number;
};

type Summary = {
  available: number;
  reserved: number;
  purchased: number;
  cancelled: number;
  winning: number;
  total: number;
};

type RaffleMeta = {
  id: string;
  title: string;
  slug: string;
  max_entries: number;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

const STATUSES = ["", "available", "reserved", "purchased", "cancelled", "winning"];

export default function RaffleTicketsPage() {
  const params = useParams();
  const raffleId = String(params.id);
  const router = useRouter();
  const [raffle, setRaffle] = useState<RaffleMeta | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tickets, setTickets] = useState<TicketList | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useAdminToast();

  const load = useCallback(async () => {
    const data = await operatorFetch<RaffleMeta & { ticket_counts?: Summary }>(
      `/v1/admin/raffles/${raffleId}`,
    );
    setRaffle({
      id: data.id,
      title: data.title,
      slug: data.slug,
      max_entries: data.max_entries,
    });
    const sum = await operatorFetch<Summary>(
      `/v1/admin/raffles/${raffleId}/tickets/summary`,
    );
    setSummary(sum);
    const list = await operatorFetch<TicketList>(
      `/v1/admin/raffles/${raffleId}/tickets?page=${page}&limit=50${
        statusFilter ? `&status=${statusFilter}` : ""
      }`,
    );
    setTickets(list);
  }, [raffleId, page, statusFilter]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/raffles"));
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router, load]);

  async function generateTickets() {
    setLoading(true);
    setError("");
    try {
      await operatorFetch(`/v1/admin/raffles/${raffleId}/tickets/generate`, {
        method: "POST",
      });
      setPage(1);
      await load();
      toast("Ticket pool generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setLoading(false);
    }
  }

  if (!raffle) return null;

  return (
    <OperatorAdminShell
      title={`Tickets — ${raffle.title}`}
      description="Inspect ticket numbers. Generate the pool from the raffle editor when possible."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin/raffles", label: "Raffles" },
          { href: `/admin/raffles/${raffleId}`, label: raffle.title },
          { label: "Tickets" },
        ]}
      />

      {error && <p className="error">{error}</p>}

      <div className="admin-panel">
        <p>
          Pool size: <strong>{raffle.max_entries}</strong>
        </p>
        {summary && (
          <p className="muted">
            Available {summary.available} · Reserved {summary.reserved} ·
            Purchased {summary.purchased} · Cancelled {summary.cancelled} ·
            Winning {summary.winning} · Total {summary.total}
          </p>
        )}
        {summary?.total === 0 && (
          <button type="button" className="btn" disabled={loading} onClick={generateTickets}>
            Generate ticket pool
          </button>
        )}
      </div>

      <div className="admin-panel">
        <AdminFilters>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </select>
        </AdminFilters>
        <AdminTable
          columns={["#", "Status", "User", "Reserved until"]}
          isEmpty={!tickets || tickets.items.length === 0}
          emptyTitle="No tickets"
          emptyDescription="Generate the pool from Go live on the raffle, or use the button above."
        >
          {tickets?.items.map((t) => (
            <tr key={t.id}>
              <td>{t.ticket_number}</td>
              <td>
                <AdminStatusBadge status={t.status} />
              </td>
              <td className="muted">{t.user_id ?? "—"}</td>
              <td className="muted">
                {t.reserved_until ? new Date(t.reserved_until).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </AdminTable>
        {tickets && tickets.total > tickets.limit && (
          <div className="admin-form-actions">
            <button type="button" className="btn btn-secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span className="muted">
              Page {tickets.page} of {Math.ceil(tickets.total / tickets.limit)}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page >= Math.ceil(tickets.total / tickets.limit) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </OperatorAdminShell>
  );
}
