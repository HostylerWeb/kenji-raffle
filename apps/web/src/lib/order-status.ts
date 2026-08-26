const STATUS_MAP: Record<string, string> = {
  paid: "site-badge--success",
  completed: "site-badge--success",
  pending: "site-badge--warning",
  pending_payment: "site-badge--warning",
  processing: "site-badge--warning",
  failed: "site-badge--danger",
  cancelled: "site-badge--danger",
  refunded: "site-badge--muted",
};

export function orderStatusClass(status: string): string {
  return STATUS_MAP[status] ?? "site-badge--muted";
}

export function formatOrderStatus(status: string): string {
  return status.replace(/_/g, " ");
}
