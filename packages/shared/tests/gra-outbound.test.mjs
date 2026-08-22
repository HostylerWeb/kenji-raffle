import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import { describe, it } from "node:test";
import {
  buildGraIngestRequest,
  emptyGraStakeBandDistribution,
  graStakeBandForAmount,
  postGraIngestRequest,
} from "../dist/gra-outbound.js";
import {
  classifyGraHttpResponse,
  computeNextAttemptAt,
  graIdempotencyKey,
  GraOperatorRateLimiter,
} from "../dist/gra-relay.js";

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

describe("gra relay helpers", () => {
  it("classifies HTTP responses for retry policy", () => {
    const tooMany = classifyGraHttpResponse(429, "rate limited", "30");
    assert.equal(tooMany.ok, false);
    if (tooMany.ok) return;
    assert.equal(tooMany.retryable, true);
    assert.equal(tooMany.retryAfterMs, 30_000);

    const validation = classifyGraHttpResponse(400, "bad request");
    assert.equal(validation.ok, false);
    if (validation.ok) return;
    assert.equal(validation.retryable, false);

    const server = classifyGraHttpResponse(503, "unavailable");
    assert.equal(server.ok, false);
    if (server.ok) return;
    assert.equal(server.retryable, true);
  });

  it("uses stable ticket idempotency keys", () => {
    assert.equal(
      graIdempotencyKey({
        id: "evt-1",
        event_type: "ticket.purchased",
        payload: { ticket_id: "t-99" },
      }),
      "gra-ticket-t-99",
    );
    assert.equal(
      graIdempotencyKey({
        id: "evt-2",
        event_type: "payment.completed",
        payload: { payment_id: "p-1" },
      }),
      "gra-evt-2",
    );
  });

  it("computes exponential backoff schedule", () => {
    const first = computeNextAttemptAt(0);
    const later = computeNextAttemptAt(4);
    assert.ok(later.getTime() > first.getTime());
  });

  it("rate limiter caps per-operator throughput", () => {
    const limiter = new GraOperatorRateLimiter(2);
    assert.equal(limiter.tryConsume("op-a"), true);
    assert.equal(limiter.tryConsume("op-a"), true);
    assert.equal(limiter.tryConsume("op-a"), false);
    assert.equal(limiter.tryConsume("op-b"), true);
  });
});

describe("postGraIngestRequest HMAC", () => {
  it("signs raw JSON body like GRA ingest guard", async () => {
    const secret = "sandbox_hmac_op001_secret_32chars_min";
    const apiKey = "gra_sandbox_op001_devkey0001";
    const body = { action: "completed", payment_id: "p-1", amount: 100 };

    const server = createServer((req, res) => {
      let raw = "";
      req.on("data", (chunk) => {
        raw += chunk;
      });
      req.on("end", () => {
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        const signature = req.headers["x-signature"];
        const idem = req.headers["x-idempotency-key"];
        assert.equal(signature, expected);
        assert.equal(idem, "gra-test-hmac");
        assert.equal(req.headers["x-api-key"], apiKey);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
      });
    });

    await new Promise((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    const result = await postGraIngestRequest({
      ingestBase: `http://127.0.0.1:${port}/v1`,
      apiKey,
      hmacSecret: secret,
      idempotencyKey: "gra-test-hmac",
      path: "/events/payment",
      body,
    });

    server.close();
    assert.equal(result.ok, true);
  });
});
