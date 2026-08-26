"use client";

import { KENYA_COUNTIES } from "@/lib/kenya-counties";

export type BillingDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  town: string;
  county: string;
  postalCode: string;
};

export function splitFullName(fullName: string | null | undefined) {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function joinFullName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function isBillingComplete(billing: BillingDetails) {
  return Boolean(
    billing.firstName.trim() &&
      billing.lastName.trim() &&
      billing.email.trim() &&
      billing.phone.trim() &&
      billing.addressLine.trim() &&
      billing.town.trim() &&
      billing.county.trim(),
  );
}

type CheckoutBillingDetailsProps = {
  billing: BillingDetails;
  onChange: (billing: BillingDetails) => void;
  loading?: boolean;
};

export function CheckoutBillingDetails({
  billing,
  onChange,
  loading,
}: CheckoutBillingDetailsProps) {
  if (loading) {
    return (
      <div className="site-card site-checkout-billing" style={{ marginBottom: 20 }}>
        <div className="site-skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  function setField<K extends keyof BillingDetails>(key: K, value: BillingDetails[K]) {
    onChange({ ...billing, [key]: value });
  }

  return (
    <div className="site-card site-checkout-billing" style={{ marginBottom: 20 }}>
      <h2 className="site-section-title">Billing details</h2>
      <p className="site-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: 14 }}>
        Enter your details exactly as they should appear on your order confirmation.
      </p>
      <div className="site-form site-form--compact">
        <div className="site-form__row">
          <label>
            First name
            <input
              value={billing.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              autoComplete="given-name"
              required
            />
          </label>
          <label>
            Last name
            <input
              value={billing.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              autoComplete="family-name"
              required
            />
          </label>
        </div>
        <label>
          Email
          <input value={billing.email} readOnly className="site-input--readonly" />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            value={billing.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="+254712345678"
            autoComplete="tel"
            required
          />
        </label>
        <label>
          Street address
          <input
            value={billing.addressLine}
            onChange={(e) => setField("addressLine", e.target.value)}
            autoComplete="street-address"
            required
          />
        </label>
        <div className="site-form__row">
          <label>
            Town / city
            <input
              value={billing.town}
              onChange={(e) => setField("town", e.target.value)}
              autoComplete="address-level2"
              required
            />
          </label>
          <label>
            County
            <select
              value={billing.county}
              onChange={(e) => setField("county", e.target.value)}
              required
            >
              <option value="">Select county</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Postal code (optional)
          <input
            value={billing.postalCode}
            onChange={(e) => setField("postalCode", e.target.value)}
            autoComplete="postal-code"
          />
        </label>
      </div>
    </div>
  );
}
