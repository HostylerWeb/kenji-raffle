"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type DomainRow = {
  id: string;
  hostname: string;
  domain_type: string;
  verification_status: string;
  ssl_status: string;
  is_primary: boolean;
};

type DnsRecord = {
  type: string;
  name: string;
  value: string;
  note: string;
};

type DomainsResponse = {
  staging_hostname: string | null;
  gra_compliance_ready?: boolean;
  domains: DomainRow[];
  dns_instructions: {
    cname_target: string;
    txt_record_name: string;
    txt_record_value: string;
    cloudflare_recommended: boolean;
    records: DnsRecord[];
    warnings: string[];
  };
  go_live_steps: Array<{
    step: number;
    title: string;
    detail: string;
    href?: string;
  }>;
};

export default function OperatorDomainsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<DomainsResponse | null>(null);
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<{ name?: string; primary_color?: string }>({});

  async function load() {
    const res = await operatorFetch<DomainsResponse>("/v1/admin/domains");
    setData(res);
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

  async function addDomain(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await operatorFetch("/v1/admin/domains", {
        method: "POST",
        body: JSON.stringify({ hostname }),
      });
      setHostname("");
      setMessage("Domain added. Add the DNS records below at Cloudflare, then verify.");
      await load();
      toast("Domain added");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setLoading(false);
    }
  }

  async function verifyDns(domainId: string) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await operatorFetch<{ verified?: boolean }>(
        `/v1/admin/domains/${domainId}/verify-dns`,
        { method: "POST" },
      );
      const msg = result.verified
        ? "DNS verified. Set as primary when ready, then ensure HTTPS in your Cloudflare SSL/TLS settings."
        : "DNS not detected yet. Wait 15–30 minutes and try again.";
      setMessage(msg);
      toast(result.verified ? "DNS verified" : "DNS not ready yet", result.verified ? "success" : "info");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function setPrimary(domainId: string) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await operatorFetch(`/v1/admin/domains/${domainId}/set-primary`, {
        method: "POST",
      });
      setMessage("Primary domain updated. Links and emails will use this hostname.");
      toast("Primary domain set", "success");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set primary domain");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OperatorAdminShell
      title="Domains & go live"
      description="Connect a custom hostname after you preview on staging."
      branding={branding}
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Domains & go live" },
        ]}
      />
      {data && (
        <>
          <div className="admin-callout">
            <div>
              <strong>How go-live works</strong>
              DNS is configured at Cloudflare (or your registrar), not in this dashboard.
              Add the records below in Cloudflare → DNS, then click Verify.
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Go-live steps</h3>
                <p className="admin-panel__subtitle">Follow these in order for a smooth launch.</p>
              </div>
            </div>
            <div className="admin-panel__body">
              <ol className="admin-checklist">
                {data.go_live_steps.map((step) => (
                  <li key={step.step}>
                    <span className="admin-checklist__step">{step.step}</span>
                    <span>
                      <strong>{step.title}</strong> — {step.detail}
                      {step.href && (
                        <>
                          {" "}
                          <Link href={step.href}>Open →</Link>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              {data.staging_hostname && (
                <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
                  Staging preview:{" "}
                  <a href={`https://${data.staging_hostname}`} target="_blank" rel="noreferrer">
                    https://{data.staging_hostname}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Your domains</h3>
                <p className="admin-panel__subtitle">{data.domains.length} hostname{data.domains.length === 1 ? "" : "s"}</p>
              </div>
            </div>
            <AdminTable
              columns={["Hostname", "Type", "DNS", "SSL", ""]}
              isEmpty={data.domains.length === 0}
              emptyTitle="No domains"
              emptyDescription="Add a custom hostname below."
            >
              {data.domains.map((domain) => (
                <tr key={domain.id}>
                  <td>
                    <strong>{domain.hostname}</strong>
                    {domain.is_primary && (
                      <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                        Primary
                      </span>
                    )}
                  </td>
                  <td>{domain.domain_type}</td>
                  <td>
                    <AdminStatusBadge status={domain.verification_status} />
                  </td>
                  <td>
                    <AdminStatusBadge status={domain.ssl_status} />
                  </td>
                  <td>
                    {domain.domain_type === "custom" && domain.verification_status !== "verified" && (
                      <AdminConfirm
                        title="Verify DNS records?"
                        body="We'll check that your CNAME and TXT records are configured at your DNS provider. Propagation can take 15–30 minutes."
                        confirmLabel="Verify DNS"
                        onConfirm={() => verifyDns(domain.id)}
                      >
                        {(open) => (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={loading}
                            onClick={open}
                          >
                            Verify DNS
                          </button>
                        )}
                      </AdminConfirm>
                    )}
                    {domain.domain_type === "custom" &&
                      domain.verification_status === "verified" &&
                      !domain.is_primary && (
                        <AdminConfirm
                          title="Use as primary domain?"
                          body="Public links and checkout emails will use this hostname. Your staging subdomain remains available."
                          confirmLabel="Set primary"
                          onConfirm={() => setPrimary(domain.id)}
                        >
                          {(open) => (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={loading}
                              onClick={open}
                            >
                              Use as primary
                            </button>
                          )}
                        </AdminConfirm>
                      )}
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          {!data.gra_compliance_ready && (
            <div className="admin-callout admin-callout--warn">
              Custom domain setup and go-live instructions are available after GRA approves your
              operator application. Complete{" "}
              <Link href="/admin/onboarding">GRA onboarding</Link> first.
            </div>
          )}

          {data.gra_compliance_ready && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">DNS records to add</h3>
                <p className="admin-panel__subtitle">
                  CNAME target: <code>{data.dns_instructions.cname_target}</code>
                </p>
              </div>
            </div>
            <div className="admin-dns-table">
              <AdminTable columns={["Type", "Name", "Value", "Note"]} isEmpty={data.dns_instructions.records.length === 0}>
                {data.dns_instructions.records.map((row) => (
                  <tr key={`${row.type}-${row.name}`}>
                    <td>{row.type}</td>
                    <td><code>{row.name}</code></td>
                    <td><code>{row.value}</code></td>
                    <td className="muted">{row.note}</td>
                  </tr>
                ))}
              </AdminTable>
            </div>
            {data.dns_instructions.warnings.length > 0 && (
              <div className="admin-panel__body" style={{ paddingTop: 0 }}>
                <ul className="muted" style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  {data.dns_instructions.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          )}

          {data.gra_compliance_ready && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Add custom domain</h3>
                <p className="admin-panel__subtitle">
                  Example: <code>www.yourbrand.co.ke</code>
                </p>
              </div>
            </div>
            <form className="admin-form-grid" onSubmit={addDomain} style={{ paddingBottom: 22 }}>
              <label className="admin-form-grid__full">
                Hostname
                <input
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="www.yourbrand.co.ke"
                  required
                />
              </label>
              {error && <p className="error admin-form-grid__full">{error}</p>}
              {message && <p className="muted admin-form-grid__full" style={{ margin: 0 }}>{message}</p>}
              <div className="admin-form-grid__full admin-form-actions" style={{ padding: 0 }}>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Adding…" : "Add domain"}
                </button>
              </div>
            </form>
          </div>
          )}
        </>
      )}
    </OperatorAdminShell>
  );
}
