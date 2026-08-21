export type InstantWinGroup = {
  id: string;
  name: string;
  sort_order?: number;
};

export type InstantWinPrizeRow = {
  /** Client-side key for list rendering */
  key: string;
  id?: string;
  name: string;
  prize_type: "site_credit" | "cash" | "physical";
  prize_value: string;
  win_frequency: string;
  total_available: string;
  group_id: string;
  new_group_name: string;
  status: "active" | "paused" | "completed";
};

export function emptyInstantWinRow(index = 1): InstantWinPrizeRow {
  return {
    key: `iw-${Date.now()}-${index}`,
    name: "",
    prize_type: "site_credit",
    prize_value: "500",
    win_frequency: "10",
    total_available: "10",
    group_id: "",
    new_group_name: "",
    status: "active",
  };
}

export function instantWinFromApi(
  p: {
    id: string;
    name: string;
    prize_type: string;
    prize_value: number;
    win_frequency: number;
    total_available: number;
    status: string;
    group_id?: string | null;
  },
  index: number,
): InstantWinPrizeRow {
  return {
    key: p.id,
    id: p.id,
    name: p.name,
    prize_type: (p.prize_type as InstantWinPrizeRow["prize_type"]) || "site_credit",
    prize_value: String(p.prize_value),
    win_frequency: String(p.win_frequency),
    total_available: String(p.total_available),
    group_id: p.group_id ?? "",
    new_group_name: "",
    status: (p.status as InstantWinPrizeRow["status"]) || "active",
  };
}
