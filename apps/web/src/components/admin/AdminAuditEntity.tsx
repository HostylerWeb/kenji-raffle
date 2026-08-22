"use client";

import Link from "next/link";
import { auditEntityHref, auditEntityLabel } from "@/lib/admin-audit-links";

export function AdminAuditEntity({
  entityType,
  entityId,
  entityHref,
}: {
  entityType: string;
  entityId: string | null;
  entityHref?: string | null;
}) {
  const href = auditEntityHref(entityType, entityId, entityHref);
  const label = auditEntityLabel(entityType, entityId);

  return (
    <div>
      <span className="muted">{entityType}</span>
      {entityId && (
        <>
          <br />
          {href ? (
            <Link href={href}>{label}</Link>
          ) : (
            <code className="admin-code">{entityId.slice(0, 8)}…</code>
          )}
        </>
      )}
    </div>
  );
}
