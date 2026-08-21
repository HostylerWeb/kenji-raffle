import type { Prisma } from "@kenji-raffle/database-tenant";

type PrizeType = "physical" | "cash" | "site_credit";

type TxClient = {
  users: {
    update: (args: {
      where: { id: string };
      data: { site_credit_balance: { increment: Prisma.Decimal | number } };
    }) => Promise<unknown>;
  };
  prize_claims: {
    create: (args: {
      data: {
        user_id: string;
        winner_id?: string;
        instant_win_award_id?: string;
        status: "pending";
      };
    }) => Promise<unknown>;
  };
  site_credit_transactions: {
    create: (args: {
      data: {
        user_id: string;
        amount: Prisma.Decimal | number;
        type: "credit" | "debit";
        note?: string;
        order_id?: string;
      };
    }) => Promise<unknown>;
  };
};

export async function fulfillPrize(
  tx: TxClient,
  userId: string,
  prizeType: PrizeType,
  prizeValue: number,
  context: {
    winnerId?: string;
    instantWinAwardId?: string;
    orderId?: string;
    note?: string;
  },
): Promise<void> {
  if (prizeType === "site_credit" && prizeValue > 0) {
    await tx.users.update({
      where: { id: userId },
      data: { site_credit_balance: { increment: prizeValue } },
    });
    await tx.site_credit_transactions.create({
      data: {
        user_id: userId,
        amount: prizeValue,
        type: "credit",
        note: context.note ?? "Prize credit",
        order_id: context.orderId,
      },
    });
    return;
  }

  if (prizeType === "physical") {
    await tx.prize_claims.create({
      data: {
        user_id: userId,
        winner_id: context.winnerId,
        instant_win_award_id: context.instantWinAwardId,
        status: "pending",
      },
    });
    return;
  }

  if (prizeType === "cash") {
    await tx.prize_claims.create({
      data: {
        user_id: userId,
        winner_id: context.winnerId,
        instant_win_award_id: context.instantWinAwardId,
        status: "pending",
      },
    });
  }
}
