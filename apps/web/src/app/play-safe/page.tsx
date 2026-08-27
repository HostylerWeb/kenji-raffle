import { headers } from "next/headers";
import { ProtectedAccountLink } from "@/components/ProtectedAccountLink";
import { SitePageIntro } from "@/components/SitePageIntro";
import { getSiteCopy } from "@/lib/site-copy";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function PlaySafeInfoPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  return (
    <>
      <SitePageIntro
        breadcrumb="← Home"
        title={tenant ? getSiteCopy(tenant, "play_safe.page.title") : "Play Safe"}
        lead={tenant ? getSiteCopy(tenant, "play_safe.page.lead") : undefined}
        titleCopyKey="play_safe.page.title"
        leadCopyKey="play_safe.page.lead"
      />
      <div className="site-card site-card--v2 site-card--content">
        <div className="site-prose">
          <p>
            Play Safe helps you stay in control of your raffle spending. From your account you can
            pause purchases for a period you choose, or set a weekly or monthly spending cap.
          </p>
          <ul>
            <li><strong>Purchase pause</strong> — choose 24 hours up to 30 days without buying tickets</li>
            <li><strong>Spending limit</strong> — cap ticket spend per week or month</li>
            <li>County information helps meet regulatory reporting requirements</li>
          </ul>
        </div>
        <ProtectedAccountLink href="/account/play-safe" className="site-btn site-btn--primary site-btn--sm">
          Manage Play Safe in your account
        </ProtectedAccountLink>
      </div>
    </>
  );
}
