import Link from "next/link";
import { headers } from "next/headers";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function PrivacyPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const text = tenant?.legal?.privacy_text;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Privacy policy</h1>
      <p><Link href="/">Home</Link></p>
      {text ? (
        <div className="card" style={{ whiteSpace: "pre-wrap" }}>{text}</div>
      ) : (
        <p className="muted">Privacy policy has not been configured yet.</p>
      )}
    </main>
  );
}
