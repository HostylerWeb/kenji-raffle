import Link from "next/link";
import type { ReactNode } from "react";

export type AdminCrumb = { href?: string; label: string };

export function AdminPageHeader({
  crumbs,
  extra,
}: {
  crumbs?: AdminCrumb[];
  extra?: ReactNode;
}) {
  if (!crumbs?.length && !extra) return null;
  return (
    <div className="admin-subheader">
      {crumbs && crumbs.length > 0 && (
        <p className="admin-breadcrumb">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`}>
              {i > 0 ? <span>/</span> : null}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </p>
      )}
      {extra}
    </div>
  );
}
