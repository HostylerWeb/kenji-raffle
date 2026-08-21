"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch, playerUpload } from "@/lib/player-api";

type Profile = {
  full_name: string | null;
  county: string | null;
  spending_limit: number | null;
  spending_limit_period: string | null;
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
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [county, setCounty] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("");
  const [kycUrl, setKycUrl] = useState("");
  const [kycStatus, setKycStatus] = useState("none");
  const [saved, setSaved] = useState(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrTown, setAddrTown] = useState("");
  const [addrCounty, setAddrCounty] = useState("");
  const [addrPostal, setAddrPostal] = useState("");

  useEffect(() => {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/settings");
      return;
    }
    playerFetch<Profile & { kyc_status?: string; kyc_document_url?: string | null }>("/v1/me").then((p) => {
      setFullName(p.full_name ?? "");
      setCounty(p.county ?? "");
      setLimit(p.spending_limit != null ? String(p.spending_limit) : "");
      setPeriod(p.spending_limit_period ?? "");
      setKycStatus(p.kyc_status ?? "none");
      setKycUrl(p.kyc_document_url ?? "");
    });
    playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses").then(setAddresses);
  }, [router]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    await playerFetch("/v1/account/profile", {
      method: "PATCH",
      body: JSON.stringify({
        full_name: fullName,
        county: county || undefined,
        spending_limit: limit ? Number(limit) : null,
        spending_limit_period: period || null,
      }),
    });
    setSaved(true);
  }

  async function submitKyc(e: FormEvent) {
    e.preventDefault();
    if (!kycUrl.trim()) return;
    await playerFetch("/v1/account/kyc", {
      method: "POST",
      body: JSON.stringify({ document_url: kycUrl.trim() }),
    });
    setKycStatus("pending");
  }

  async function addAddress(e: FormEvent) {
    e.preventDefault();
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
  }

  async function removeAddress(id: string) {
    await playerFetch(`/v1/account/shipping-addresses/${id}`, { method: "DELETE" });
    setAddresses(await playerFetch<ShippingAddress[]>("/v1/account/shipping-addresses"));
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Account settings</h1>
      <p><Link href="/account">← Account</Link></p>
      <form className="form card" onSubmit={saveProfile}>
        <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} /></label>
        <label>County<input value={county} onChange={(e) => setCounty(e.target.value)} /></label>
        <label>Spending limit (KES)<input value={limit} onChange={(e) => setLimit(e.target.value)} /></label>
        <label>
          Limit period
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="">None</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        {saved && <p style={{ color: "#15803d" }}>Saved.</p>}
        <button type="submit" className="btn">Save profile</button>
      </form>
      <form className="form card" style={{ marginTop: 16 }} onSubmit={submitKyc}>
        <h2 style={{ marginTop: 0 }}>KYC verification</h2>
        <p className="muted">Status: {kycStatus}</p>
        <label>
          Document URL (optional if uploading file)
          <input value={kycUrl} onChange={(e) => setKycUrl(e.target.value)} />
        </label>
        <label>
          Upload ID document (JPEG, PNG, WebP, or PDF)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const result = await playerUpload("/v1/account/kyc/upload", file);
              setKycStatus(result.kyc_status ?? "pending");
              setKycUrl(result.kyc_document_url ?? "");
            }}
          />
        </label>
        <button type="submit" className="btn btn-secondary">Submit URL for review</button>
      </form>
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Shipping addresses</h2>
        {addresses.length === 0 && <p className="muted">No saved addresses.</p>}
        <ul>
          {addresses.map((a) => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              {a.label && <strong>{a.label} </strong>}
              {a.address_line}, {a.town}, {a.county} {a.postal_code}
              {a.is_default && " (default)"}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginLeft: 8 }}
                onClick={() => removeAddress(a.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form className="form" onSubmit={addAddress}>
          <label>Label<input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} /></label>
          <label>Address<input value={addrLine} onChange={(e) => setAddrLine(e.target.value)} required /></label>
          <label>Town<input value={addrTown} onChange={(e) => setAddrTown(e.target.value)} /></label>
          <label>County<input value={addrCounty} onChange={(e) => setAddrCounty(e.target.value)} /></label>
          <label>Postal code<input value={addrPostal} onChange={(e) => setAddrPostal(e.target.value)} /></label>
          <button type="submit" className="btn btn-secondary">Add address</button>
        </form>
      </div>
      <p style={{ marginTop: 16 }}>
        <Link href="/forgot-password">Change password via email</Link>
      </p>
    </main>
  );
}
