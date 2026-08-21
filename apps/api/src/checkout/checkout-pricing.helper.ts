/** Round to 2 decimal places (KES). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Split inclusive tax from gross customer payment. */
export function splitTaxInclusive(total: number, taxRate: number) {
  const taxAmount = roundMoney(total * taxRate);
  const operatorAmount = roundMoney(total - taxAmount);
  return { taxAmount, operatorAmount };
}

export type TicketWeight = {
  raffleId: string;
  ticketNumber: number;
  weight: number;
};

/**
 * Allocate cash paid across tickets proportionally by weight.
 * Weights should reflect each ticket's share after order-level coupon.
 */
export function allocateTicketPricesByWeight(
  tickets: TicketWeight[],
  cashTotal: number,
): Map<string, number> {
  const key = (raffleId: string, ticketNumber: number) =>
    `${raffleId}:${ticketNumber}`;
  const prices = new Map<string, number>();

  if (tickets.length === 0) {
    return prices;
  }

  if (cashTotal <= 0) {
    for (const ticket of tickets) {
      prices.set(key(ticket.raffleId, ticket.ticketNumber), 0);
    }
    return prices;
  }

  const totalWeight = tickets.reduce((sum, t) => sum + t.weight, 0);
  if (totalWeight <= 0) {
    for (const ticket of tickets) {
      prices.set(key(ticket.raffleId, ticket.ticketNumber), 0);
    }
    return prices;
  }

  const amounts = tickets.map((ticket) =>
    roundMoney((ticket.weight / totalWeight) * cashTotal),
  );
  const sum = roundMoney(amounts.reduce((a, b) => a + b, 0));
  const remainder = roundMoney(cashTotal - sum);
  if (amounts.length > 0) {
    amounts[amounts.length - 1] = roundMoney(
      amounts[amounts.length - 1]! + remainder,
    );
  }

  tickets.forEach((ticket, index) => {
    prices.set(key(ticket.raffleId, ticket.ticketNumber), amounts[index] ?? 0);
  });

  return prices;
}

/** Per-ticket weight after order-level coupon, before site credit. */
export function ticketWeightsForOrder(input: {
  lines: Array<{ raffleId: string; ticketNumbers: number[]; lineTotal: number }>;
  subTotal: number;
  orderDiscount: number;
}): TicketWeight[] {
  const { lines, subTotal, orderDiscount } = input;
  const preCreditTotal = Math.max(0, subTotal - orderDiscount);
  const tickets: TicketWeight[] = [];

  for (const line of lines) {
    if (line.ticketNumbers.length === 0) continue;
    const linePreCredit =
      subTotal > 0 ? (line.lineTotal / subTotal) * preCreditTotal : 0;
    const perTicket =
      linePreCredit / Math.max(line.ticketNumbers.length, 1);
    for (const ticketNumber of line.ticketNumbers) {
      tickets.push({
        raffleId: line.raffleId,
        ticketNumber,
        weight: perTicket,
      });
    }
  }

  return tickets;
}
