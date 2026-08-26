export const PLAY_SAFE_DURATIONS = [
  { days: 1, label: "24 hours", description: "Short break — one day without purchases" },
  { days: 3, label: "3 days", description: "A few days to reset" },
  { days: 7, label: "1 week", description: "Standard cooling-off period" },
  { days: 14, label: "2 weeks", description: "Extended pause" },
  { days: 30, label: "30 days", description: "Maximum break" },
] as const;

export function playSafeDurationLabel(days: number): string {
  return PLAY_SAFE_DURATIONS.find((d) => d.days === days)?.label ?? `${days} days`;
}

export function remainingPlaySafeText(until: string): string {
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return "Your pause ends soon.";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 1) return "Less than 24 hours remaining.";
  return `${days} day${days === 1 ? "" : "s"} remaining.`;
}
