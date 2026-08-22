-- GRA relay: daily heartbeat status per operator
ALTER TABLE "operator_settings" ADD COLUMN "gra_last_heartbeat_at" TIMESTAMPTZ;
ALTER TABLE "operator_settings" ADD COLUMN "gra_last_heartbeat_status" TEXT;
ALTER TABLE "operator_settings" ADD COLUMN "gra_last_heartbeat_error" TEXT;
