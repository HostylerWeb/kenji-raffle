import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGraIngestRequest,
  emptyGraStakeBandDistribution,
  graStakeBandForAmount,
} from "../dist/gra-outbound.js";

describe("buildGraIngestRequest", () => {
  it("maps payment.completed to GRA payment event", () => {
    const result = buildGraIngestRequest("payment.completed", {
      payment_id: "pay-1",
      order_id: "ord-1",
      total: 1000,
      payment_method: "mpesa",
      completed_at: "2026-08-21T10:00:00.000Z",
    });

    assert.equal(result.kind, "send");
    if (result.kind !== "send") return;
    assert.equal(result.path, "/events/payment");
    assert.equal(result.body.action, "completed");
    assert.equal(result.body.payment_id, "pay-1");
    assert.equal(result.body.amount, 1000);
    assert.equal(result.body.method, "mpesa");
    assert.equal(result.body.reference, "ord-1");
  });

  it("maps play_safe without PII", () => {
    const result = buildGraIngestRequest("play_safe.activated", {
      county: "Nairobi",
      occurred_at: "2026-08-21T10:00:00.000Z",
    });

    assert.equal(result.kind, "send");
    if (result.kind !== "send") return;
    assert.equal(result.path, "/events/player-safety");
    assert.equal(result.body.event_type, "play_safe");
    assert.equal(result.body.county, "Nairobi");
    assert.equal(result.body.user_id, undefined);
  });

  it("skips play_safe when county missing", () => {
    const result = buildGraIngestRequest("play_safe.activated", {
      occurred_at: "2026-08-21T10:00:00.000Z",
    });
    assert.equal(result.kind, "skip");
  });

  it("maps session aggregate with GRA stake bands", () => {
    const distribution = emptyGraStakeBandDistribution();
    distribution["0-50"] = 3;
    distribution["101-250"] = 1;

    const result = buildGraIngestRequest("session.aggregate", {
      county: "Mombasa",
      bucket_start: "2026-08-21T09:00:00.000Z",
      session_count: 4,
      total_session_minutes: 0,
      stake_band_distribution: distribution,
    });

    assert.equal(result.kind, "send");
    if (result.kind !== "send") return;
    assert.equal(result.path, "/events/session-aggregate");
    assert.equal(result.body.session_count, 4);
    assert.equal(result.body.stake_band_distribution["0-50"], 3);
    assert.equal(result.body.stake_band_distribution["101-250"], 1);
  });

  it("maps ticket.voided with purchased_at", () => {
    const result = buildGraIngestRequest("ticket.voided", {
      ticket_id: "t-1",
      amount: 50,
      purchased_at: "2026-08-21T08:00:00.000Z",
    });

    assert.equal(result.kind, "send");
    if (result.kind !== "send") return;
    assert.equal(result.body.action, "voided");
    assert.equal(result.body.purchased_at, "2026-08-21T08:00:00.000Z");
  });
});

describe("graStakeBandForAmount", () => {
  it("uses GRA band labels", () => {
    assert.equal(graStakeBandForAmount(50), "0-50");
    assert.equal(graStakeBandForAmount(51), "51-100");
    assert.equal(graStakeBandForAmount(1001), "1001+");
  });
});
