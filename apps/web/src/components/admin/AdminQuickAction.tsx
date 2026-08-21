import Link from "next/link";
import type { ReactNode } from "react";

export function AdminQuickAction({
  href,
  icon,
  label,
  description,
  external,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  description: string;
  external?: boolean;
}) {
  const className = "admin-quick-action-v2";
  const content = (
    <>
      <span className="admin-quick-action-v2__icon">{icon}</span>
      <span className="admin-quick-action-v2__text">
        <span className="admin-quick-action-v2__label">{label}</span>
        <span className="admin-quick-action-v2__desc">{description}</span>
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
