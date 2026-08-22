"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_until: string | null;
  status: string;
};

type CouponsResponse = {
  items: Coupon[];
  total: number;
  page: number;
  limit: number;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<CouponsResponse | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setData(await operatorFetch<CouponsResponse>(`/v1/admin/coupons?${params.toString()}`));
  }, [page, search, status]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router, load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await operatorFetch("/v1/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code,
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_amount: minOrder ? Number(minOrder) : undefined,
          max_uses: maxUses ? Number(maxUses) : undefined,
          max_uses_per_user: maxUsesPerUser ? Number(maxUsesPerUser) : undefined,
          valid_from: validFrom ? new Date(validFrom).toISOString() : undefined,
          valid_until: validUntil ? new Date(validUntil).toISOString() : undefined,
        }),
      });
      setCode("");
      setPage(1);
      await load();
      toast("Coupon created");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(coupon: Coupon) {
    const next = coupon.status === "active" ? "disabled" : "active";
    await operatorFetch(`/v1/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    await load();
    toast(`Coupon ${next}`);
  }

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell
      title="Coupons"
      description="Discount codes players can apply at checkout."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Coupons</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} coupon{(data?.total ?? 0) === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search code…"
          hasActive={Boolean(search || status)}
          onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
        >
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Code", "Type", "Value", "Min order", "Uses", "Per user", "Valid", "Status", ""]}
          isEmpty={items.length === 0}
          emptyTitle="No coupons yet"
          emptyDescription="Create a discount code below to offer promotions at checkout."
        >
          {items.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.code}</strong></td>
              <td>{c.discount_type}</td>
              <td>{c.discount_type === "percent" ? `${c.discount_value}%` : `KES ${c.discount_value}`}</td>
              <td>{c.min_order_amount != null ? `KES ${c.min_order_amount}` : "—"}</td>
              <td>
                {c.uses_count}
                {c.max_uses != null ? ` / ${c.max_uses}` : ""}
              </td>
              <td>{c.max_uses_per_user ?? "—"}</td>
              <td className="muted" style={{ fontSize: 12 }}>
                {c.valid_from ? new Date(c.valid_from).toLocaleDateString() : "—"}
                {" → "}
                {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "—"}
              </td>
              <td><AdminStatusBadge status={c.status} /></td>
              <td>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleStatus(c)}>
                  {c.status === "active" ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">New coupon</h3>
            <p className="admin-panel__subtitle">Codes are case-sensitive at checkout.</p>
          </div>
        </div>
        <form className="admin-form-grid" onSubmit={onCreate} style={{ paddingBottom: 22 }}>
          <label>
            Code
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER20" required />
          </label>
          <label>
            Type
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount (KES)</option>
            </select>
          </label>
          <label>
            Value
            <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
          </label>
          <label>
            Min order (KES)
            <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="Optional" />
          </label>
          <label>
            Max uses (total)
            <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
          </label>
          <label>
            Max uses per player
            <input type="number" value={maxUsesPerUser} onChange={(e) => setMaxUsesPerUser(e.target.value)} placeholder="Unlimited" />
          </label>
          <label>
            Valid from
            <input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </label>
          <label>
            Valid until
            <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </label>
          <div className="admin-form-grid__full admin-form-actions" style={{ padding: 0 }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating…" : "Create coupon"}
            </button>
          </div>
        </form>
      </div>
    </OperatorAdminShell>
  );
}
