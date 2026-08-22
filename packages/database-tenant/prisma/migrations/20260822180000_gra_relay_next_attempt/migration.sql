-- GRA relay: deferred retry scheduling per event
ALTER TABLE "gra_outbound_events" ADD COLUMN "next_attempt_at" TIMESTAMPTZ;

CREATE INDEX "gra_outbound_events_status_next_attempt_at_created_at_idx"
  ON "gra_outbound_events" ("status", "next_attempt_at", "created_at");
