"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
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
  const [data, setData] = useState<DomainsResponse | null>(null);
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<{ name?: string; primary_color?: string }>(
    {},
  );

  async function load() {
    const res = await operatorFetch<DomainsResponse>("/v1/admin/domains");
    setData(res);
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<{ name: string; branding: { primary_color?: string } }>(
      "/v1/admin/settings",
    )
      .then((s) =>
        setBranding({ name: s.name, primary_color: s.branding.primary_color }),
      )
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
      setMessage(
        result.verified
          ? "DNS verified. Your domain should be live within a few minutes."
          : "DNS not detected yet. Wait 15–30 minutes and try again.",
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OperatorAdminShell title="Domains & go live" description="Connect a custom hostname after you preview on staging." branding={branding}>
      {data && (
        <>
          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>How go-live works</h2>
            <p className="muted">
              DNS is set at <strong>Cloudflare</strong> (or your registrar), not in
              this dashboard. We show the records to add; you paste them in
              Cloudflare → DNS.
            </p>
            <ol className="checklist">
              {data.go_live_steps.map((step) => (
                <li key={step.step}>
                  <strong>{step.title}</strong> — {step.detail}
                  {step.href && (
                    <>
                      {" "}
                      <Link href={step.href}>Open</Link>
                    </>
                  )}
                </li>
              ))}
            </ol>
            {data.staging_hostname && (
              <p className="muted">
                Staging / preview:{" "}
                <a href={`http://${data.staging_hostname}:3002`} target="_blank" rel="noreferrer">
                  {data.staging_hostname}
                </a>
              </p>
            )}
          </div>

          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>Your domains</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>Type</th>
                  <th>DNS</th>
                  <th>SSL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.domains.map((domain) => (
                  <tr key={domain.id}>
                    <td>{domain.hostname}</td>
                    <td>{domain.domain_type}</td>
                    <td>{domain.verification_status}</td>
                    <td>{domain.ssl_status}</td>
                    <td>
                      {domain.domain_type === "custom" &&
                        domain.verification_status !== "verified" && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={loading}
                            onClick={() => verifyDns(domain.id)}
                          >
                            Verify DNS
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>DNS records to add (Cloudflare)</h2>
            <p className="muted">
              CNAME target: <code>{data.dns_instructions.cname_target}</code>
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {data.dns_instructions.records.map((row) => (
                  <tr key={`${row.type}-${row.name}`}>
                    <td>{row.type}</td>
                    <td><code>{row.name}</code></td>
                    <td><code>{row.value}</code></td>
                    <td className="muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="muted">
              {data.dns_instructions.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>Add custom domain</h2>
            <p className="muted">
              Example: <code>www.yourbrand.co.ke</code> or{" "}
              <code>raffles.yourbrand.co.ke</code>
            </p>
            <form className="form" onSubmit={addDomain}>
              <label>
                Hostname
                <input
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="www.yourbrand.co.ke"
                  required
                />
              </label>
              {error && <p className="error">{error}</p>}
              {message && <p className="muted">{message}</p>}
              <button type="submit" className="btn" disabled={loading}>
                Add domain
              </button>
            </form>
          </div>
        </>
      )}
    </OperatorAdminShell>
  );
}
