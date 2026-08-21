import type { TenantPrismaClient } from "@kenji-raffle/database-tenant";
import type { Prisma } from "@kenji-raffle/database-tenant";

function decimal(value: Prisma.Decimal | number): number {
  return Number(value);
}

export async function applyQuantityDiscounts(
  client: TenantPrismaClient,
  items: Array<{
    raffle_id: string;
    ticket_quantity: number;
    unit_price: Prisma.Decimal | number;
    subtotal: Prisma.Decimal | number;
    discount_amount: Prisma.Decimal | number;
    final_amount: Prisma.Decimal | number;
  }>,
): Promise<number> {
  let totalTierDiscount = 0;

  for (const item of items) {
    const tiers = await client.raffle_quantity_discounts.findMany({
      where: { raffle_id: item.raffle_id },
      orderBy: { min_quantity: "desc" },
    });

    const applicable = tiers.find(
      (tier) => item.ticket_quantity >= tier.min_quantity,
    );
    if (!applicable) continue;

    const lineSubtotal = decimal(item.unit_price) * item.ticket_quantity;
    let tierDiscount = 0;
    if (applicable.discount_type === "percent") {
      tierDiscount = (lineSubtotal * decimal(applicable.discount_value)) / 100;
    } else {
      tierDiscount = decimal(applicable.discount_value);
    }
    tierDiscount = Math.min(tierDiscount, lineSubtotal);

    const existingDiscount = decimal(item.discount_amount);
    const newDiscount = existingDiscount + tierDiscount;
    const newFinal = lineSubtotal - newDiscount;

    await client.cart_items.updateMany({
      where: { raffle_id: item.raffle_id },
      data: {
        discount_amount: newDiscount,
        final_amount: newFinal,
        subtotal: lineSubtotal,
      },
    });

    totalTierDiscount += tierDiscount;
  }

  return totalTierDiscount;
}

export async function computeLineTierDiscount(
  client: TenantPrismaClient,
  raffleId: string,
  quantity: number,
  unitPrice: number,
): Promise<number> {
  const tiers = await client.raffle_quantity_discounts.findMany({
    where: { raffle_id: raffleId },
    orderBy: { min_quantity: "desc" },
  });

  const applicable = tiers.find((tier) => quantity >= tier.min_quantity);
  if (!applicable) return 0;

  const lineSubtotal = unitPrice * quantity;
  let tierDiscount = 0;
  if (applicable.discount_type === "percent") {
    tierDiscount = (lineSubtotal * decimal(applicable.discount_value)) / 100;
  } else {
    tierDiscount = decimal(applicable.discount_value);
  }
  return Math.min(tierDiscount, lineSubtotal);
}
