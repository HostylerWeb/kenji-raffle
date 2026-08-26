import Link from "next/link";

type SitePageIntroProps = {
  title: string;
  lead?: string;
  breadcrumb?: string;
  breadcrumbHref?: string;
};

export function SitePageIntro({
  title,
  lead,
  breadcrumb,
  breadcrumbHref = "/",
}: SitePageIntroProps) {
  return (
    <header className="site-page-intro">
      {breadcrumb && (
        <Link href={breadcrumbHref} className="site-breadcrumb">
          {breadcrumb}
        </Link>
      )}
      <h1 className="site-page-title">{title}</h1>
      {lead && <p className="site-lead">{lead}</p>}
    </header>
  );
}
