"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformShell } from "../../../components/PlatformShell";
import { platformFetch } from "../../../lib/api";

const TENANT_BASE_DOMAIN =
  process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ?? "force42.com";
const CNAME_TARGET =
  process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET ?? "customers.force42.com";

function slugifyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function NewOperatorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [graId, setGraId] = useState("");
  const [licence, setLicence] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedSlug = useMemo(() => slugifyName(name), [name]);
  const effectiveSlug = slugEdited ? slug : suggestedSlug;
  const stagingHostname = effectiveSlug
    ? `${effectiveSlug}.${TENANT_BASE_DOMAIN}`
    : `slug.${TENANT_BASE_DOMAIN}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const created = await platformFetch<{
        id: string;
        owner_login?: { email: string; temporary_password?: string };
      }>("/v1/platform/operators", {
        method: "POST",
        body: JSON.stringify({
          name,
          slug: effectiveSlug,
          gra_registry_id: graId || undefined,
          licence_number: licence || undefined,
          owner_email: ownerEmail.trim() || undefined,
          owner_password: ownerPassword || undefined,
        }),
      });
      if (created.owner_login?.temporary_password) {
        window.alert(
          `Operator created. Owner login: ${created.owner_login.email} / ${created.owner_login.temporary_password}`,
        );
      } else if (created.owner_login?.email) {
        window.alert(
          `Operator created. Owner login email: ${created.owner_login.email}`,
        );
      }
      router.push(`/operators/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create operator");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlatformShell title="New operator">
      <div className="card">
        <p className="muted" style={{ marginBottom: 16 }}>
          Creates the operator record and queues tenant database provisioning.
          When the worker finishes, the public site is live at{" "}
          <code>{stagingHostname}</code> (player site + <code>/admin</code>).
          The operator completes GRA onboarding in their admin console — no manual
          GRA pre-registration required.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Operator name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Safari Jackpot Raffles"
              required
            />
          </label>
          <label>
            Slug (subdomain)
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              placeholder="safarijackpot"
              required
            />
          </label>
          <p className="muted">
            Staging hostname: <code>{stagingHostname}</code>
          </p>
          <div className="card" style={{ marginBottom: 16, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Custom domains (later)</h3>
            <p className="muted">
              After creation, the operator adds their own hostname in Admin →
              Domains and points a CNAME at their Cloudflare to{" "}
              <code>{CNAME_TARGET}</code>. HTTPS on their domain is configured in{" "}
              <strong>their</strong> Cloudflare account (Rafflex-style).
            </p>
          </div>
          <label>
            GRA registry ID (optional)
            <input
              value={graId}
              onChange={(e) => setGraId(e.target.value)}
              placeholder={`op-${effectiveSlug || "slug"}`}
            />
          </label>
          <p className="muted">
            Defaults to <code>op-{"{slug}"}</code> when omitted. GRA staff approve the
            connection after the operator submits their legal profile.
          </p>
          <label>
            Licence number (optional)
            <input
              value={licence}
              onChange={(e) => setLicence(e.target.value)}
              placeholder="Same as GRA ID if omitted"
            />
          </label>
          <div className="card" style={{ marginBottom: 16, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Owner admin login (optional)</h3>
            <p className="muted">
              Sets the initial <code>/admin</code> owner account when the tenant
              database is provisioned. Defaults to{" "}
              <code>{`owner@${effectiveSlug || "slug"}.local`}</code> with password{" "}
              <code>ChangeMe123!</code> when omitted.
            </p>
            <label>
              Owner email
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder={`owner@${effectiveSlug || "slug"}.local`}
              />
            </label>
            <label>
              Owner password
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Min 8 characters (optional)"
                minLength={8}
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating…" : "Create operator"}
            </button>
            <Link href="/operators" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </PlatformShell>
  );
}
