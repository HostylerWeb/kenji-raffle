import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canRetryGraEvent,
  GRA_STUCK_PENDING_HOURS,
} from "../dist/gra-retry.js";

describe("canRetryGraEvent", () => {
  const now = new Date("2026-08-22T12:00:00.000Z");

  it("allows retry for failed events", () => {
    assert.equal(
      canRetryGraEvent({
        status: "failed",
        created_at: new Date("2026-08-22T11:00:00.000Z"),
        now,
      }),
      true,
    );
  });

  it("rejects sent events", () => {
    assert.equal(
      canRetryGraEvent({
        status: "sent",
        created_at: new Date("2026-08-20T11:00:00.000Z"),
        now,
      }),
      false,
    );
  });

  it("rejects fresh pending events", () => {
    assert.equal(
      canRetryGraEvent({
        status: "pending",
        created_at: new Date("2026-08-22T11:00:00.000Z"),
        now,
      }),
      false,
    );
  });

  it("allows retry for stuck pending events", () => {
    const stuckAt = new Date(
      now.getTime() - (GRA_STUCK_PENDING_HOURS + 1) * 60 * 60 * 1000,
    );
    assert.equal(
      canRetryGraEvent({
        status: "pending",
        created_at: stuckAt,
        now,
      }),
      true,
    );
  });
});
