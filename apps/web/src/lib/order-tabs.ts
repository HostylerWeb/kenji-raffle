export type OrderTabId = "all" | "pending" | "completed" | "cancelled";

export const ORDER_TABS: { id: OrderTabId; label: string; statuses: string[] | null }[] = [
  { id: "all", label: "All", statuses: null },
  { id: "pending", label: "Pending", statuses: ["pending"] },
  { id: "completed", label: "Completed", statuses: ["completed"] },
  { id: "cancelled", label: "Cancelled", statuses: ["failed", "cancelled", "refunded"] },
];

export function orderTabStatusParam(tab: OrderTabId): string | undefined {
  const match = ORDER_TABS.find((t) => t.id === tab);
  if (!match?.statuses) return undefined;
  return match.statuses.join(",");
}
