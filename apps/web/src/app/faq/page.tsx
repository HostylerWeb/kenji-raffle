import Link from "next/link";
import { headers } from "next/headers";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function FaqPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const text = tenant?.legal?.faq_text;

  return (
    <>
      <Link href="/" className="site-breadcrumb">← Home</Link>
      <h1 className="site-page-title">FAQ</h1>
      <div className="site-card" style={{ lineHeight: 1.7 }}>
        {text ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>
        ) : (
          <p className="site-muted">
            FAQ content has not been configured yet. Please{" "}
            <Link href="/contact">contact the operator</Link> for assistance.
          </p>
        )}
      </div>
    </>
  );
}
