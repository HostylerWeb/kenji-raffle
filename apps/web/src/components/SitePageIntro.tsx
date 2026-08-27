import Link from "next/link";
import type { SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";

type SitePageIntroProps = {
  title: string;
  lead?: string;
  breadcrumb?: string;
  breadcrumbHref?: string;
  titleCopyKey?: SiteCopyKey;
  leadCopyKey?: SiteCopyKey;
};

export function SitePageIntro({
  title,
  lead,
  breadcrumb,
  breadcrumbHref = "/",
  titleCopyKey,
  leadCopyKey,
}: SitePageIntroProps) {
  const titleNode = titleCopyKey ? (
    <SiteCopySlot copyKey={titleCopyKey} as="span">
      {title}
    </SiteCopySlot>
  ) : (
    title
  );

  const leadNode =
    lead &&
    (leadCopyKey ? (
      <SiteCopySlot copyKey={leadCopyKey} as="span">
        {lead}
      </SiteCopySlot>
    ) : (
      lead
    ));

  return (
    <header className="site-page-intro">
      {breadcrumb && (
        <Link href={breadcrumbHref} className="site-breadcrumb">
          {breadcrumb}
        </Link>
      )}
      <h1 className="site-page-title">{titleNode}</h1>
      {leadNode && <p className="site-lead">{leadNode}</p>}
    </header>
  );
}
