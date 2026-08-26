import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="site-empty site-empty--commerce">
      <div className="site-empty__icon" aria-hidden>
        ○
      </div>
      <h3 className="site-empty__title">{title}</h3>
      {description && <p className="site-muted">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="site-btn site-btn--primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
