-- CreateEnum
CREATE TYPE "gra_application_status" AS ENUM ('not_started', 'submitted', 'pending_review', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "operator_settings" ADD COLUMN "legal_name" TEXT,
ADD COLUMN "trading_name" TEXT,
ADD COLUMN "registration_number" TEXT,
ADD COLUMN "kra_pin" TEXT,
ADD COLUMN "beneficial_owner" TEXT,
ADD COLUMN "business_email" TEXT,
ADD COLUMN "business_phone" TEXT,
ADD COLUMN "county" TEXT,
ADD COLUMN "region" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "legal_profile_locked_at" TIMESTAMPTZ(6),
ADD COLUMN "gra_application_status" "gra_application_status" NOT NULL DEFAULT 'not_started',
ADD COLUMN "gra_application_id" UUID,
ADD COLUMN "gra_application_submitted_at" TIMESTAMPTZ(6),
ADD COLUMN "gra_approved_at" TIMESTAMPTZ(6),
ADD COLUMN "gra_rejection_reason" TEXT;

-- Backfill demo operator (op-001) so existing demo checkout keeps working
UPDATE "operator_settings" os
SET
  "gra_application_status" = 'approved',
  "gra_approved_at" = NOW(),
  "feature_flags" = COALESCE(os."feature_flags", '{}'::jsonb) || '{"checkout_enabled": true}'::jsonb
FROM "operators" o
WHERE os."operator_id" = o."id"
  AND o."slug" = 'demo'
  AND os."gra_api_key_encrypted" IS NOT NULL
  AND os."gra_hmac_secret_encrypted" IS NOT NULL;
