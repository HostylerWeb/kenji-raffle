import Link from "next/link";
import type { SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  titleCopyKey,
  descriptionCopyKey,
  actionCopyKey,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  titleCopyKey?: SiteCopyKey;
  descriptionCopyKey?: SiteCopyKey;
  actionCopyKey?: SiteCopyKey;
}) {
  return (
    <div className="site-empty site-empty--commerce">
      <div className="site-empty__icon" aria-hidden>
        ○
      </div>
      <h3 className="site-empty__title">
        {titleCopyKey ? (
          <SiteCopySlot copyKey={titleCopyKey}>{title}</SiteCopySlot>
        ) : (
          title
        )}
      </h3>
      {description && (
        <p className="site-muted">
          {descriptionCopyKey ? (
            <SiteCopySlot copyKey={descriptionCopyKey}>{description}</SiteCopySlot>
          ) : (
            description
          )}
        </p>
      )}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="site-btn site-btn--primary">
          {actionCopyKey ? (
            <SiteCopySlot copyKey={actionCopyKey}>{actionLabel}</SiteCopySlot>
          ) : (
            actionLabel
          )}
        </Link>
      )}
    </div>
  );
}
