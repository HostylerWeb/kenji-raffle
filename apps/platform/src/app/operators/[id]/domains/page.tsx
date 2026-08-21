"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformShell } from "../../../../components/PlatformShell";
import { StatusBadge } from "../../../../components/StatusBadge";
import { isAuthenticated, isPlatformAdmin, platformFetch } from "../../../../lib/api";

type DomainRow = {
  id: string;
  hostname: string;
  domain_type: string;
  verification_status: string;
  ssl_status: string;
};

type DomainsResponse = {
  domains: DomainRow[];
  dns_instructions: {
    cname_target: string;
    txt_record_value: string;
    steps: string[];
  };
};

export default function OperatorDomainsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const admin = isPlatformAdmin();
  const [data, setData] = useState<DomainsResponse | null>(null);
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await platformFetch<DomainsResponse>(
      `/v1/platform/operators/${params.id}/domains`,
    );
    setData(res);
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    load().catch(() => router.replace("/operators"));
  }, [params.id, router]);

  async function addDomain(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await platformFetch(`/v1/platform/operators/${params.id}/domains`, {
        method: "POST",
        body: JSON.stringify({ hostname, domain_type: "custom" }),
      });
      setHostname("");
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
      const result = await platformFetch<{
        verified?: boolean;
        error?: string;
        message?: string;
        domain?: DomainRow;
      }>(
        `/v1/platform/operators/${params.id}/domains/${domainId}/verify-dns`,
        { method: "POST" },
      );
        setMessage(
        result.verified
          ? "DNS verified. SSL status follows DNS (production TLS is terminated at the reverse proxy / cert-manager)."
          : result.error ?? result.message ?? "DNS records not found yet.",
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "DNS verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function queueVerify(domainId: string) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await platformFetch<{ message?: string }>(
        `/v1/platform/operators/${params.id}/domains/${domainId}/verify-dns-queue`,
        { method: "POST" },
      );
      setMessage(result.message ?? "DNS verification job queued.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to queue DNS verify");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlatformShell
      title="Domains"
      actions={
        <Link href={`/operators/${params.id}`} className="btn btn-secondary">
          Back to operator
        </Link>
      }
    >
      {data && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            {error && <p className="error">{error}</p>}
            {message && <p className="muted">{message}</p>}
            <table className="table">
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>Type</th>
                  <th>Verification</th>
                  <th>SSL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.domains.map((domain) => (
                  <tr key={domain.id}>
                    <td>{domain.hostname}</td>
                    <td>{domain.domain_type}</td>
                    <td>
                      <StatusBadge status={domain.verification_status} />
                    </td>
                    <td>
                      <StatusBadge status={domain.ssl_status} />
                    </td>
                    <td>
                      {admin &&
                        domain.domain_type === "custom" &&
                        domain.verification_status !== "verified" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={loading}
                              onClick={() => verifyDns(domain.id)}
                            >
                              Verify DNS
                            </button>{" "}
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={loading}
                              onClick={() => queueVerify(domain.id)}
                            >
                              Queue verify
                            </button>
                          </>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Custom domain DNS</h2>
            <ul className="muted">
              {data.dns_instructions.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="muted">
              Production HTTPS is issued at the edge (nginx / cert-manager), not
              inside this console. DNS verify only records that the hostname
              points at this platform.
            </p>
            {admin && (
              <form className="form" onSubmit={addDomain}>
                <label>
                  Custom hostname
                  <input
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    placeholder="raffles.example.com"
                  />
                </label>
                <button type="submit" className="btn" disabled={loading}>
                  Add custom domain
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </PlatformShell>
  );
}
