"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type LegalProfile = {
  legal_name: string | null;
  trading_name: string | null;
  registration_number: string | null;
  kra_pin: string | null;
  beneficial_owner: string | null;
  business_email: string | null;
  business_phone: string | null;
  county: string | null;
  region: string | null;
  website: string | null;
  legal_profile_locked_at: string | null;
  gra_application_status: string;
};

type OnboardingStatus = {
  gra_registry_id: string;
  gra_application_status: string;
  legal_profile_locked: boolean;
  gra_connected: boolean;
  gra_application_submitted_at: string | null;
  gra_approved_at: string | null;
  gra_rejection_reason: string | null;
  checkout_enabled: boolean;
};

const KENYA_COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Nakuru",
  "Kisumu",
  "Machakos",
  "Other",
];

export default function OperatorOnboardingPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [profile, setProfile] = useState<LegalProfile | null>(null);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [branding, setBranding] = useState<{ name?: string; primary_color?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [legalName, setLegalName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [kraPin, setKraPin] = useState("");
  const [beneficialOwner, setBeneficialOwner] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [county, setCounty] = useState("");
  const [region, setRegion] = useState("");
  const [website, setWebsite] = useState("");

  function applyProfile(data: LegalProfile) {
    setProfile(data);
    setLegalName(data.legal_name ?? "");
    setTradingName(data.trading_name ?? "");
    setRegistrationNumber(data.registration_number ?? "");
    setKraPin(data.kra_pin ?? "");
    setBeneficialOwner(data.beneficial_owner ?? "");
    setBusinessEmail(data.business_email ?? "");
    setBusinessPhone(data.business_phone ?? "");
    setCounty(data.county ?? "");
    setRegion(data.region ?? "");
    setWebsite(data.website ?? "");
  }

  async function load() {
    const [legal, onboarding] = await Promise.all([
      operatorFetch<LegalProfile>("/v1/admin/onboarding/legal-profile"),
      operatorFetch<OnboardingStatus>("/v1/admin/onboarding/status"),
    ]);
    applyProfile(legal);
    setStatus(onboarding);
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<{ name: string; branding: { primary_color?: string } }>("/v1/admin/settings")
      .then((s) => setBranding({ name: s.name, primary_color: s.branding.primary_color }))
      .catch(() => undefined);
    load().catch(() => router.replace("/admin/login"));
  }, [router]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await operatorFetch<LegalProfile>("/v1/admin/onboarding/legal-profile", {
        method: "PATCH",
        body: JSON.stringify({
          legal_name: legalName,
          trading_name: tradingName,
          registration_number: registrationNumber,
          kra_pin: kraPin,
          beneficial_owner: beneficialOwner,
          business_email: businessEmail,
          business_phone: businessPhone,
          county,
          region,
          website: website || undefined,
        }),
      });
      applyProfile(updated);
      toast("Legal profile saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  async function confirmProfile(confirmText?: string) {
    const updated = await operatorFetch<LegalProfile>(
      "/v1/admin/onboarding/confirm-legal-profile",
      {
        method: "POST",
        body: JSON.stringify({ confirm_text: confirmText }),
      },
    );
    applyProfile(updated);
    await load();
    toast("Legal profile locked", "success");
  }

  async function requestGra() {
    setLoading(true);
    setError("");
    try {
      await operatorFetch("/v1/admin/onboarding/request-gra", { method: "POST" });
      await load();
      toast("GRA application submitted", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  }

  const locked = Boolean(profile?.legal_profile_locked_at);
  const graStatus = status?.gra_application_status ?? "not_started";

  return (
    <OperatorAdminShell
      title="GRA onboarding"
      description="Complete your legal profile and request GRA connection to enable live checkout."
      branding={branding}
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "GRA onboarding" },
        ]}
      />

      {status && (
        <div className="admin-panel" style={{ marginBottom: 16 }}>
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">Application status</h3>
              <p className="admin-panel__subtitle">
                GRA registry ID: <code>{status.gra_registry_id}</code>
              </p>
            </div>
            <AdminStatusBadge status={graStatus} />
          </div>
          <div className="admin-panel__body">
            {graStatus === "pending_review" && (
              <p>
                Your account is under GRA review. You can configure branding and raffles on your
                staging site; live checkout and custom domains unlock after approval.
              </p>
            )}
            {graStatus === "approved" && status.gra_approved_at && (
              <p>
                GRA connection approved on{" "}
                {new Date(status.gra_approved_at).toLocaleString()}. Checkout and GRA relay are
                enabled.
              </p>
            )}
            {graStatus === "rejected" && (
              <p>
                Application rejected
                {status.gra_rejection_reason ? `: ${status.gra_rejection_reason}` : ""}. Contact
                platform support to resubmit.
              </p>
            )}
            {graStatus === "not_started" && locked && (
              <p>Legal profile confirmed. Submit your GRA connection request below.</p>
            )}
            {!locked && (
              <p>Enter your company details, save, then confirm to lock them before requesting GRA.</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Step 1 — Legal profile</h3>
            <p className="admin-panel__subtitle">
              {locked ? "Locked — contact support if any detail is wrong." : "Save a draft, then confirm to lock."}
            </p>
          </div>
        </div>
        <form className="admin-form admin-panel__body" onSubmit={saveProfile}>
          <div className="admin-form__grid">
            <label>
              Legal name
              <input value={legalName} onChange={(e) => setLegalName(e.target.value)} required disabled={locked} />
            </label>
            <label>
              Trading name
              <input value={tradingName} onChange={(e) => setTradingName(e.target.value)} required disabled={locked} />
            </label>
            <label>
              Registration number
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
                disabled={locked}
              />
            </label>
            <label>
              KRA PIN
              <input value={kraPin} onChange={(e) => setKraPin(e.target.value)} required disabled={locked} />
            </label>
            <label>
              Beneficial owner
              <input
                value={beneficialOwner}
                onChange={(e) => setBeneficialOwner(e.target.value)}
                required
                disabled={locked}
              />
            </label>
            <label>
              Business email
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                required
                disabled={locked}
              />
            </label>
            <label>
              Business phone
              <input
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                required
                disabled={locked}
              />
            </label>
            <label>
              County
              <select value={county} onChange={(e) => setCounty(e.target.value)} required disabled={locked}>
                <option value="">Select county</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Region
              <input value={region} onChange={(e) => setRegion(e.target.value)} disabled={locked} />
            </label>
            <label>
              Website (optional)
              <input value={website} onChange={(e) => setWebsite(e.target.value)} disabled={locked} />
            </label>
          </div>

          {!locked && (
            <div className="admin-form__actions">
              <button type="submit" className="btn" disabled={loading}>
                Save draft
              </button>
              <AdminConfirm
                title="Lock legal profile?"
                body="Review every field carefully. After you type CONFIRM, these details cannot be changed without platform support."
                confirmLabel="Lock profile"
                promptLabel='Type CONFIRM to lock'
                onConfirm={confirmProfile}
              >
                {(open) => (
                  <button type="button" className="btn btn-secondary" disabled={loading} onClick={open}>
                    Review & lock
                  </button>
                )}
              </AdminConfirm>
            </div>
          )}
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Step 2 — Request GRA connection</h3>
            <p className="admin-panel__subtitle">
              Sends your application to GRA staff for manual approval.
            </p>
          </div>
        </div>
        <div className="admin-panel__body">
          <button
            type="button"
            className="btn"
            disabled={!locked || loading || graStatus === "pending_review" || graStatus === "approved"}
            onClick={requestGra}
          >
            Request GRA connection
          </button>
          {graStatus === "approved" && (
            <p className="muted" style={{ marginTop: 12 }}>
              Connected. Manage domains in <Link href="/admin/domains">Domains</Link>.
            </p>
          )}
        </div>
      </div>
    </OperatorAdminShell>
  );
}
