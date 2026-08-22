export const GRA_STUCK_PENDING_HOURS = 6;

export function canRetryGraEvent(input: {
  status: string;
  created_at: Date;
  now?: Date;
}): boolean {
  if (input.status === "failed") return true;
  if (input.status !== "pending") return false;
  const now = input.now ?? new Date();
  const stuckMs = GRA_STUCK_PENDING_HOURS * 60 * 60 * 1000;
  return input.created_at.getTime() < now.getTime() - stuckMs;
}
