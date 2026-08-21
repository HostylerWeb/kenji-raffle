import type { ReactNode } from "react";

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <div className="admin-empty__icon" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      </div>
      <div className="admin-empty__title">{title}</div>
      {description ? <p className="admin-empty__desc">{description}</p> : null}
      {action ? <div className="admin-empty__action">{action}</div> : null}
    </div>
  );
}
