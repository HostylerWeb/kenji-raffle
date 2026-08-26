import Link from "next/link";
import { headers } from "next/headers";
import { SitePageIntro } from "@/components/SitePageIntro";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function FaqPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const text = tenant?.legal?.faq_text;

  return (
    <>
      <SitePageIntro breadcrumb="← Home" title="FAQ" />
      <div className="site-card site-card--v2 site-card--content">
        {text ? (
          <div className="site-prose site-prose--pre">{text}</div>
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
