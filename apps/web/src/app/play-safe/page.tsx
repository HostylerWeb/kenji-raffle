import Link from "next/link";
import { ProtectedAccountLink } from "@/components/ProtectedAccountLink";

export default function PlaySafeInfoPage() {
  return (
    <>
      <Link href="/" className="site-breadcrumb">← Home</Link>
      <h1 className="site-page-title">Play Safe</h1>
      <div className="site-card" style={{ lineHeight: 1.7 }}>
        <p>
          Play Safe helps you stay in control of your raffle spending. You can activate
          cooling-off periods and spending limits from your account at any time.
        </p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Self-exclusion blocks new purchases for a chosen period</li>
          <li>Spending limits cap how much you can spend per week or month</li>
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
