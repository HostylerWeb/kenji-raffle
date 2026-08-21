export function AdminStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  return (
    <span className={`admin-badge admin-badge--${key}`}>{status.replace(/_/g, " ")}</span>
  );
}
