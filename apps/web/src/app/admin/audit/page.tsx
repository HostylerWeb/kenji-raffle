"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminAuditEntity } from "@/components/admin/AdminAuditEntity";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTable } from "@/components/admin/AdminTable";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_href?: string | null;
  staff_id: string | null;
  staff_email?: string;
  created_at: string;
};

type AuditResponse = {
  items: AuditRow[];
  total: number;
  page: number;
  limit: number;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

const ENTITY_TYPES = [
  "",
  "raffles",
  "orders",
  "users",
  "withdrawals",
  "prize_claims",
  "coupons",
  "categories",
  "operator_staff",
  "prizes",
];

export default function AuditPage() {
  const router = useRouter();
  const [data, setData] = useState<AuditResponse | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    if (entityType) params.set("entity_type", entityType);
    const [audit, sett] = await Promise.all([
      operatorFetch<AuditResponse>(`/v1/admin/audit-logs?${params.toString()}`),
      operatorFetch<Settings>("/v1/admin/settings"),
    ]);
    setData(audit);
    setSettings(sett);
  }, [page, search, entityType]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/login"));
  }, [router, load]);

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell
      title="Audit log"
      description="Staff actions on this operator account."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Recent activity</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} event{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search action, entity, staff…"
          hasActive={Boolean(search || entityType)}
          onClear={() => { setSearch(""); setEntityType(""); setPage(1); }}
        >
          <select
            className="admin-select"
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t || "all"} value={t}>
                {t ? t : "All entity types"}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Time", "Action", "Entity", "Staff"]}
          isEmpty={items.length === 0}
          emptyTitle="No audit events yet"
          emptyDescription="Staff actions will appear here automatically."
        >
          {items.map((row) => (
            <tr key={row.id}>
              <td className="muted">{new Date(row.created_at).toLocaleString()}</td>
              <td>{row.action}</td>
              <td>
                <AdminAuditEntity
                  entityType={row.entity_type}
                  entityId={row.entity_id}
                  entityHref={row.entity_href}
                />
              </td>
              <td>
                {row.staff_email && row.staff_id ? (
                  <Link href={`/admin/staff?member=${row.staff_id}`}>{row.staff_email}</Link>
                ) : (
                  row.staff_email ?? "—"
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>
    </OperatorAdminShell>
  );
}
