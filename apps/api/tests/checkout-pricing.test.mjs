import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allocateTicketPricesByWeight,
  splitTaxInclusive,
  ticketWeightsForOrder,
} from "../dist/checkout/checkout-pricing.helper.js";

describe("splitTaxInclusive", () => {
  it("rounds tax and operator share to 2dp", () => {
    const { taxAmount, operatorAmount } = splitTaxInclusive(1000, 0.3);
    assert.equal(taxAmount, 300);
    assert.equal(operatorAmount, 700);
    assert.equal(taxAmount + operatorAmount, 1000);
  });
});

describe("allocateTicketPricesByWeight", () => {
  it("sums to cash total with coupon applied", () => {
    const weights = ticketWeightsForOrder({
      lines: [
        {
          raffleId: "r1",
          ticketNumbers: [1, 2],
          lineTotal: 200,
        },
        {
          raffleId: "r2",
          ticketNumbers: [3],
          lineTotal: 100,
        },
      ],
      subTotal: 300,
      orderDiscount: 30,
    });

    const prices = allocateTicketPricesByWeight(weights, 270);
    const sum = [...prices.values()].reduce((a, b) => a + b, 0);
    assert.equal(Math.round(sum * 100) / 100, 270);
  });
});
