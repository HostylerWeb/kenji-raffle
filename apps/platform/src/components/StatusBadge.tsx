export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "ok"
      : status === "onboarding" || status === "provisioning"
        ? "pending"
        : status === "suspended"
          ? "warn"
          : status === "onboarding_failed" || status === "failed"
            ? "bad"
            : "muted";

  return <span className={`badge badge-${tone}`}>{status}</span>;
}
