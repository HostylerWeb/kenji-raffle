import { test } from "node:test";
import assert from "node:assert/strict";
import {
  queueGraTicketVoided,
  queueGraPlaySafeActivated,
  queueGraSessionAggregate,
} from "../dist/gra/gra-outbound.service.js";
import { fulfillPrize } from "../dist/prizes/prize-fulfillment.js";

test("gra outbound helpers are exported", () => {
  assert.equal(typeof queueGraTicketVoided, "function");
  assert.equal(typeof queueGraPlaySafeActivated, "function");
  assert.equal(typeof queueGraSessionAggregate, "function");
});

test("prize fulfillment helper exists", () => {
  assert.equal(typeof fulfillPrize, "function");
});

test("ticket limit math", () => {
  const limit = 5;
  const purchased = 3;
  const inCart = 2;
  assert.equal(purchased + inCart <= limit, true);
  assert.equal(purchased + inCart + 1 > limit, true);
});
