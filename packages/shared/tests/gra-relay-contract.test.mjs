import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGraIngestRequest } from "../dist/gra-outbound.js";

const paymentEventShape = (body) => {
  assert.equal(typeof body.action, "string");
  assert.ok(["completed", "failed"].includes(body.action));
  assert.equal(typeof body.payment_id, "string");
  assert.ok(body.payment_id.length > 0);
  assert.equal(typeof body.amount, "number");
  assert.equal(typeof body.occurred_at, "string");
};

const ticketEventShape = (body) => {
  assert.ok(["purchased", "voided"].includes(body.action));
  assert.equal(typeof body.ticket_id, "string");
  assert.ok(body.ticket_id.length > 0);
  assert.equal(typeof body.amount, "number");
  assert.equal(typeof body.purchased_at, "string");
};

describe("GRA ingest payload contracts", () => {
  const samples = [
    [
      "payment.completed",
      {
        payment_id: "pay-1",
        order_id: "ord-1",
        total: 500,
        completed_at: "2026-08-21T10:00:00.000Z",
      },
      "/events/payment",
      paymentEventShape,
    ],
    [
      "payment.failed",
      {
        payment_id: "pay-2",
        amount: 500,
        failed_at: "2026-08-21T10:00:00.000Z",
      },
      "/events/payment",
      paymentEventShape,
    ],
    [
      "ticket.purchased",
      {
        ticket_id: "t-1",
        amount: 100,
        purchased_at: "2026-08-21T10:00:00.000Z",
      },
      "/events/ticket",
      ticketEventShape,
    ],
    [
      "monthly.return",
      {
        reporting_year: 2026,
        reporting_month: 7,
        tickets_sold: 10,
        gross_revenue: 1000,
        prizes_paid: 200,
        expenses: 50,
        gross_gaming_revenue: 750,
        tax_paid: 0,
      },
      "/returns/monthly",
      (body) => {
        assert.equal(body.reporting_year, 2026);
        assert.equal(body.reporting_month, 7);
        assert.equal(typeof body.gross_gaming_revenue, "number");
      },
    ],
  ];

  for (const [eventType, payload, path, assertShape] of samples) {
    it(`buildGraIngestRequest(${eventType}) matches GRA contract`, () => {
      const result = buildGraIngestRequest(eventType, payload);
      assert.equal(result.kind, "send");
      if (result.kind !== "send") return;
      assert.equal(result.path, path);
      assertShape(result.body);
    });
  }
});
