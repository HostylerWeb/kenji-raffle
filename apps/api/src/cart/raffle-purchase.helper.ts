import { BadRequestException } from "@nestjs/common";

export const PURCHASABLE_RAFFLE_STATUSES = ["listed", "active"] as const;

type RafflePurchaseWindow = {
  status: string;
  start_date: Date | null;
  end_date: Date | null;
};

export function assertRaffleOpenForPurchase(
  raffle: RafflePurchaseWindow,
  now = new Date(),
): void {
  if (
    !PURCHASABLE_RAFFLE_STATUSES.includes(
      raffle.status as (typeof PURCHASABLE_RAFFLE_STATUSES)[number],
    )
  ) {
    throw new BadRequestException("Raffle is not available for purchase");
  }
  if (raffle.start_date && raffle.start_date > now) {
    throw new BadRequestException("This raffle has not started yet");
  }
  if (raffle.end_date && raffle.end_date <= now) {
    throw new BadRequestException("This raffle has ended");
  }
}

export function publicRaffleVisibilityFilter(now = new Date()) {
  return {
    AND: [
      { OR: [{ start_date: null }, { start_date: { lte: now } }] },
      { OR: [{ end_date: null }, { end_date: { gt: now } }] },
    ],
  };
}
