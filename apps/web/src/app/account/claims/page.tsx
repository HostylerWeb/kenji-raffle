"use client";

import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch } from "@/lib/player-api";
import { formatKes } from "@/lib/format";

type Claim = {
  id: string;
  status: string;
  prize_type: string;
  prize_name: string | null;
  prize_value: number | null;
  source: string;
  county: string | null;
  town: string | null;
  address_line: string | null;
  postal_code: string | null;
  withdrawal: { id: string; status: string; method: string; amount: number } | null;
};

type ShippingAddress = {
  id: string;
  label: string | null;
  county: string | null;
  town: string | null;
  address_line: string | null;
  postal_code: string | null;
};

export default function AccountClaimsPage() {
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    county: "",
    town: "",
    address_line: "",
    postal_code: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    method: "mpesa" as "mpesa" | "bank",
    account_name: "",
    account_number: "",
    bank_name: "",
  });

  useEffect(() => {
    Promise.all([
      playerFetch<Claim[]>("/v1/account/prize-claims"),
      playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses"),
    ])
      .then(([c, a]) => {
        setClaims(c);
        setAddresses(a);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load prize claims");
        setClaims([]);
      });
  }, []);

  function applySavedAddress(addressId: string) {
    const addr = addresses.find((a) => a.id === addressId);
    if (!addr) return;
    setForm({
      county: addr.county ?? "",
      town: addr.town ?? "",
      address_line: addr.address_line ?? "",
      postal_code: addr.postal_code ?? "",
    });
  }

  async function saveAddress(claimId: string) {
    setError("");
    try {
      await playerFetch(`/v1/account/prize-claims/${claimId}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setClaims(await playerFetch<Claim[]>("/v1/account/prize-claims"));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save address");
    }
  }

  async function requestWithdrawal(claimId: string) {
    setError("");
    try {
      await playerFetch(`/v1/account/prize-claims/${claimId}/withdrawal`, {
        method: "POST",
        body: JSON.stringify(withdrawForm),
      });
      setClaims(await playerFetch<Claim[]>("/v1/account/prize-claims"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request withdrawal");
    }
  }

  if (!claims) return <div className="site-skeleton" style={{ height: 120 }} />;

  return (
    <>
      <AccountPageHeader
        title="Prize claims"
        description="Claim physical prizes or request cash withdrawals for instant wins."
      />

      {error && <p className="site-error">{error}</p>}

      {claims.length === 0 && !error && (
        <div className="site-empty site-card">
          <p className="site-empty__title">No prize claims yet</p>
          <p className="site-muted">Win a physical or cash prize to claim it here.</p>
        </div>
      )}

      {claims.map((c) => (
        <div key={c.id} className="site-card site-account-section">
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16 }}>
            {c.prize_name ?? "Prize"}
          </p>
          <p className="site-muted" style={{ margin: 0 }}>
            {c.source} · {c.prize_type}
            {c.prize_value != null && ` · ${formatKes(c.prize_value)}`}
            · Status: <strong>{c.status}</strong>
          </p>

          {c.prize_type === "physical" && (
            <>
              {editing === c.id ? (
                <div className="site-form" style={{ marginTop: 16 }}>
                  {addresses.length > 0 && (
                    <label>
                      Use saved address
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) applySavedAddress(e.target.value);
                        }}
                      >
                        <option value="">— select —</option>
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label ?? a.address_line ?? "Address"}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Address line
                    <input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} />
                  </label>
                  <div className="site-form__row">
                    <label>
                      Town
                      <input value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} />
                    </label>
                    <label>
                      County
                      <input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
                    </label>
                  </div>
                  <label>
                    Postal code
                    <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                  </label>
                  <button type="button" className="site-btn site-btn--primary" onClick={() => saveAddress(c.id)}>
                    Save address
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  {c.address_line ? (
                    <p className="site-muted">
                      {c.address_line}
                      {c.town && `, ${c.town}`}
                      {c.county && `, ${c.county}`}
                      {c.postal_code && ` ${c.postal_code}`}
                    </p>
                  ) : (
                    <p className="site-muted">Add your shipping address.</p>
                  )}
                  <button
                    type="button"
                    className="site-btn site-btn--secondary site-btn--sm"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      setEditing(c.id);
                      setForm({
                        county: c.county ?? "",
                        town: c.town ?? "",
                        address_line: c.address_line ?? "",
                        postal_code: c.postal_code ?? "",
                      });
                    }}
                  >
                    {c.address_line ? "Edit address" : "Add address"}
                  </button>
                </div>
              )}
            </>
          )}

          {c.prize_type === "cash" && !c.withdrawal && (
            <div className="site-form" style={{ marginTop: 16 }}>
              <label>
                Method
                <select
                  value={withdrawForm.method}
                  onChange={(e) =>
                    setWithdrawForm({
                      ...withdrawForm,
                      method: e.target.value as "mpesa" | "bank",
                    })
                  }
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank transfer</option>
                </select>
              </label>
              <label>
                Account name
                <input
                  value={withdrawForm.account_name}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, account_name: e.target.value })}
                />
              </label>
              <label>
                {withdrawForm.method === "mpesa" ? "M-Pesa phone number" : "Account number"}
                <input
                  value={withdrawForm.account_number}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, account_number: e.target.value })}
                />
              </label>
              {withdrawForm.method === "bank" && (
                <label>
                  Bank name
                  <input
                    value={withdrawForm.bank_name}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                  />
                </label>
              )}
              <button type="button" className="site-btn site-btn--primary" onClick={() => requestWithdrawal(c.id)}>
                Request withdrawal
              </button>
            </div>
          )}

          {c.withdrawal && (
            <p className="site-muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Withdrawal: {c.withdrawal.method} · {formatKes(c.withdrawal.amount)} · {c.withdrawal.status}
            </p>
          )}
        </div>
      ))}
    </>
  );
}
