import { headers } from "next/headers";
import { SitePageIntro } from "@/components/SitePageIntro";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function TermsPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const text = tenant?.legal?.terms_text;

  return (
    <>
      <SitePageIntro breadcrumb="← Home" title="Terms of use" />
      <div className="site-card site-card--v2 site-card--content">
        {text ? (
          <div className="site-prose site-prose--pre">{text}</div>
        ) : (
          <p className="site-muted">Terms of use have not been configured yet.</p>
        )}
      </div>
    </>
  );
}
