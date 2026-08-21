import Link from "next/link";
import { headers } from "next/headers";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function TermsPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const text = tenant?.legal?.terms_text;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Terms & conditions</h1>
      <p><Link href="/">Home</Link></p>
      {text ? (
        <div className="card" style={{ whiteSpace: "pre-wrap" }}>{text}</div>
      ) : (
        <p className="muted">Terms have not been configured yet.</p>
      )}
    </main>
  );
}
