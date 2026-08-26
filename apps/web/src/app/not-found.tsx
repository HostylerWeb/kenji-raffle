import Link from "next/link";
import { SitePageIntro } from "@/components/SitePageIntro";

export default function NotFound() {
  return (
    <div className="site-page--narrow">
      <SitePageIntro title="Page not found" lead="The page you're looking for doesn't exist or has been moved." />
      <Link href="/" className="site-btn site-btn--primary">
        Back to home
      </Link>
    </div>
  );
}
