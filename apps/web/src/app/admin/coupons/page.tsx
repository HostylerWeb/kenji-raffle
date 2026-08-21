"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
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

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Coupon[]>("/v1/admin/coupons").then(setCoupons);
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router]);

  async function refresh() {
    setCoupons(await operatorFetch<Coupon[]>("/v1/admin/coupons"));
  }

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
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(coupon: Coupon) {
    const status = coupon.status === "active" ? "disabled" : "active";
    await operatorFetch(`/v1/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await refresh();
  }

  return (
    <OperatorAdminShell
      title="Coupons"
      description="Cart discount codes."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <div className="admin-panel">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min order</th>
              <th>Uses</th>
              <th>Per user</th>
              <th>Valid</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.discount_type}</td>
                <td>{c.discount_value}</td>
                <td>{c.min_order_amount ?? "—"}</td>
                <td>
                  {c.uses_count}
                  {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                </td>
                <td>{c.max_uses_per_user ?? "—"}</td>
                <td className="muted" style={{ fontSize: 12 }}>
                  {c.valid_from ? new Date(c.valid_from).toLocaleDateString() : "—"}
                  →
                  {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "—"}
                </td>
                <td>{c.status}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => toggleStatus(c)}
                  >
                    {c.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <h3 className="admin-panel__title">New coupon</h3>
        <form className="form" onSubmit={onCreate}>
          <label>
            Code
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          <label>
            Type
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percent">percent</option>
              <option value="fixed">fixed</option>
            </select>
          </label>
          <label>
            Value
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </label>
          <label>
            Min order amount
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
            />
          </label>
          <label>
            Max uses (global)
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </label>
          <label>
            Max uses per user
            <input
              type="number"
              value={maxUsesPerUser}
              onChange={(e) => setMaxUsesPerUser(e.target.value)}
            />
          </label>
          <label>
            Valid from
            <input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </label>
          <label>
            Valid until
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </label>
          <button type="submit" className="btn" disabled={loading}>Create</button>
        </form>
      </div>
    </OperatorAdminShell>
  );
}
