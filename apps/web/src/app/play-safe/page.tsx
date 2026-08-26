import { ProtectedAccountLink } from "@/components/ProtectedAccountLink";
import { SitePageIntro } from "@/components/SitePageIntro";

export default function PlaySafeInfoPage() {
  return (
    <>
      <SitePageIntro
        breadcrumb="← Home"
        title="Play Safe"
        lead="Tools to help you stay in control of your raffle spending."
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
