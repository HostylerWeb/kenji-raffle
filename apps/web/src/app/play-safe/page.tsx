import Link from "next/link";
import { ProtectedAccountLink } from "@/components/ProtectedAccountLink";

export default function PlaySafeInfoPage() {
  return (
    <>
      <Link href="/" className="site-breadcrumb">← Home</Link>
      <h1 className="site-page-title">Play Safe</h1>
      <div className="site-card" style={{ lineHeight: 1.7 }}>
        <p>
          Play Safe helps you stay in control of your raffle spending. From your account you can
          pause purchases for a period you choose, or set a weekly or monthly spending cap.
        </p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Purchase pause</strong> — choose 24 hours up to 30 days without buying tickets</li>
          <li><strong>Spending limit</strong> — cap ticket spend per week or month</li>
          <li>County information helps meet regulatory reporting requirements</li>
        </ul>
        <p>
          <ProtectedAccountLink href="/account/play-safe" className="site-btn site-btn--primary site-btn--sm">
            Manage Play Safe in your account
          </ProtectedAccountLink>
        </p>
      </div>
    </>
  );
}
