"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { playerFetch } from "@/lib/player-api";

type Profile = {
  full_name: string | null;
  phone: string | null;
  county: string | null;
};

type ShippingAddress = {
  id: string;
  label: string | null;
  county: string | null;
  town: string | null;
  address_line: string | null;
  postal_code: string | null;
  is_default: boolean;
};

export default function AccountSettingsPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrTown, setAddrTown] = useState("");
  const [addrCounty, setAddrCounty] = useState("");
  const [addrPostal, setAddrPostal] = useState("");

  useEffect(() => {
    Promise.all([
      playerFetch<Profile>("/v1/me"),
      playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses"),
    ])
      .then(([p, addrs]) => {
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
        setCounty(p.county ?? "");
        setAddresses(addrs);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await playerFetch("/v1/account/profile", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || undefined,
          county: county || undefined,
        }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  async function addAddress(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await playerFetch("/v1/account/shipping-addresses", {
        method: "POST",
        body: JSON.stringify({
          label: addrLabel || undefined,
          address_line: addrLine,
          town: addrTown,
          county: addrCounty,
          postal_code: addrPostal,
          is_default: addresses.length === 0,
        }),
      });
      setAddresses(await playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses"));
      setAddrLabel("");
      setAddrLine("");
      setAddrTown("");
      setAddrCounty("");
      setAddrPostal("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add address");
    }
  }

  async function removeAddress(id: string) {
    setError("");
    try {
      await playerFetch(`/v1/account/shipping-addresses/${id}`, { method: "DELETE" });
      setAddresses(await playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove address");
    }
  }

  if (loading) {
    return (
      <>
        <AccountPageHeader title="Settings" description="Profile and saved addresses." />
        <div className="site-skeleton" style={{ height: 200 }} />
      </>
    );
  }

  return (
    <>
      <AccountPageHeader
        title="Settings"
        description="Update your profile and saved addresses. Spending limits and purchase pauses are in Play Safe."
      />
      {error && <p className="site-error">{error}</p>}

      <form className="site-form site-card site-settings-block" onSubmit={saveProfile}>
        <h2 className="site-section-title" style={{ marginTop: 0 }}>Profile</h2>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        </label>
        <label>
          Phone (+254)
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254712345678"
            autoComplete="tel"
          />
        </label>
        <label>
          County
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <p className="site-muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
          County is required for Play Safe and regulatory reporting.{" "}
          <Link href="/account/play-safe">Manage Play Safe →</Link>
        </p>
        {saved && <p className="site-success-text">Profile saved.</p>}
        <button type="submit" className="site-btn site-btn--primary">Save profile</button>
      </form>

      <div className="site-card site-settings-block">
        <h2 className="site-section-title" style={{ marginTop: 0 }}>Shipping addresses</h2>
        {addresses.length === 0 && (
          <p className="site-muted">No saved addresses. Add one for prize delivery or faster checkout.</p>
        )}
        <ul className="site-ticket-list" style={{ marginBottom: 16 }}>
          {addresses.map((a) => (
            <li key={a.id} className="site-ticket-pill">
              <span>
                {a.label && <strong>{a.label} — </strong>}
                {a.address_line}, {a.town}, {a.county} {a.postal_code}
                {a.is_default && " (default)"}
              </span>
              <button type="button" className="site-btn site-btn--ghost site-btn--sm" onClick={() => removeAddress(a.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form className="site-form" onSubmit={addAddress}>
          <label>Label<input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="Home" /></label>
          <label>Address<input value={addrLine} onChange={(e) => setAddrLine(e.target.value)} required /></label>
          <div className="site-form__row">
            <label>Town<input value={addrTown} onChange={(e) => setAddrTown(e.target.value)} required /></label>
            <label>
              County
              <select value={addrCounty} onChange={(e) => setAddrCounty(e.target.value)} required>
                <option value="">Select</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label>Postal code<input value={addrPostal} onChange={(e) => setAddrPostal(e.target.value)} /></label>
          <button type="submit" className="site-btn site-btn--secondary">Add address</button>
        </form>
      </div>

      <p className="site-muted site-account-section">
        <Link href="/forgot-password">Change password via email</Link>
      </p>
    </>
  );
}
