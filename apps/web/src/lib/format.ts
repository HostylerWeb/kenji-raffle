export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short draw label for commerce cards (e.g. "Draw today 9pm"). */
export function formatDrawLabel(iso: string): string {
  const draw = new Date(iso);
  const now = new Date();
  const time = draw.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const today = now.toDateString();
  const drawDay = draw.toDateString();
  if (drawDay === today) return `Draw today ${time}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (drawDay === tomorrow.toDateString()) return `Draw tomorrow ${time}`;

  const weekday = draw.toLocaleDateString("en-KE", { weekday: "long" });
  return `Draw ${weekday} ${time}`;
}
