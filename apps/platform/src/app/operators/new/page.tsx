"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformShell } from "../../../components/PlatformShell";
import { platformFetch } from "../../../lib/api";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedSlug = useMemo(() => slugifyName(name), [name]);
  const effectiveSlug = slugEdited ? slug : suggestedSlug;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const created = await platformFetch<{ id: string }>(
        "/v1/platform/operators",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            slug: effectiveSlug,
            gra_registry_id: graId,
            licence_number: licence || undefined,
          }),
        },
      );
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
          The public raffle site for this operator is built separately later.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Operator name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kenya Demo Raffles"
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
              placeholder="kenya-demo"
              required
            />
          </label>
        <p className="muted">
          Hostname: {effectiveSlug || "slug"}.kenji-raffle.local
        </p>
        <div className="card" style={{ marginBottom: 16, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Custom domains (production)</h3>
          <p className="muted">
            Point a CNAME to{" "}
            <code>
              {process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET ??
                "ingress.kenji-raffle.local"}
            </code>
            . Add the hostname on the operator Domains page after creation.
            SSL is provisioned when DNS verification succeeds.
          </p>
        </div>
        <label>
            GRA registry ID
            <input
              value={graId}
              onChange={(e) => setGraId(e.target.value)}
              placeholder="op-001"
              required
            />
          </label>
          <label>
            Licence number (optional)
            <input
              value={licence}
              onChange={(e) => setLicence(e.target.value)}
              placeholder="Same as GRA ID if omitted"
            />
          </label>
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
