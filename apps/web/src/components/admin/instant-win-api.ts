"use client";

import { operatorFetch } from "@/lib/api";
import {
  emptyInstantWinRow,
  type InstantWinGroup,
  type InstantWinPrizeRow,
} from "./raffle-form-types";

export async function loadInstantWinGroups(
  raffleId: string,
): Promise<InstantWinGroup[]> {
  return operatorFetch<InstantWinGroup[]>(
    `/v1/admin/raffles/${raffleId}/instant-win-groups`,
  );
}

export async function saveInstantWinPrizes(
  raffleId: string,
  rows: InstantWinPrizeRow[],
  existingGroups: InstantWinGroup[],
): Promise<InstantWinGroup[]> {
  const groups = [...existingGroups];
  const groupIdByName = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));

  async function resolveGroupId(row: InstantWinPrizeRow): Promise<string | undefined> {
    if (row.group_id) return row.group_id;
    const name = row.new_group_name.trim();
    if (!name) return undefined;
    const existing = groupIdByName.get(name.toLowerCase());
    if (existing) return existing;
    const created = await operatorFetch<{ id: string; name: string }>(
      `/v1/admin/raffles/${raffleId}/instant-win-groups`,
      { method: "POST", body: JSON.stringify({ name }) },
    );
    groups.push(created);
    groupIdByName.set(name.toLowerCase(), created.id);
    return created.id;
  }

  for (const row of rows) {
    if (!row.name.trim()) continue;

    const body = {
      name: row.name.trim(),
      prize_type: row.prize_type,
      prize_value: Number(row.prize_value),
      win_frequency: Number(row.win_frequency),
      total_available: Number(row.total_available),
      group_id: await resolveGroupId(row),
      status: row.status,
    };

    if (row.id) {
      await operatorFetch(
        `/v1/admin/raffles/${raffleId}/instant-win-prizes/${row.id}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
    } else {
      await operatorFetch(`/v1/admin/raffles/${raffleId}/instant-win-prizes`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
  }

  return groups;
}

export async function deleteInstantWinPrize(raffleId: string, prizeId: string) {
  await operatorFetch(
    `/v1/admin/raffles/${raffleId}/instant-win-prizes/${prizeId}`,
    { method: "DELETE" },
  );
}

export async function syncInstantWinPrizes(
  raffleId: string,
  rows: InstantWinPrizeRow[],
  existingGroups: InstantWinGroup[],
  removedIds: string[] = [],
): Promise<InstantWinGroup[]> {
  for (const id of removedIds) {
    await deleteInstantWinPrize(raffleId, id);
  }
  return saveInstantWinPrizes(raffleId, rows, existingGroups);
}

export function validateInstantWinRows(
  rows: InstantWinPrizeRow[],
  maxEntries: number,
): string | null {
  const filled = rows.filter((r) => r.name.trim());
  if (filled.length === 0) return null;

  for (const row of filled) {
    const freq = Number(row.win_frequency);
    const total = Number(row.total_available);
    const value = Number(row.prize_value);
    if (!row.name.trim()) return "Each instant win prize needs a name.";
    if (!Number.isFinite(value) || value < 0) return `"${row.name}" needs a valid prize value.`;
    if (!Number.isFinite(freq) || freq < 1)
      return `"${row.name}" — “Every N tickets” must be at least 1.`;
    if (!Number.isFinite(total) || total < 1)
      return `"${row.name}" — “Number of wins” must be at least 1.`;
    const lastWinTicket = freq * total;
    if (lastWinTicket > maxEntries) {
      return `"${row.name}" would need ticket ${lastWinTicket}, but max entries is only ${maxEntries}. Lower wins or frequency.`;
    }
  }
  return null;
}

export { emptyInstantWinRow };
