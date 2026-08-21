"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

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
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
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
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/claims");
      return;
    }
    playerFetch<Claim[]>("/v1/account/prize-claims").then(setClaims);
    playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses").then(setAddresses);
  }, [router]);

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

  async function saveAddress(id: string) {
    await playerFetch(`/v1/account/prize-claims/${id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setEditing(null);
    setClaims(await playerFetch<Claim[]>("/v1/account/prize-claims"));
  }

  async function requestWithdrawal(id: string) {
    await playerFetch(`/v1/account/prize-claims/${id}/withdrawal`, {
      method: "POST",
      body: JSON.stringify(withdrawForm),
    });
    setClaims(await playerFetch<Claim[]>("/v1/account/prize-claims"));
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <p><Link href="/account">← Account</Link></p>
      <h1>Prize claims</h1>

      {claims.length === 0 && (
        <p className="muted">No prize claims yet. Win a physical or cash prize to claim it here.</p>
      )}

      {claims.map((c) => (
        <div key={c.id} className="card" style={{ marginBottom: 16 }}>
          <p><strong>{c.prize_name ?? "Prize"}</strong> · {c.source}</p>
          <p className="muted">
            Type: {c.prize_type}
            {c.prize_value != null && ` · KES ${c.prize_value.toLocaleString()}`}
            · Status: {c.status}
          </p>

          {c.prize_type === "physical" && (
            <>
              {editing === c.id ? (
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {addresses.length > 0 && (
                    <label>
                      Use saved address
                      <select
                        className="input"
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
                  <input
                    className="input"
                    placeholder="Address line"
                    value={form.address_line}
                    onChange={(e) =>
                      setForm({ ...form, address_line: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Town"
                    value={form.town}
                    onChange={(e) => setForm({ ...form, town: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="County"
                    value={form.county}
                    onChange={(e) =>
                      setForm({ ...form, county: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Postal code"
                    value={form.postal_code}
                    onChange={(e) =>
                      setForm({ ...form, postal_code: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => saveAddress(c.id)}
                  >
                    Save address
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {c.address_line ? (
                    <p>
                      {c.address_line}
                      {c.town && `, ${c.town}`}
                      {c.county && `, ${c.county}`}
                      {c.postal_code && ` ${c.postal_code}`}
                    </p>
                  ) : (
                    <p className="muted">Add your shipping address.</p>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
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
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <select
                className="input"
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
              <input
                className="input"
                placeholder="Account name"
                value={withdrawForm.account_name}
                onChange={(e) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    account_name: e.target.value,
                  })
                }
              />
              <input
                className="input"
                placeholder={
                  withdrawForm.method === "mpesa"
                    ? "M-Pesa phone number"
                    : "Account number"
                }
                value={withdrawForm.account_number}
                onChange={(e) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    account_number: e.target.value,
                  })
                }
              />
              {withdrawForm.method === "bank" && (
                <input
                  className="input"
                  placeholder="Bank name"
                  value={withdrawForm.bank_name}
                  onChange={(e) =>
                    setWithdrawForm({
                      ...withdrawForm,
                      bank_name: e.target.value,
                    })
                  }
                />
              )}
              <button
                type="button"
                className="btn"
                onClick={() => requestWithdrawal(c.id)}
              >
                Request withdrawal
              </button>
            </div>
          )}

          {c.withdrawal && (
            <p style={{ marginTop: 8 }}>
              Withdrawal: {c.withdrawal.method} · KES{" "}
              {c.withdrawal.amount.toLocaleString()} · {c.withdrawal.status}
            </p>
          )}
        </div>
      ))}
    </main>
  );
}
