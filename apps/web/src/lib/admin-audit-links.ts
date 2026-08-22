export function auditEntityHref(
  entityType: string,
  entityId: string | null,
  serverHref?: string | null,
): string | null {
  if (serverHref) return serverHref;
  if (!entityId) return null;

  switch (entityType) {
    case "raffles":
      return `/admin/raffles/${entityId}`;
    case "orders":
      return `/admin/orders/${entityId}`;
    case "users":
      return `/admin/players/${entityId}`;
    case "withdrawals":
      return `/admin/withdrawals/${entityId}`;
    case "prize_claims":
      return `/admin/prize-claims/${entityId}`;
    case "operator_staff":
      return `/admin/staff?member=${entityId}`;
    case "categories":
      return "/admin/categories";
    case "coupons":
      return "/admin/coupons";
    case "operator_domains":
      return "/admin/domains";
    case "operator_settings":
      return "/admin/settings";
    default:
      return null;
  }
}

export function auditEntityLabel(entityType: string, entityId: string | null): string {
  if (!entityId) return entityType;
  return `${entityType} · ${entityId.slice(0, 8)}…`;
}
