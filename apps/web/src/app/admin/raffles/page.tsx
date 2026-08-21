"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Raffle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  ticket_price: number;
  is_featured: boolean;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AdminRafflesPage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Raffle[]>("/v1/admin/raffles")
      .then(setRaffles)
      .catch(() => router.replace("/admin/login"));
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router]);

  const filtered = useMemo(() => {
    return raffles.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
      const matchesStatus = !status || r.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [raffles, search, status]);

  return (
    <OperatorAdminShell
      title="Raffles"
      description="Create raffles, configure instant wins, and go live from one editor."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
      actions={
        <Link href="/admin/raffles/new" className="btn">
          New raffle
        </Link>
      }
    >
      <div className="admin-panel">
        <AdminFilters
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search title or slug…"
          hasActive={Boolean(search || status)}
          onClear={() => {
            setSearch("");
            setStatus("");
          }}
        >
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">draft</option>
            <option value="listed">listed</option>
            <option value="active">active</option>
            <option value="drawn">drawn</option>
            <option value="cancelled">cancelled</option>
          </select>
        </AdminFilters>
        <AdminTable
          columns={["Title", "Status", "Price", "Featured", ""]}
          isEmpty={filtered.length === 0}
          emptyTitle="No raffles yet"
          emptyDescription="Create your first raffle with optional instant wins."
          emptyAction={
            <Link href="/admin/raffles/new" className="btn">
              New raffle
            </Link>
          }
        >
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/raffles/${r.id}`}>
                  <strong>{r.title}</strong>
                </Link>
              </td>
              <td>
                <AdminStatusBadge status={r.status} />
              </td>
              <td>KES {r.ticket_price.toLocaleString()}</td>
              <td>{r.is_featured ? "Yes" : "—"}</td>
              <td>
                <Link href={`/admin/raffles/${r.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
