import type { ReactNode } from "react";
import { AdminPageHeader, type AdminCrumb } from "@/components/admin/AdminPageHeader";

export function PageShell({
  crumbs,
  extra,
  actions,
  children,
}: {
  crumbs?: AdminCrumb[];
  extra?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="admin-page-shell">
      {(crumbs?.length || extra || actions) && (
        <div className="admin-page-shell__lead">
          <AdminPageHeader crumbs={crumbs} extra={extra} />
          {actions && <div className="admin-page__actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
